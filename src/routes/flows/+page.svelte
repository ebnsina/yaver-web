<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import { isUnauthorized } from '$lib/api/client';
	import { listFlows, type FlowSummary } from '$lib/api/flows';

	let flows = $state<FlowSummary[] | null>(null);
	let loading = $state(true);

	$effect(() => {
		listFlows()
			.then((f) => (flows = f))
			.catch((e) => {
				if (isUnauthorized(e)) goto('/login');
			})
			.finally(() => (loading = false));
	});

	const typeBadge = (t: string) =>
		t === 'ivr' ? 'bg-blue-50 text-blue-700' : t === 'va' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600';
</script>

<div class="min-h-screen bg-gray-50">
	<Header active="flows" />

	<main class="mx-auto max-w-6xl px-6 py-10">
		<div class="flex items-start justify-between">
			<div>
				<h1 class="text-2xl font-semibold tracking-tight text-gray-900">Flows</h1>
				<p class="mt-1 text-sm text-gray-500">What your calls say and how they branch.</p>
			</div>
			<a href="/flows/new" class="btn-primary">New flow</a>
		</div>

		{#if loading}
			<p class="mt-4 text-sm text-gray-500">Loading…</p>
		{:else if flows}
			<div class="mt-6 grid gap-4 sm:grid-cols-2">
				{#each flows as f (f.id)}
					<a href="/flows/{f.id}" class="card block p-5 transition hover:border-gray-300">
						<div class="flex items-center justify-between">
							<span class="font-medium text-gray-900">{f.name}</span>
							<span class="badge {typeBadge(f.type)}">{f.type}</span>
						</div>
						<p class="mt-1 text-xs text-gray-400">
							{f.channel} · v{f.version}{f.active ? ' · active' : ''}
						</p>
					</a>
				{/each}
			</div>
		{/if}
	</main>
</div>
