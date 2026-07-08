<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import ListSkeleton from "$lib/components/ListSkeleton.svelte";
	import { isUnauthorized } from '$lib/api/client';
	import { me } from '$lib/api/auth';
	import { getChatSettings, saveChatSettings, type ChatSettings } from '$lib/api/chat';
	import { Building2, KeyRound, MessageSquare, MessageCircle, Webhook, Wallet } from '@lucide/svelte';
	import { getBilling, checkout, type Billing } from '$lib/api/billing';
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
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';

	let loading = $state(true);

	// Billing
	let billing = $state<Billing>({ balance: 0, ledger: [] });
	let topBusy = $state(false);

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
		Promise.all([me(), getWebhook(), listApiKeys(), getChatSettings(), listChannels(), getBilling()])
			.then(([u, c, k, s, ch, b]) => {
				orgName = u.org.name;
				webhookConfigured = c.configured;
				webhookUrl = c.url ?? '';
				keys = k;
				cs = s;
				channels = ch;
				billing = b;
			})
			.catch((e) => {
				if (isUnauthorized(e)) goto('/login');
			})
			.finally(() => (loading = false));
	});

	// Start a real purchase and hand off to the gateway. Credits land when the
	// gateway confirms via IPN; on return the reloaded page shows the new balance.
	async function buyCredits(credits: number) {
		topBusy = true;
		try {
			const { redirect_url } = await checkout(credits);
			window.location.href = redirect_url;
		} catch {
			topBusy = false;
		}
	}

	const reasonLabel = (r: string) =>
		r === 'call' ? 'Call' : r === 'topup' ? 'Top-up' : r === 'signup_grant' ? 'Signup grant' : r;

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

	<main class="mx-auto max-w-6xl space-y-6 px-6 py-10">
		<h1 class="text-2xl font-semibold tracking-tight text-gray-900">Settings</h1>

		{#if loading}
			<ListSkeleton rows={3} />
		{:else}
			<!-- Organization -->
			<section class="card p-6">
				<h2 class="flex items-center gap-2 text-sm font-semibold text-gray-900"><Building2 size={16} class="text-gray-400" />Organization</h2>
				<p class="mt-1 text-sm text-gray-500">The store name shown in the dashboard.</p>
				<form class="mt-4 flex gap-2" onsubmit={saveOrg}>
					<Input
						bind:value={orgName}
						required
						class="flex-1"
					/>
					<Button
						disabled={orgBusy}
					>
						{orgBusy ? 'Saving…' : 'Save'}
					</Button>
					{#if orgSaved}<span class="self-center text-sm text-green-700">Saved</span>{/if}
				</form>
			</section>

			<!-- Billing -->
			<section class="card p-6">
				<h2 class="flex items-center gap-2 text-sm font-semibold text-gray-900"><Wallet size={16} class="text-gray-400" />Credits</h2>
				<p class="mt-1 text-sm text-gray-500">Each call uses 1 credit. Chat replies are free.</p>
				<div class="mt-4 flex flex-wrap items-center gap-4">
					<span class="font-mono text-3xl font-semibold tabular-nums {billing.balance < 20 ? 'text-red-600' : 'text-gray-900'}">
						{billing.balance}
					</span>
					<span class="text-sm text-gray-400">credits remaining</span>
					<div class="ml-auto flex gap-2">
						<Button variant="outline" disabled={topBusy} onclick={() => buyCredits(100)}>Buy 100</Button>
						<Button disabled={topBusy} onclick={() => buyCredits(500)}>Buy 500</Button>
					</div>
				</div>
				{#if billing.balance < 20}
					<p class="mt-3 text-sm text-red-600">Low balance — top up to keep placing calls.</p>
				{/if}
				{#if billing.ledger.length}
					<ul class="mt-5 divide-y divide-gray-100 border-t border-gray-100 text-sm">
						{#each billing.ledger.slice(0, 6) as e (e.created_at + e.reason + e.delta)}
							<li class="flex items-center justify-between py-2">
								<span class="text-gray-600">{reasonLabel(e.reason)}</span>
								<span class="font-mono {e.delta > 0 ? 'text-green-700' : 'text-gray-500'}">
									{e.delta > 0 ? '+' : ''}{e.delta}
								</span>
							</li>
						{/each}
					</ul>
				{/if}
			</section>

			<!-- API key -->
			<section class="card p-6">
				<h2 class="flex items-center gap-2 text-sm font-semibold text-gray-900"><KeyRound size={16} class="text-gray-400" />API key</h2>
				<p class="mt-1 text-sm text-gray-500">
					Use this key to send store events to <code class="font-mono">/v1/events</code>.
				</p>
				<Button onclick={generateKey} disabled={keyBusy} class="mt-4">
					{keyBusy ? 'Generating…' : 'Generate API key'}
				</Button>
				{#if apiKey}
					{@render reveal('API key', apiKey)}
				{/if}
				{#if keys.length}
					<ul class="mt-4 divide-y divide-gray-100 border-t border-gray-100 text-sm">
						{#each keys as k (k.prefix)}
							<li class="flex items-center justify-between py-2">
								<span class="flex items-center gap-2">
									<code class="font-mono text-gray-700">{k.prefix}…</code>
									<Badge variant="secondary" class={k.kind === 'publishable' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}>{k.kind}</Badge>
								</span>
								<span class="text-xs text-gray-400">{new Date(k.created_at).toLocaleDateString()}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</section>

			<!-- Chat widget -->
			<section class="card p-6">
				<h2 class="flex items-center gap-2 text-sm font-semibold text-gray-900"><MessageSquare size={16} class="text-gray-400" />Chat widget</h2>
				<p class="mt-1 text-sm text-gray-500">
					Drop the AI chat onto any website with one line. Uses a publishable key (safe to expose).
				</p>

				<!-- Appearance -->
				<form class="mt-4 space-y-4 border-b border-gray-100 pb-6" onsubmit={saveWidget}>
					<div class="grid gap-4 sm:grid-cols-2">
						<label class="block">
							<span class="label">Widget title</span>
							<Input bind:value={cs.widget_title} class="mt-1 w-full" placeholder="Chat with us" />
						</label>
						<label class="block">
							<span class="label">Accent color</span>
							<div class="mt-1 flex items-center gap-2">
								<input type="color" bind:value={cs.accent} class="h-9 w-12 rounded-lg border border-gray-300" />
								<Input bind:value={cs.accent} class="w-full font-mono" />
							</div>
						</label>
					</div>
					<label class="block">
						<span class="label">Welcome message</span>
						<Input bind:value={cs.welcome} class="mt-1 w-full" placeholder="Hi! 👋 How can I help you today?" />
					</label>
					<label class="block">
						<span class="label">Assistant instructions</span>
						<textarea bind:value={cs.instructions} rows="2" class="input mt-1 w-full resize-none" placeholder="e.g. Reply only in Bangla. Be warm and concise."></textarea>
						<span class="mt-1 block text-xs text-gray-400">Guides how your assistant answers.</span>
					</label>
					<div class="flex items-center gap-3">
						<Button disabled={csBusy}>{csBusy ? 'Saving…' : 'Save appearance'}</Button>
						{#if csSaved}<span class="text-sm text-green-700">Saved</span>{/if}
					</div>
				</form>

				<p class="mt-6 text-xs font-medium uppercase tracking-wider text-gray-400">Install</p>
				<Button onclick={generatePublishable} disabled={pubBusy} class="mt-3">
					{pubBusy ? 'Generating…' : hasPublishable ? 'Regenerate publishable key' : 'Generate publishable key'}
				</Button>

				{#if pubKey}
					{@render reveal('Publishable key', pubKey)}
					<p class="mt-5 text-xs font-medium uppercase tracking-wider text-gray-400">Embed snippet</p>
					<pre class="mt-2 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800"><code>{snippet}</code></pre>
					<Button variant="outline" onclick={loadPreview} disabled={previewLoaded} class="mt-3">
						{previewLoaded ? 'Preview loaded → look bottom-right' : 'Load live preview'}
					</Button>
				{:else if hasPublishable}
					<p class="mt-3 text-sm text-gray-500">
						A publishable key already exists. Regenerate to reveal a full key for embedding.
					</p>
				{/if}
			</section>

			<!-- Messaging channels -->
			<section class="card p-6">
				<h2 class="flex items-center gap-2 text-sm font-semibold text-gray-900"><MessageCircle size={16} class="text-gray-400" />WhatsApp & Messenger</h2>
				<p class="mt-1 text-sm text-gray-500">
					Connect WhatsApp or Messenger so your assistant can reply to customers automatically.
				</p>

				{#if channels.length}
					<ul class="mt-4 divide-y divide-gray-100 border-y border-gray-100">
						{#each channels as c (c.type)}
							<li class="flex items-center justify-between py-3">
								<span class="flex items-center gap-2">
									<Badge variant="secondary" class={c.type === 'whatsapp' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}>{c.type}</Badge>
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
					<Input bind:value={chExternalId} required placeholder={chType === 'whatsapp' ? 'phone_number_id' : 'page_id'} />
					<Input bind:value={chToken} required placeholder="Access token" />
					<Input bind:value={chVerify} required placeholder="Verify token" />
					<div class="sm:col-span-2">
						<Button disabled={chBusy}>{chBusy ? 'Connecting…' : 'Connect channel'}</Button>
						{#if chError}<span class="ml-3 text-sm text-red-600">{chError}</span>{/if}
					</div>
				</form>
			</section>

			<!-- Webhook -->
			<section class="card p-6">
				<h2 class="flex items-center gap-2 text-sm font-semibold text-gray-900"><Webhook size={16} class="text-gray-400" />Webhook</h2>
				<p class="mt-1 text-sm text-gray-500">
					We POST signed call/chat outcomes here.
					{#if webhookConfigured}<span class="text-green-700">Currently configured.</span>{/if}
				</p>
				<form class="mt-4 flex gap-2" onsubmit={saveWebhook}>
					<Input
						bind:value={webhookUrl}
						type="url"
						required
						placeholder="https://your-store.example/webhooks/yaver"
						class="flex-1"
					/>
					<Button disabled={hookBusy}>
						{hookBusy ? 'Saving…' : 'Save'}
					</Button>
				</form>
				{#if hookError}<p class="mt-2 text-sm text-red-600">{hookError}</p>{/if}
				{#if secret}
					{@render reveal('Signing secret', secret)}
				{/if}
			</section>
		{/if}
	</main>
</div>
