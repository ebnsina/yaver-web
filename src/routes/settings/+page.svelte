<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import { createApiKey, getWebhook, setWebhook } from '$lib/api/settings';

	let loading = $state(true);
	let webhookUrl = $state('');
	let webhookConfigured = $state(false);

	let apiKey = $state<string | null>(null);
	let keyBusy = $state(false);

	let secret = $state<string | null>(null);
	let hookBusy = $state(false);
	let hookError = $state<string | null>(null);

	$effect(() => {
		getWebhook()
			.then((c) => {
				webhookConfigured = c.configured;
				webhookUrl = c.url ?? '';
			})
			.catch(() => goto('/login'))
			.finally(() => (loading = false));
	});

	async function generateKey() {
		keyBusy = true;
		try {
			apiKey = (await createApiKey()).api_key;
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
		<h1 class="text-2xl font-semibold text-gray-900">Settings</h1>

		{#if loading}
			<p class="text-sm text-gray-500">Loading…</p>
		{:else}
			<!-- API key -->
			<section class="rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="text-base font-semibold text-gray-900">API key</h2>
				<p class="mt-1 text-sm text-gray-500">
					Use this key to send store events to <code class="font-mono">/v1/events</code>.
				</p>
				<button
					onclick={generateKey}
					disabled={keyBusy}
					class="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
				>
					{keyBusy ? 'Generating…' : 'Generate API key'}
				</button>
				{#if apiKey}
					{@render reveal('API key', apiKey)}
				{/if}
			</section>

			<!-- Webhook -->
			<section class="rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="text-base font-semibold text-gray-900">Webhook</h2>
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
						class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
					/>
					<button
						disabled={hookBusy}
						class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
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
