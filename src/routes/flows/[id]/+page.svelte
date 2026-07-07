<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import { ArrowLeft } from '@lucide/svelte';
	import { isUnauthorized } from '$lib/api/client';
	import { getFlow, updateFlow, type FlowDetail } from '$lib/api/flows';

	let flow = $state<FlowDetail | null>(null);
	let greeting = $state('');
	let loading = $state(true);
	let notFound = $state(false);
	let saving = $state(false);
	let saved = $state(false);

	$effect(() => {
		const id = page.params.id;
		if (!id) return;
		getFlow(id)
			.then((f) => {
				flow = f;
				greeting = f.spec.nodes[f.spec.entry]?.say?.tts ?? '';
			})
			.catch((e) => {
				if (isUnauthorized(e)) goto('/login');
				else notFound = true;
			})
			.finally(() => (loading = false));
	});

	// Digit → outcome label, derived from the entry node's branches.
	const options = $derived.by(() => {
		if (!flow) return [] as { digit: string; label: string }[];
		const entry = flow.spec.nodes[flow.spec.entry];
		const on = entry?.on ?? {};
		return Object.entries(on)
			.filter(([k]) => /^[0-9]$/.test(k))
			.map(([digit, target]) => ({
				digit,
				label: flow!.spec.nodes[target]?.result ?? target
			}));
	});

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (!flow) return;
		saving = true;
		saved = false;
		try {
			const spec = structuredClone(flow.spec);
			const entry = spec.nodes[spec.entry];
			entry.say = { ...(entry.say ?? {}), tts: greeting };
			await updateFlow(flow.id, spec);
			flow.spec = spec;
			saved = true;
		} finally {
			saving = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<Header active="flows" />

	<main class="mx-auto max-w-6xl px-6 py-10">
		<a href="/flows" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"><ArrowLeft size={15} />Flows</a>

		{#if loading}
			<p class="mt-4 text-sm text-gray-500">Loading…</p>
		{:else if notFound || !flow}
			<p class="mt-4 text-sm text-gray-500">Flow not found.</p>
		{:else}
			<div class="mt-3 flex items-center gap-3">
				<h1 class="text-2xl font-semibold tracking-tight text-gray-900">{flow.name}</h1>
				<span class="badge bg-blue-50 text-blue-700">{flow.type}</span>
			</div>

			<!-- Greeting -->
			<section class="card mt-6 p-6">
				<h2 class="text-sm font-semibold text-gray-900">Greeting</h2>
				<p class="mt-1 text-sm text-gray-500">What the customer hears when the call is answered.</p>
				<form class="mt-4" onsubmit={save}>
					<textarea bind:value={greeting} rows="3" class="input w-full resize-none"></textarea>
					<div class="mt-3 flex items-center gap-3">
						<button disabled={saving} class="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
						{#if saved}<span class="text-sm text-green-700">Saved</span>{/if}
					</div>
				</form>
			</section>

			<!-- Keypad -->
			<section class="card mt-6 p-6">
				<h2 class="text-sm font-semibold text-gray-900">Keypad</h2>
				<p class="mt-1 text-sm text-gray-500">Where each keypress takes the call.</p>
				<ul class="mt-4 space-y-2">
					{#each options as o (o.digit)}
						<li class="flex items-center gap-3 text-sm">
							<span class="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 font-mono font-medium text-gray-700">
								{o.digit}
							</span>
							<span class="text-gray-400">→</span>
							<span class="font-medium text-gray-900">{o.label}</span>
						</li>
					{/each}
				</ul>
				<p class="mt-4 text-xs text-gray-400">
					More editing options are coming soon.
				</p>
			</section>
		{/if}
	</main>
</div>
