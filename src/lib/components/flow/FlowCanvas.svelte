<script lang="ts">
	import { setContext } from 'svelte';
	import {
		SvelteFlow,
		Background,
		Controls,
		Panel,
		MarkerType,
		type Node,
		type Edge,
		type Connection
	} from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import IvrNode from './IvrNode.svelte';
	import BranchEdge from './BranchEdge.svelte';
	import { BRANCH_KEYS, type IvrFlowCtx } from './context';
	import type { IVRSpec } from '$lib/api/flows';

	let { spec = $bindable(), onedit }: { spec: IVRSpec; onedit?: (name: string) => void } = $props();

	if (!spec.layout) spec.layout = {};

	const nodeTypes = { ivr: IvrNode };
	const edgeTypes = { branch: BranchEdge };

	function position(name: string, i: number) {
		return spec.layout?.[name] ?? { x: (i % 3) * 240, y: Math.floor(i / 3) * 150 };
	}
	function buildNodes(): Node[] {
		return Object.keys(spec.nodes).map((name, i) => ({
			id: name,
			type: 'ivr',
			position: position(name, i),
			data: { name }
		}));
	}
	function buildEdges(): Edge[] {
		const out: Edge[] = [];
		for (const [name, n] of Object.entries(spec.nodes)) {
			for (const [key, target] of Object.entries(n.on ?? {})) {
				if (!spec.nodes[target]) continue;
				out.push({
					id: `${name}::${key}`,
					source: name,
					target,
					type: 'branch',
					data: { source: name, key },
					markerEnd: { type: MarkerType.ArrowClosed }
				});
			}
		}
		return out;
	}

	let nodes = $state.raw(buildNodes());
	let edges = $state.raw(buildEdges());

	// Persist live node positions back into the spec so placement survives a save.
	$effect(() => {
		const layout = spec.layout!;
		for (const n of nodes) layout[n.id] = { x: n.position.x, y: n.position.y };
	});

	function firstFreeKey(source: string): string | null {
		const used = Object.keys(spec.nodes[source]?.on ?? {});
		return BRANCH_KEYS.find((k) => !used.includes(k)) ?? null;
	}

	function onconnect(conn: Connection) {
		const { source, target } = conn;
		if (!source || !target || !spec.nodes[source] || !spec.nodes[target]) return;
		const node = spec.nodes[source];
		// Branching implies the node waits for a keypress.
		if (!node.gather) {
			node.gather = { digits: 1, timeout_s: 6 };
			delete node.result;
			delete node.end;
		}
		node.on = node.on ?? {};
		const key = firstFreeKey(source);
		if (!key) return; // every keypad key is already wired
		node.on[key] = target;
		edges = buildEdges();
	}

	function ondelete({ nodes: dn, edges: de }: { nodes: Node[]; edges: Edge[] }) {
		for (const e of de) {
			const b = e.data as { source: string; key: string } | undefined;
			if (b && spec.nodes[b.source]?.on) delete spec.nodes[b.source].on![b.key];
		}
		for (const n of dn) {
			delete spec.nodes[n.id];
			delete spec.layout![n.id];
			for (const node of Object.values(spec.nodes)) {
				for (const [k, t] of Object.entries(node.on ?? {})) if (t === n.id) delete node.on![k];
			}
		}
		if (!spec.nodes[spec.entry]) {
			const first = Object.keys(spec.nodes)[0];
			if (first) spec.entry = first;
		}
		nodes = buildNodes();
		edges = buildEdges();
	}

	let newName = $state('');
	function addNode() {
		const slug = newName.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_');
		if (!slug || spec.nodes[slug]) return;
		spec.nodes[slug] = { say: { tts: '' }, result: 'completed', end: true };
		spec.layout![slug] = { x: 40, y: 40 };
		newName = '';
		nodes = buildNodes();
	}

	const kindOf = (name: string) => {
		const n = spec.nodes[name];
		if (!n) return { label: '', cls: 'border-gray-200' };
		if (n.end || n.result) return { label: n.result || 'ends', cls: 'border-green-300' };
		if (n.gather) return { label: 'waits for keypress', cls: 'border-blue-300' };
		return { label: 'says', cls: 'border-gray-200' };
	};

	setContext<IvrFlowCtx>('ivrflow', {
		isEntry: (name) => spec.entry === name,
		kind: kindOf,
		saySnippet: (name) => spec.nodes[name]?.say?.tts ?? '',
		editNode: (name) => onedit?.(name),
		usedKeys: (source) => Object.keys(spec.nodes[source]?.on ?? {}),
		changeKey: (source, oldKey, newKey) => {
			const node = spec.nodes[source];
			if (!node?.on || newKey in node.on) return;
			node.on[newKey] = node.on[oldKey];
			delete node.on[oldKey];
			edges = buildEdges();
		}
	});
</script>

<div class="h-[560px] overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
	<SvelteFlow bind:nodes bind:edges {nodeTypes} {edgeTypes} {onconnect} {ondelete} fitView>
		<Background />
		<Controls />
		<Panel position="top-left">
			<div class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1.5 shadow-sm">
				<input
					bind:value={newName}
					placeholder="new node"
					class="w-28 rounded border border-gray-200 px-2 py-1 text-xs"
					onkeydown={(e) => e.key === 'Enter' && addNode()}
				/>
				<button onclick={addNode} class="rounded bg-gray-900 px-2 py-1 text-xs text-white">Add node</button>
			</div>
		</Panel>
	</SvelteFlow>
</div>
