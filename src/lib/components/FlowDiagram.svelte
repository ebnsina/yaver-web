<script lang="ts">
	import type { IVRSpec } from '$lib/api/flows';

	let { spec, onselect }: { spec: IVRSpec; onselect?: (node: string) => void } = $props();

	const COL = 210;
	const ROW = 108;
	const BOX_W = 168;
	const BOX_H = 66;
	const PAD = 24;

	// Left-to-right layered layout: BFS depth from the entry node sets the column,
	// order-within-column sets the row. Unreached nodes land in a trailing column.
	const graph = $derived.by(() => {
		const level: Record<string, number> = { [spec.entry]: 0 };
		const queue: string[] = [spec.entry];
		while (queue.length) {
			const node = queue.shift()!;
			for (const target of Object.values(spec.nodes[node]?.on ?? {})) {
				if (!(target in level) && spec.nodes[target]) {
					level[target] = level[node] + 1;
					queue.push(target);
				}
			}
		}
		let maxLevel = 0;
		for (const l of Object.values(level)) maxLevel = Math.max(maxLevel, l);
		for (const name of Object.keys(spec.nodes)) if (!(name in level)) level[name] = maxLevel + 1;

		// Assign a row per node within its column.
		const rowOf: Record<string, number> = {};
		const perCol: Record<number, number> = {};
		for (const name of Object.keys(spec.nodes)) {
			const l = level[name];
			rowOf[name] = perCol[l] ?? 0;
			perCol[l] = rowOf[name] + 1;
		}

		const pos: Record<string, { x: number; y: number }> = {};
		for (const name of Object.keys(spec.nodes)) {
			pos[name] = { x: level[name] * COL + PAD, y: rowOf[name] * ROW + PAD };
		}

		const edges: { x1: number; y1: number; x2: number; y2: number; label: string; key: string }[] = [];
		for (const [name, node] of Object.entries(spec.nodes)) {
			for (const [key, target] of Object.entries(node.on ?? {})) {
				if (!pos[target]) continue;
				edges.push({
					x1: pos[name].x + BOX_W,
					y1: pos[name].y + BOX_H / 2,
					x2: pos[target].x,
					y2: pos[target].y + BOX_H / 2,
					label: key,
					key: `${name}-${key}`
				});
			}
		}

		let cols = 0;
		for (const l of Object.values(level)) cols = Math.max(cols, l + 1);
		let rows = 0;
		for (const r of Object.values(perCol)) rows = Math.max(rows, r);

		return {
			pos,
			edges,
			width: cols * COL + PAD,
			height: rows * ROW + PAD
		};
	});

	const nodeKind = (name: string) => {
		const n = spec.nodes[name];
		if (n.end || n.result) return { label: n.result || 'ends', cls: 'bg-green-50 text-green-700 border-green-200' };
		if (n.gather) return { label: 'waits for keypress', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
		return { label: 'says', cls: 'bg-gray-50 text-gray-600 border-gray-200' };
	};
</script>

<div class="overflow-auto rounded-xl border border-gray-200 bg-white p-2">
	<div class="relative" style="width:{graph.width}px; height:{graph.height}px; min-width:100%">
		<!-- edges -->
		<svg class="pointer-events-none absolute inset-0" width={graph.width} height={graph.height}>
			<defs>
				<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
					<path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
				</marker>
			</defs>
			{#each graph.edges as e (e.key)}
				{@const mx = (e.x1 + e.x2) / 2}
				<path
					d="M {e.x1} {e.y1} C {mx} {e.y1}, {mx} {e.y2}, {e.x2} {e.y2}"
					fill="none"
					stroke="#cbd5e1"
					stroke-width="1.5"
					marker-end="url(#arrow)"
				/>
				<rect x={mx - 12} y={(e.y1 + e.y2) / 2 - 9} width="24" height="18" rx="4" fill="#f8fafc" stroke="#e2e8f0" />
				<text x={mx} y={(e.y1 + e.y2) / 2 + 4} text-anchor="middle" class="fill-gray-600" style="font: 600 11px ui-monospace, monospace">{e.label}</text>
			{/each}
		</svg>

		<!-- nodes -->
		{#each Object.keys(spec.nodes) as name (name)}
			{@const p = graph.pos[name]}
			{@const kind = nodeKind(name)}
			<button
				type="button"
				onclick={() => onselect?.(name)}
				class="absolute rounded-xl border bg-white p-3 text-left shadow-sm transition hover:shadow-md {kind.cls}"
				style="left:{p.x}px; top:{p.y}px; width:{BOX_W}px; height:{BOX_H}px"
			>
				<div class="flex items-center gap-2">
					<span class="truncate font-mono text-xs font-semibold text-gray-900">{name}</span>
					{#if name === spec.entry}<span class="rounded bg-gray-900 px-1 text-[10px] text-white">entry</span>{/if}
				</div>
				<p class="mt-1 truncate text-[11px]">{kind.label}</p>
			</button>
		{/each}
	</div>
</div>
