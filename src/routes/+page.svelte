<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import { Phone, Check, Wallet } from '@lucide/svelte';
	import { isUnauthorized } from '$lib/api/client';
	import { me } from '$lib/api/auth';
	import { getSummary, sendTestCall, type Summary } from '$lib/api/calls';
	import { getWebhook, listApiKeys } from '$lib/api/settings';
	import { getBilling } from '$lib/api/billing';

	let summary = $state<Summary | null>(null);
	let orgName = $state('');
	let hasKey = $state(false);
	let webhookOn = $state(false);
	let balance = $state(0);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let testPhone = $state('');
	let testDigit = $state('1');
	let sending = $state(false);
	let lastResult = $state<string | null>(null);

	async function load() {
		const [u, s, wh, keys, b] = await Promise.all([
			me(),
			getSummary(),
			getWebhook(),
			listApiKeys(),
			getBilling()
		]);
		orgName = u.org.name;
		summary = s;
		webhookOn = wh.configured;
		hasKey = keys.length > 0;
		balance = b.balance;
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
		} catch (e) {
			lastResult = (e as { status?: number })?.status === 402 ? 'out of credits' : 'failed';
		} finally {
			sending = false;
		}
	}

	const steps = $derived([
		{ label: 'Name your store', done: orgName !== '' && orgName !== 'My Store', href: '/settings' },
		{ label: 'Send a test call', done: (summary?.total ?? 0) > 0, href: null },
		{ label: 'Create an API key', done: hasKey, href: '/settings' },
		{ label: 'Connect a webhook', done: webhookOn, href: '/settings' }
	]);
	const remaining = $derived(steps.filter((s) => !s.done).length);

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
			<h1 class="text-2xl font-semibold tracking-tight text-gray-900">Dashboard</h1>

			{#if balance < 20}
				<div class="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					<Wallet size={16} />
					Low balance — <span class="font-mono font-semibold">{balance}</span> credits left.
					<a href="/settings" class="font-medium underline underline-offset-2">Top up</a>
				</div>
			{/if}

			{#if remaining > 0}
				<section class="card mt-6 p-6">
					<div class="flex items-center justify-between">
						<h2 class="text-sm font-semibold text-gray-900">Get started</h2>
						<span class="font-mono text-xs text-gray-400">{4 - remaining} / 4</span>
					</div>
					<ul class="mt-4 space-y-2.5">
						{#each steps as s (s.label)}
							<li class="flex items-center gap-3 text-sm">
								<span
									class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs {s.done
										? 'bg-green-500 text-white'
										: 'border border-gray-300 text-transparent'}"
								>
									<Check size={12} />
								</span>
								{#if s.done}
									<span class="text-gray-400 line-through">{s.label}</span>
								{:else if s.href}
									<a
										href={s.href}
										class="font-medium text-gray-900 underline decoration-gray-300 underline-offset-2 hover:decoration-gray-900"
										>{s.label}</a
									>
								{:else}
									<span class="text-gray-900"
										>{s.label} <span class="text-gray-400">— use the form below</span></span
									>
								{/if}
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			<div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
				{#each tiles as t (t.label)}
					<div class="card p-5">
						<p class="label">{t.label}</p>
						<p class="mt-2.5 font-mono text-[2rem] font-semibold leading-none tracking-tight tabular-nums text-gray-900">
							{t.value}
						</p>
					</div>
				{/each}
			</div>

			<section class="card mt-8 p-6">
				<h2 class="text-sm font-semibold text-gray-900">Send a test call</h2>
				<p class="mt-1 text-sm text-gray-500">
					Send yourself a sample call to see how a customer confirmation works.
				</p>
				<form class="mt-4 flex flex-wrap items-center gap-2" onsubmit={send}>
					<input bind:value={testPhone} type="tel" required placeholder="01712345678" class="input w-48" />
					<select bind:value={testDigit} class="input">
						<option value="1">1 — Confirm</option>
						<option value="2">2 — Cancel</option>
						<option value="3">3 — Reschedule</option>
					</select>
					<button disabled={sending} class="btn-primary"><Phone size={16} />{sending ? 'Calling…' : 'Send'}</button>
					{#if lastResult}
						<span class="badge bg-green-50 text-green-700">→ {lastResult}</span>
					{/if}
				</form>
			</section>
		{/if}
	</main>
</div>
