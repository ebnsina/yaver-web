<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import { getCall, type CallDetail } from '$lib/api/calls';

	let call = $state<CallDetail | null>(null);
	let loading = $state(true);
	let notFound = $state(false);

	$effect(() => {
		const id = page.params.id;
		if (!id) return;
		getCall(id)
			.then((c) => (call = c))
			.catch((err) => {
				if (err?.status === 401) goto('/login');
				else notFound = true;
			})
			.finally(() => (loading = false));
	});

	const badge = (status: string) =>
		status === 'completed'
			? 'bg-green-50 text-green-700'
			: status === 'failed' || status === 'no_answer'
				? 'bg-red-50 text-red-700'
				: 'bg-gray-100 text-gray-600';

	const rows = $derived(
		call
			? [
					{ label: 'Status', mono: true, value: call.status },
					{ label: 'Result', value: call.result || '—' },
					{ label: 'Direction', value: call.direction },
					{ label: 'Flow', mono: true, value: call.flow_id || '—' },
					{ label: 'Provider call id', mono: true, value: call.provider_call_id || '—' },
					{ label: 'Created', value: new Date(call.created_at).toLocaleString() }
				]
			: []
	);
</script>

<div class="min-h-screen bg-gray-50">
	<Header active="calls" />

	<main class="mx-auto max-w-3xl px-6 py-10">
		<a href="/calls" class="text-sm text-gray-500 hover:text-gray-900">← Calls</a>

		{#if loading}
			<p class="mt-4 text-sm text-gray-500">Loading…</p>
		{:else if notFound || !call}
			<p class="mt-4 text-sm text-gray-500">Call not found.</p>
		{:else}
			<div class="mt-3 flex items-center gap-3">
				<h1 class="font-mono text-xl font-semibold tracking-tight text-gray-900">{call.id}</h1>
				<span class="badge {badge(call.status)}">{call.status}</span>
			</div>

			<div class="card mt-6 overflow-hidden">
				<dl class="divide-y divide-gray-100 text-sm">
					{#each rows as r (r.label)}
						<div class="flex px-5 py-3">
							<dt class="w-40 shrink-0 text-gray-500">{r.label}</dt>
							<dd class="{r.mono ? 'font-mono' : ''} break-all text-gray-900">{r.value}</dd>
						</div>
					{/each}
				</dl>
			</div>

			<h2 class="mt-8 text-sm font-semibold text-gray-900">Timeline</h2>
			<div
				class="mt-3 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 px-6 py-10 text-center"
			>
				<svg class="h-6 w-6 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<circle cx="12" cy="12" r="9" />
					<path d="M12 7v5l3 2" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				<p class="mt-3 text-sm text-gray-500">No events yet</p>
				<p class="mt-1 max-w-sm text-xs text-gray-400">
					The event timeline, recording, and transcript appear here once calls run on a real
					telephony provider.
				</p>
			</div>
		{/if}
	</main>
</div>
