<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import { ArrowLeft } from '@lucide/svelte';
	import { isUnauthorized } from '$lib/api/client';
	import { listFlowTemplates, createFlow, type FlowTemplate } from '$lib/api/flows';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';

	let templates = $state<FlowTemplate[] | null>(null);
	let loading = $state(true);
	let selected = $state<FlowTemplate | null>(null);
	let name = $state('');
	let creating = $state(false);
	let error = $state('');

	$effect(() => {
		listFlowTemplates()
			.then((t) => (templates = t))
			.catch((e) => {
				if (isUnauthorized(e)) goto('/login');
			})
			.finally(() => (loading = false));
	});

	function pick(t: FlowTemplate) {
		selected = t;
		name = t.name;
		error = '';
	}

	async function create() {
		if (!selected || !name.trim()) return;
		creating = true;
		error = '';
		try {
			const { id } = await createFlow({
				name: name.trim(),
				type: selected.type,
				channel: selected.channel,
				locale: selected.locale,
				spec: selected.spec
			});
			goto(`/flows/${id}`);
		} catch (e) {
			const err = e as { status?: number; error?: string };
			error = err.status === 409 ? 'A flow with that name already exists.' : (err.error ?? 'Could not create flow.');
			creating = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<Header active="flows" />

	<main class="mx-auto max-w-4xl px-6 py-10">
		<a href="/flows" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
			<ArrowLeft size={15} />Flows
		</a>
		<h1 class="mt-3 text-2xl font-semibold tracking-tight text-gray-900">New flow</h1>
		<p class="mt-1 text-sm text-gray-500">Start from a template — you can edit and test everything after.</p>

		{#if loading}
			<p class="mt-6 text-sm text-gray-500">Loading templates…</p>
		{:else if templates}
			<div class="mt-6 grid gap-4 sm:grid-cols-3">
				{#each templates as t (t.name)}
					<button
						type="button"
						onclick={() => pick(t)}
						class="card p-5 text-left transition hover:border-gray-300 {selected?.name === t.name ? 'ring-2 ring-blue-500' : ''}"
					>
						<span class="font-medium text-gray-900">{t.title}</span>
						<Badge variant="secondary" class="mt-2 inline-block bg-blue-50 text-blue-700">{t.type}</Badge>
						<p class="mt-2 text-xs text-gray-500">{t.description}</p>
					</button>
				{/each}
			</div>

			{#if selected}
				<section class="card mt-6 p-6">
					<h2 class="text-sm font-semibold text-gray-900">Name your flow</h2>
					<p class="mt-1 text-xs text-gray-500">
						The name is how store events route to this flow (e.g. <code>order_confirm</code>).
					</p>
					<div class="mt-3 flex flex-wrap items-center gap-3">
						<Input bind:value={name} class="w-64" placeholder="order_confirm" />
						<Button disabled={creating || !name.trim()} onclick={create}>
							{creating ? 'Creating…' : 'Create flow'}
						</Button>
						{#if error}<span class="text-sm text-red-600">{error}</span>{/if}
					</div>
				</section>
			{/if}
		{/if}
	</main>
</div>
