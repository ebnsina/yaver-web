<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import { isUnauthorized } from '$lib/api/client';
	import { me } from '$lib/api/auth';
	import { createApiKey, getWebhook, setWebhook, renameOrg, listApiKeys } from '$lib/api/settings';

	let loading = $state(true);

	let orgName = $state('');
	let orgBusy = $state(false);
	let orgSaved = $state(false);

	let keys = $state<{ prefix: string; created_at: string }[]>([]);

	let webhookUrl = $state('');
	let webhookConfigured = $state(false);

	let apiKey = $state<string | null>(null);
	let keyBusy = $state(false);

	let secret = $state<string | null>(null);
	let hookBusy = $state(false);
	let hookError = $state<string | null>(null);

	$effect(() => {
		Promise.all([me(), getWebhook(), listApiKeys()])
			.then(([u, c, k]) => {
				orgName = u.org.name;
				webhookConfigured = c.configured;
				webhookUrl = c.url ?? '';
				keys = k;
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

	<main class="mx-auto max-w-2xl space-y-6 px-6 py-10">
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
								<code class="font-mono text-gray-700">{k.prefix}…</code>
								<span class="text-xs text-gray-400">{new Date(k.created_at).toLocaleDateString()}</span>
							</li>
						{/each}
					</ul>
				{/if}
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
