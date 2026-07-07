<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import { isUnauthorized } from '$lib/api/client';
	import { listCalls, type Call } from '$lib/api/calls';

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

	const when = (iso: string) => new Date(iso).toLocaleString();
</script>

<div class="min-h-screen bg-gray-50">
	<Header active="calls" />

	<main class="mx-auto max-w-6xl px-6 py-10">
		<h1 class="text-2xl font-semibold text-gray-900">Calls</h1>

		{#if loading}
			<p class="mt-4 text-sm text-gray-500">Loading…</p>
		{:else if !calls || calls.length === 0}
			<p class="mt-4 text-sm text-gray-500">No calls yet.</p>
		{:else}
			<div class="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
				<table class="w-full text-left text-sm">
					<thead class="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
						<tr>
							<th class="px-4 py-3 font-medium">Call</th>
							<th class="px-4 py-3 font-medium">Direction</th>
							<th class="px-4 py-3 font-medium">Status</th>
							<th class="px-4 py-3 font-medium">Result</th>
							<th class="px-4 py-3 font-medium">When</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each calls as c (c.id)}
							<tr
								class="cursor-pointer hover:bg-gray-50"
								onclick={() => goto(`/calls/${c.id}`)}
							>
								<td class="px-4 py-3 font-mono text-xs text-gray-500">{c.id.slice(0, 16)}…</td>
								<td class="px-4 py-3 text-gray-700">{c.direction}</td>
								<td class="px-4 py-3">
									<span class="rounded-full px-2 py-0.5 font-mono text-xs font-medium {badge(c.status)}"
										>{c.status}</span
									>
								</td>
								<td class="px-4 py-3 text-gray-700">{c.result || '—'}</td>
								<td class="px-4 py-3 text-gray-500">{when(c.created_at)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</main>
</div>
