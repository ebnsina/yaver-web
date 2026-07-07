<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import { Plus, Play } from '@lucide/svelte';
	import { isUnauthorized } from '$lib/api/client';
	import { listCampaigns, createCampaign, startCampaign, type Campaign } from '$lib/api/campaigns';

	let campaigns = $state<Campaign[] | null>(null);
	let loading = $state(true);
	let name = $state('');
	let creating = $state(false);
	let starting = $state<Record<string, boolean>>({});

	async function load() {
		campaigns = await listCampaigns();
	}

	$effect(() => {
		load()
			.catch((e) => {
				if (isUnauthorized(e)) goto('/login');
			})
			.finally(() => (loading = false));
	});

	async function create(e: SubmitEvent) {
		e.preventDefault();
		if (!name.trim()) return;
		creating = true;
		try {
			await createCampaign(name.trim());
			name = '';
			await load();
		} finally {
			creating = false;
		}
	}

	async function start(c: Campaign) {
		starting = { ...starting, [c.id]: true };
		try {
			await startCampaign(c.id);
			await load();
		} finally {
			starting = { ...starting, [c.id]: false };
		}
	}

	const statusBadge = (s: string) =>
		s === 'completed' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600';
	const when = (iso: string) => new Date(iso).toLocaleDateString();
</script>

<div class="min-h-screen bg-gray-50">
	<Header active="campaigns" />

	<main class="mx-auto max-w-6xl px-6 py-10">
		<h1 class="text-2xl font-semibold tracking-tight text-gray-900">Campaigns</h1>
		<p class="mt-1 text-sm text-gray-500">
			Call all your callable customers at once (DND customers are skipped).
		</p>

		<!-- New campaign -->
		<form class="card mt-6 flex gap-2 p-4" onsubmit={create}>
			<input bind:value={name} placeholder="Campaign name — e.g. Eid follow-up" class="input flex-1" />
			<button disabled={creating || !name.trim()} class="btn-primary">
				<Plus size={16} />
				{creating ? 'Creating…' : 'New campaign'}
			</button>
		</form>

		{#if loading}
			<p class="mt-4 text-sm text-gray-500">Loading…</p>
		{:else if campaigns && campaigns.length > 0}
			<div class="card mt-4 overflow-hidden">
				<table class="w-full text-left text-sm">
					<thead class="border-b border-gray-200 bg-gray-50/70 text-xs uppercase tracking-wide text-gray-500">
						<tr>
							<th class="px-5 py-3 font-medium">Name</th>
							<th class="px-5 py-3 font-medium">Status</th>
							<th class="px-5 py-3 font-medium">Calls queued</th>
							<th class="px-5 py-3 font-medium">Created</th>
							<th class="px-5 py-3 text-right font-medium"></th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each campaigns as c (c.id)}
							<tr class="hover:bg-gray-50">
								<td class="px-5 py-3.5 font-medium text-gray-900">{c.name}</td>
								<td class="px-5 py-3.5"><span class="badge {statusBadge(c.status)}">{c.status}</span></td>
								<td class="px-5 py-3.5 font-mono tabular-nums text-gray-700">
									{c.status === 'draft' ? '—' : c.target_count}
								</td>
								<td class="px-5 py-3.5 text-gray-500">{when(c.created_at)}</td>
								<td class="px-5 py-3.5 text-right">
									{#if c.status === 'draft'}
										<button disabled={starting[c.id]} onclick={() => start(c)} class="btn-secondary px-3 py-1.5">
											<Play size={14} />
										{starting[c.id] ? 'Starting…' : 'Start'}
										</button>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="card mt-4 p-10 text-center">
				<p class="text-sm text-gray-500">No campaigns yet — create one above.</p>
			</div>
		{/if}
	</main>
</div>
