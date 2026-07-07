<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import { ArrowLeft, Play, Plus, Trash2 } from '@lucide/svelte';
	import { isUnauthorized } from '$lib/api/client';
	import { getFlow, updateFlow, simulateFlow, type FlowDetail, type IVRSpec, type Simulation } from '$lib/api/flows';

	let flow = $state<FlowDetail | null>(null);
	let spec = $state<IVRSpec | null>(null);
	let loading = $state(true);
	let notFound = $state(false);
	let saving = $state(false);
	let saved = $state(false);
	let saveError = $state('');

	// The keys a branch can fire on.
	const BRANCH_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'timeout', 'invalid'];

	$effect(() => {
		const id = page.params.id;
		if (!id) return;
		getFlow(id)
			.then((f) => {
				flow = f;
				spec = f.spec;
			})
			.catch((e) => {
				if (isUnauthorized(e)) goto('/login');
				else notFound = true;
			})
			.finally(() => (loading = false));
	});

	const nodeNames = $derived(spec ? Object.keys(spec.nodes) : []);

	function toggleGather(key: string) {
		if (!spec) return;
		const n = spec.nodes[key];
		if (n.gather) {
			delete n.gather;
			delete n.on;
		} else {
			n.gather = { digits: 1, timeout_s: 6 };
			n.on = {};
			delete n.result;
			delete n.end;
		}
	}

	function toggleEnd(key: string) {
		if (!spec) return;
		const n = spec.nodes[key];
		if (n.end) {
			delete n.end;
			delete n.result;
		} else {
			n.end = true;
			n.result = n.result ?? 'completed';
			delete n.gather;
			delete n.on;
		}
	}

	function addBranch(key: string) {
		if (!spec) return;
		const n = spec.nodes[key];
		n.on = n.on ?? {};
		const free = BRANCH_KEYS.find((k) => !(k in n.on!));
		if (!free) return;
		n.on[free] = spec.entry;
	}

	function removeBranch(key: string, branch: string) {
		if (!spec) return;
		delete spec.nodes[key].on?.[branch];
	}

	let newNodeName = $state('');
	function addNode() {
		if (!spec) return;
		const slug = newNodeName.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_');
		if (!slug || spec.nodes[slug]) return;
		spec.nodes[slug] = { say: { tts: '' }, result: 'completed', end: true };
		newNodeName = '';
	}

	function removeNode(key: string) {
		if (!spec || key === spec.entry) return;
		delete spec.nodes[key];
		// Drop any branches that pointed at the removed node.
		for (const n of Object.values(spec.nodes)) {
			for (const [d, target] of Object.entries(n.on ?? {})) {
				if (target === key) delete n.on![d];
			}
		}
	}

	async function save() {
		if (!flow || !spec) return;
		saving = true;
		saved = false;
		saveError = '';
		try {
			await updateFlow(flow.id, $state.snapshot(spec) as IVRSpec);
			saved = true;
		} catch (e) {
			saveError = (e as { error?: string }).error ?? 'Could not save.';
		} finally {
			saving = false;
		}
	}

	// --- Simulator ---
	let simInput = $state('1');
	let sim = $state<Simulation | null>(null);
	let simRunning = $state(false);

	async function runSim() {
		if (!spec) return;
		simRunning = true;
		try {
			const inputs = simInput
				.split(/[\s,]+/)
				.map((s) => s.trim().toLowerCase())
				.filter(Boolean);
			sim = await simulateFlow($state.snapshot(spec) as IVRSpec, inputs);
		} finally {
			simRunning = false;
		}
	}

	const outcomeColor = (status: string) =>
		status === 'completed'
			? 'bg-green-50 text-green-700'
			: status === 'no_answer'
				? 'bg-amber-50 text-amber-700'
				: 'bg-gray-100 text-gray-600';
</script>

<div class="min-h-screen bg-gray-50">
	<Header active="flows" />

	<main class="mx-auto max-w-6xl px-6 py-10">
		<a href="/flows" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"><ArrowLeft size={15} />Flows</a>

		{#if loading}
			<p class="mt-4 text-sm text-gray-500">Loading…</p>
		{:else if notFound || !flow || !spec}
			<p class="mt-4 text-sm text-gray-500">Flow not found.</p>
		{:else}
			<div class="mt-3 flex flex-wrap items-center justify-between gap-3">
				<div class="flex items-center gap-3">
					<h1 class="text-2xl font-semibold tracking-tight text-gray-900">{flow.name}</h1>
					<span class="badge bg-blue-50 text-blue-700">{flow.type}</span>
				</div>
				<div class="flex items-center gap-3">
					{#if saveError}<span class="text-sm text-red-600">{saveError}</span>{/if}
					{#if saved}<span class="text-sm text-green-700">Saved</span>{/if}
					<button disabled={saving} onclick={save} class="btn-primary">{saving ? 'Saving…' : 'Save flow'}</button>
				</div>
			</div>

			<div class="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
				<!-- Editor -->
				<div>
					<div class="flex items-center gap-2">
						<label class="text-sm text-gray-500" for="entry">Starts at</label>
						<select id="entry" bind:value={spec.entry} class="input">
							{#each nodeNames as name (name)}<option value={name}>{name}</option>{/each}
						</select>
					</div>

					<div class="mt-4 space-y-4">
						{#each nodeNames as name (name)}
							{@const node = spec.nodes[name]}
							<section class="card p-5">
								<div class="flex items-center justify-between">
									<span class="font-mono text-sm font-medium text-gray-900">
										{name}{#if name === spec.entry}<span class="badge ml-2 bg-gray-100 text-gray-600">entry</span>{/if}
									</span>
									{#if name !== spec.entry}
										<button onclick={() => removeNode(name)} class="text-gray-400 hover:text-red-600" title="Delete node"><Trash2 size={15} /></button>
									{/if}
								</div>

								<label class="mt-3 block text-xs font-medium text-gray-500" for="say-{name}">Says</label>
								<textarea id="say-{name}" bind:value={node.say!.tts} rows="2" class="input mt-1 w-full resize-none" placeholder="What the customer hears…"></textarea>

								<div class="mt-3 flex flex-wrap gap-4 text-sm">
									<label class="inline-flex items-center gap-2 text-gray-600">
										<input type="checkbox" checked={!!node.gather} onchange={() => toggleGather(name)} /> Waits for a keypress
									</label>
									<label class="inline-flex items-center gap-2 text-gray-600">
										<input type="checkbox" checked={!!node.end} onchange={() => toggleEnd(name)} /> Ends the call
									</label>
								</div>

								{#if node.gather}
									<div class="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
										<div class="mb-2 flex items-center justify-between">
											<span class="text-xs font-medium text-gray-500">When they press…</span>
											<button onclick={() => addBranch(name)} class="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"><Plus size={13} />branch</button>
										</div>
										{#if node.on && Object.keys(node.on).length}
											<ul class="space-y-2">
												{#each Object.keys(node.on) as branch (branch)}
													<li class="flex items-center gap-2 text-sm">
														<span class="flex h-7 w-14 items-center justify-center rounded-md border border-gray-200 bg-white font-mono text-xs text-gray-700">{branch}</span>
														<span class="text-gray-400">→</span>
														<select bind:value={node.on![branch]} class="input flex-1 py-1">
															{#each nodeNames as n (n)}<option value={n}>{n}</option>{/each}
														</select>
														<button onclick={() => removeBranch(name, branch)} class="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
													</li>
												{/each}
											</ul>
										{:else}
											<p class="text-xs text-gray-400">No branches yet — add one.</p>
										{/if}
									</div>
								{/if}

								{#if node.end}
									<div class="mt-3 flex items-center gap-2 text-sm">
										<label class="text-xs font-medium text-gray-500" for="result-{name}">Outcome</label>
										<input id="result-{name}" bind:value={node.result} class="input py-1" placeholder="confirmed" />
									</div>
								{/if}
							</section>
						{/each}
					</div>

					<div class="mt-4 flex items-center gap-2">
						<input bind:value={newNodeName} class="input" placeholder="new node name" onkeydown={(e) => e.key === 'Enter' && addNode()} />
						<button onclick={addNode} class="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-gray-300"><Plus size={15} />Add node</button>
					</div>
				</div>

				<!-- Simulator -->
				<aside class="lg:sticky lg:top-6 lg:self-start">
					<section class="card p-5">
						<h2 class="text-sm font-semibold text-gray-900">Test it</h2>
						<p class="mt-1 text-xs text-gray-500">Enter the keys the customer presses (e.g. <code>1</code>, or <code>timeout</code>). Uses your unsaved edits.</p>
						<div class="mt-3 flex gap-2">
							<input bind:value={simInput} class="input flex-1" placeholder="1" onkeydown={(e) => e.key === 'Enter' && runSim()} />
							<button disabled={simRunning} onclick={runSim} class="btn-primary inline-flex items-center gap-1"><Play size={14} />Run</button>
						</div>

						{#if sim}
							<ol class="mt-4 space-y-2">
								{#each sim.steps as step, i (i)}
									<li class="rounded-lg border border-gray-100 bg-gray-50 p-2 text-xs">
										<span class="font-mono font-medium text-gray-700">{step.node}</span>
										{#if step.say?.tts}<p class="mt-0.5 text-gray-500">“{step.say.tts}”</p>{/if}
										{#if step.awaits_input}<span class="text-gray-400">waiting for keypress…</span>{/if}
									</li>
								{/each}
							</ol>
							<div class="mt-3 text-sm">
								{#if sim.ended}
									<span class="badge {outcomeColor(sim.status)}">{sim.result || sim.status}</span>
								{:else}
									<span class="text-gray-400">Ran out of inputs — still waiting.</span>
								{/if}
							</div>
						{/if}
					</section>
				</aside>
			</div>
		{/if}
	</main>
</div>
