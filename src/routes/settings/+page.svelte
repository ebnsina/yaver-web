<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import { isUnauthorized } from '$lib/api/client';
	import { me } from '$lib/api/auth';
	import { getChatSettings, saveChatSettings, type ChatSettings } from '$lib/api/chat';
	import {
		listChannels,
		connectChannel,
		disconnectChannel,
		type Channel
	} from '$lib/api/channels';
	import {
		createApiKey,
		createPublishableKey,
		getWebhook,
		setWebhook,
		renameOrg,
		listApiKeys
	} from '$lib/api/settings';

	let loading = $state(true);

	let orgName = $state('');
	let orgBusy = $state(false);
	let orgSaved = $state(false);

	let keys = $state<{ prefix: string; kind: string; created_at: string }[]>([]);

	// Chat widget (publishable key)
	let pubKey = $state<string | null>(null); // full key, shown once after minting
	let pubBusy = $state(false);
	let previewLoaded = $state(false);

	// Widget customization
	let cs = $state<ChatSettings>({ instructions: '', widget_title: '', welcome: '', accent: '#111827' });
	let csBusy = $state(false);
	let csSaved = $state(false);

	// Messaging channels
	let channels = $state<Channel[]>([]);
	let chType = $state<'whatsapp' | 'messenger'>('whatsapp');
	let chExternalId = $state('');
	let chToken = $state('');
	let chVerify = $state('');
	let chBusy = $state(false);
	let chError = $state<string | null>(null);
	const webhookUrl2 =
		(typeof window !== 'undefined' ? window.location.origin : 'https://your-api.example') +
		'/webhooks/meta';
	const hasPublishable = $derived(keys.some((k) => k.kind === 'publishable'));
	const widgetOrigin =
		typeof window !== 'undefined' ? window.location.origin : 'https://your-api.example';
	const snippet = $derived(
		`<script src="${widgetOrigin}/widget.js" data-key="${pubKey ?? 'yvr_pk_…'}"><\/script>`
	);

	let webhookUrl = $state('');
	let webhookConfigured = $state(false);

	let apiKey = $state<string | null>(null);
	let keyBusy = $state(false);

	let secret = $state<string | null>(null);
	let hookBusy = $state(false);
	let hookError = $state<string | null>(null);

	$effect(() => {
		Promise.all([me(), getWebhook(), listApiKeys(), getChatSettings(), listChannels()])
			.then(([u, c, k, s, ch]) => {
				orgName = u.org.name;
				webhookConfigured = c.configured;
				webhookUrl = c.url ?? '';
				keys = k;
				cs = s;
				channels = ch;
			})
			.catch((e) => {
				if (isUnauthorized(e)) goto('/login');
			})
			.finally(() => (loading = false));
	});

	async function saveOrg(e: SubmitEvent) {
		e.preventDefault();
		orgBusy = true;
		orgSaved = false;
		try {
			await renameOrg(orgName);
			orgSaved = true;
		} finally {
			orgBusy = false;
		}
	}

	async function generateKey() {
		keyBusy = true;
		try {
			apiKey = (await createApiKey()).api_key;
			keys = await listApiKeys();
		} finally {
			keyBusy = false;
		}
	}

	async function generatePublishable() {
		pubBusy = true;
		try {
			pubKey = (await createPublishableKey()).api_key;
			keys = await listApiKeys();
		} finally {
			pubBusy = false;
		}
	}

	async function connect(e: SubmitEvent) {
		e.preventDefault();
		chError = null;
		chBusy = true;
		try {
			await connectChannel(chType, chExternalId.trim(), chToken.trim(), chVerify.trim());
			chExternalId = '';
			chToken = '';
			chVerify = '';
			channels = await listChannels();
		} catch {
			chError = 'Could not connect channel';
		} finally {
			chBusy = false;
		}
	}

	async function disconnect(type: string) {
		await disconnectChannel(type);
		channels = await listChannels();
	}

	async function saveWidget(e: SubmitEvent) {
		e.preventDefault();
		csBusy = true;
		csSaved = false;
		try {
			await saveChatSettings(cs);
			csSaved = true;
		} finally {
			csBusy = false;
		}
	}

	// Inject the real widget onto this page so you can try it live.
	function loadPreview() {
		if (!pubKey || previewLoaded) return;
		const s = document.createElement('script');
		s.src = '/widget.js';
		s.setAttribute('data-key', pubKey);
		document.body.appendChild(s);
		previewLoaded = true;
	}

	async function saveWebhook(e: SubmitEvent) {
		e.preventDefault();
		hookError = null;
		hookBusy = true;
		try {
			secret = (await setWebhook(webhookUrl)).secret;
			webhookConfigured = true;
		} catch {
			hookError = 'Could not save webhook';
		} finally {
			hookBusy = false;
		}
	}
</script>

{#snippet reveal(label: string, value: string)}
	<div class="mt-3 rounded-lg bg-amber-50 p-3">
		<p class="text-xs font-medium text-amber-800">{label} — copy it now, it won't be shown again</p>
		<code class="mt-1 block break-all font-mono text-sm text-amber-900">{value}</code>
	</div>
{/snippet}

<div class="min-h-screen bg-gray-50">
	<Header active="settings" />

	<main class="mx-auto max-w-3xl space-y-6 px-6 py-10">
		<h1 class="text-2xl font-semibold tracking-tight text-gray-900">Settings</h1>

		{#if loading}
			<p class="text-sm text-gray-500">Loading…</p>
		{:else}
			<!-- Organization -->
			<section class="card p-6">
				<h2 class="text-sm font-semibold text-gray-900">Organization</h2>
				<p class="mt-1 text-sm text-gray-500">The store name shown in the dashboard.</p>
				<form class="mt-4 flex gap-2" onsubmit={saveOrg}>
					<input
						bind:value={orgName}
						required
						class="input flex-1"
					/>
					<button
						disabled={orgBusy}
						class="btn-primary"
					>
						{orgBusy ? 'Saving…' : 'Save'}
					</button>
					{#if orgSaved}<span class="self-center text-sm text-green-700">Saved</span>{/if}
				</form>
			</section>

			<!-- API key -->
			<section class="card p-6">
				<h2 class="text-sm font-semibold text-gray-900">API key</h2>
				<p class="mt-1 text-sm text-gray-500">
					Use this key to send store events to <code class="font-mono">/v1/events</code>.
				</p>
				<button
					onclick={generateKey}
					disabled={keyBusy}
					class="mt-4 btn-primary"
				>
					{keyBusy ? 'Generating…' : 'Generate API key'}
				</button>
				{#if apiKey}
					{@render reveal('API key', apiKey)}
				{/if}
				{#if keys.length}
					<ul class="mt-4 divide-y divide-gray-100 border-t border-gray-100 text-sm">
						{#each keys as k (k.prefix)}
							<li class="flex items-center justify-between py-2">
								<span class="flex items-center gap-2">
									<code class="font-mono text-gray-700">{k.prefix}…</code>
									<span class="badge {k.kind === 'publishable' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}">{k.kind}</span>
								</span>
								<span class="text-xs text-gray-400">{new Date(k.created_at).toLocaleDateString()}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</section>

			<!-- Chat widget -->
			<section class="card p-6">
				<h2 class="text-sm font-semibold text-gray-900">Chat widget</h2>
				<p class="mt-1 text-sm text-gray-500">
					Drop the AI chat onto any website with one line. Uses a publishable key (safe to expose).
				</p>

				<!-- Appearance -->
				<form class="mt-4 space-y-4 border-b border-gray-100 pb-6" onsubmit={saveWidget}>
					<div class="grid gap-4 sm:grid-cols-2">
						<label class="block">
							<span class="label">Widget title</span>
							<input bind:value={cs.widget_title} class="input mt-1 w-full" placeholder="Chat with us" />
						</label>
						<label class="block">
							<span class="label">Accent color</span>
							<div class="mt-1 flex items-center gap-2">
								<input type="color" bind:value={cs.accent} class="h-9 w-12 rounded-lg border border-gray-300" />
								<input bind:value={cs.accent} class="input w-full font-mono" />
							</div>
						</label>
					</div>
					<label class="block">
						<span class="label">Welcome message</span>
						<input bind:value={cs.welcome} class="input mt-1 w-full" placeholder="Hi! 👋 How can I help you today?" />
					</label>
					<label class="block">
						<span class="label">Assistant instructions</span>
						<textarea bind:value={cs.instructions} rows="2" class="input mt-1 w-full resize-none" placeholder="e.g. Reply only in Bangla. Be warm and concise."></textarea>
						<span class="mt-1 block text-xs text-gray-400">Guides how your assistant answers.</span>
					</label>
					<div class="flex items-center gap-3">
						<button disabled={csBusy} class="btn-primary">{csBusy ? 'Saving…' : 'Save appearance'}</button>
						{#if csSaved}<span class="text-sm text-green-700">Saved</span>{/if}
					</div>
				</form>

				<p class="mt-6 text-xs font-medium uppercase tracking-wider text-gray-400">Install</p>
				<button onclick={generatePublishable} disabled={pubBusy} class="mt-3 btn-primary">
					{pubBusy ? 'Generating…' : hasPublishable ? 'Regenerate publishable key' : 'Generate publishable key'}
				</button>

				{#if pubKey}
					{@render reveal('Publishable key', pubKey)}
					<p class="mt-5 text-xs font-medium uppercase tracking-wider text-gray-400">Embed snippet</p>
					<pre class="mt-2 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800"><code>{snippet}</code></pre>
					<button onclick={loadPreview} disabled={previewLoaded} class="btn-secondary mt-3">
						{previewLoaded ? 'Preview loaded → look bottom-right' : 'Load live preview'}
					</button>
				{:else if hasPublishable}
					<p class="mt-3 text-sm text-gray-500">
						A publishable key already exists. Regenerate to reveal a full key for embedding.
					</p>
				{/if}
			</section>

			<!-- Messaging channels -->
			<section class="card p-6">
				<h2 class="text-sm font-semibold text-gray-900">WhatsApp & Messenger</h2>
				<p class="mt-1 text-sm text-gray-500">
					Connect WhatsApp or Messenger so your assistant can reply to customers automatically.
				</p>

				{#if channels.length}
					<ul class="mt-4 divide-y divide-gray-100 border-y border-gray-100">
						{#each channels as c (c.type)}
							<li class="flex items-center justify-between py-3">
								<span class="flex items-center gap-2">
									<span class="badge {c.type === 'whatsapp' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}">{c.type}</span>
									<code class="font-mono text-sm text-gray-600">{c.external_id}</code>
								</span>
								<button onclick={() => disconnect(c.type)} class="text-sm text-red-600 hover:text-red-700">Disconnect</button>
							</li>
						{/each}
					</ul>
				{/if}

				<p class="mt-5 text-xs text-gray-500">
					In Meta, set the webhook URL to
					<code class="font-mono text-gray-700">{webhookUrl2}</code> and use the verify token below.
				</p>
				<form class="mt-3 grid gap-3 sm:grid-cols-2" onsubmit={connect}>
					<select bind:value={chType} class="input">
						<option value="whatsapp">WhatsApp</option>
						<option value="messenger">Messenger</option>
					</select>
					<input bind:value={chExternalId} required placeholder={chType === 'whatsapp' ? 'phone_number_id' : 'page_id'} class="input" />
					<input bind:value={chToken} required placeholder="Access token" class="input" />
					<input bind:value={chVerify} required placeholder="Verify token" class="input" />
					<div class="sm:col-span-2">
						<button disabled={chBusy} class="btn-primary">{chBusy ? 'Connecting…' : 'Connect channel'}</button>
						{#if chError}<span class="ml-3 text-sm text-red-600">{chError}</span>{/if}
					</div>
				</form>
			</section>

			<!-- Webhook -->
			<section class="card p-6">
				<h2 class="text-sm font-semibold text-gray-900">Webhook</h2>
				<p class="mt-1 text-sm text-gray-500">
					We POST signed call/chat outcomes here.
					{#if webhookConfigured}<span class="text-green-700">Currently configured.</span>{/if}
				</p>
				<form class="mt-4 flex gap-2" onsubmit={saveWebhook}>
					<input
						bind:value={webhookUrl}
						type="url"
						required
						placeholder="https://your-store.example/webhooks/yaver"
						class="input flex-1"
					/>
					<button
						disabled={hookBusy}
						class="btn-primary"
					>
						{hookBusy ? 'Saving…' : 'Save'}
					</button>
				</form>
				{#if hookError}<p class="mt-2 text-sm text-red-600">{hookError}</p>{/if}
				{#if secret}
					{@render reveal('Signing secret', secret)}
				{/if}
			</section>
		{/if}
	</main>
</div>
