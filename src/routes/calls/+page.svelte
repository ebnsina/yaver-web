<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import ListSkeleton from "$lib/components/ListSkeleton.svelte";
	import { ChevronRight } from '@lucide/svelte';
	import { isUnauthorized } from '$lib/api/client';
	import { listCalls, type Call } from '$lib/api/calls';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';

	let calls = $state<Call[] | null>(null);
	let loading = $state(true);

	$effect(() => {
		listCalls()
			.then((c) => (calls = c))
			.catch((e) => {
				if (isUnauthorized(e)) goto('/login');
			})
			.finally(() => (loading = false));
	});

	const badge = (status: string) =>
		status === 'completed'
			? 'bg-green-50 text-green-700'
			: status === 'failed' || status === 'no_answer'
				? 'bg-red-50 text-red-700'
				: 'bg-gray-100 text-gray-600';

	const resultDot = (r: string) =>
		r === 'confirmed'
			? 'bg-green-500'
			: r === 'cancelled'
				? 'bg-red-500'
				: r === 'reschedule'
					? 'bg-amber-500'
					: 'bg-gray-300';

	const when = (iso: string) => new Date(iso).toLocaleString();
</script>

<div class="min-h-screen bg-gray-50">
	<Header active="calls" />

	<main class="mx-auto max-w-6xl px-6 py-10">
		<h1 class="text-2xl font-semibold tracking-tight text-gray-900">Calls</h1>
		{#if calls?.length}
			<p class="mt-1 text-sm text-gray-500">{calls.length} call{calls.length === 1 ? '' : 's'}</p>
		{/if}

		{#if loading}
			<ListSkeleton />
		{:else if !calls || calls.length === 0}
			<div class="card mt-6 p-10 text-center">
				<p class="text-sm text-gray-500">No calls yet.</p>
				<Button variant="outline" href="/" class="mt-4">Send a test call</Button>
			</div>
		{:else}
			<div class="card mt-6 overflow-hidden">
				<table class="w-full text-left text-sm">
					<thead class="border-b border-gray-200 bg-gray-50/70 text-xs uppercase tracking-wide text-gray-500">
						<tr>
							<th class="px-5 py-3 font-medium">Call</th>
							<th class="px-5 py-3 font-medium">Direction</th>
							<th class="px-5 py-3 font-medium">Status</th>
							<th class="px-5 py-3 font-medium">Result</th>
							<th class="px-5 py-3 font-medium">When</th>
							<th class="px-5 py-3"></th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each calls as c (c.id)}
							<tr class="group cursor-pointer hover:bg-gray-50" onclick={() => goto(`/calls/${c.id}`)}>
								<td class="px-5 py-3.5 font-mono text-xs text-gray-500">{c.id.slice(0, 16)}…</td>
								<td class="px-5 py-3.5 text-gray-700">{c.direction}</td>
								<td class="px-5 py-3.5">
									<Badge variant="secondary" class={badge(c.status)}>{c.status}</Badge>
								</td>
								<td class="px-5 py-3.5">
									<span class="flex items-center gap-2 text-gray-700">
										<span class="h-1.5 w-1.5 rounded-full {resultDot(c.result)}"></span>
										{c.result || '—'}
									</span>
								</td>
								<td class="px-5 py-3.5 text-gray-500">{when(c.created_at)}</td>
								<td class="px-5 py-3.5 text-right text-gray-300 transition-colors group-hover:text-gray-500">
									<ChevronRight size={16} class="ml-auto" />
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</main>
</div>
