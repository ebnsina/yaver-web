<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import { isUnauthorized } from '$lib/api/client';
	import { getSummary, sendTestCall, type Summary } from '$lib/api/calls';

	let summary = $state<Summary | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let testPhone = $state('');
	let testDigit = $state('1');
	let sending = $state(false);
	let lastResult = $state<string | null>(null);

	async function load() {
		summary = await getSummary();
	}

	$effect(() => {
		load()
			.catch((e) => {
				if (isUnauthorized(e)) goto('/login');
				else error = 'Could not load dashboard';
			})
			.finally(() => (loading = false));
	});

	async function send(e: SubmitEvent) {
		e.preventDefault();
		sending = true;
		lastResult = null;
		try {
			const r = await sendTestCall(testPhone, testDigit);
			lastResult = r.result;
			await load();
		} finally {
			sending = false;
		}
	}

	const tiles = $derived(
		summary
			? [
					{ label: 'Total calls', value: summary.total },
					{ label: 'Confirmed', value: summary.confirmed },
					{ label: 'Confirmation rate', value: `${summary.confirmation_rate}%` },
					{ label: 'Today', value: summary.today }
				]
			: []
	);
</script>

<div class="min-h-screen bg-gray-50">
	<Header active="dashboard" />

	<main class="mx-auto max-w-6xl px-6 py-10">
		{#if loading}
			<p class="text-sm text-gray-500">Loading…</p>
		{:else if error}
			<p class="text-sm text-red-600">{error}</p>
		{:else}
			<h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>

			<div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
				{#each tiles as t (t.label)}
					<div class="rounded-xl border border-gray-200 bg-white p-5">
						<p class="text-xs font-medium uppercase tracking-wide text-gray-400">{t.label}</p>
						<p class="mt-2 font-mono text-3xl font-semibold tabular-nums text-gray-900">{t.value}</p>
					</div>
				{/each}
			</div>

			<section class="mt-8 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="text-base font-semibold text-gray-900">Send a test call</h2>
				<p class="mt-1 text-sm text-gray-500">
					Simulate a call outcome (no telephony) to see the flow end-to-end.
				</p>
				<form class="mt-4 flex flex-wrap items-center gap-2" onsubmit={send}>
					<input
						bind:value={testPhone}
						type="tel"
						required
						placeholder="01712345678"
						class="w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
					/>
					<select
						bind:value={testDigit}
						class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
					>
						<option value="1">1 — Confirm</option>
						<option value="2">2 — Cancel</option>
						<option value="3">3 — Reschedule</option>
					</select>
					<button
						disabled={sending}
						class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
					>
						{sending ? 'Calling…' : 'Send'}
					</button>
					{#if lastResult}
						<span class="font-mono text-sm text-green-700">→ {lastResult}</span>
					{/if}
				</form>
			</section>
		{/if}
	</main>
</div>
