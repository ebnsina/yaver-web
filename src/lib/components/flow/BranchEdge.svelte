<script lang="ts">
	import { getContext } from 'svelte';
	import { BaseEdge, EdgeLabel, getBezierPath, type EdgeProps } from '@xyflow/svelte';
	import { BRANCH_KEYS, type IvrFlowCtx } from './context';

	let { sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, data, markerEnd }: EdgeProps = $props();

	const d = $derived(data as { source: string; key: string });
	const ctx = getContext<IvrFlowCtx>('ivrflow');

	const geom = $derived(
		getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
	);
	const path = $derived(geom[0]);
	const labelX = $derived(geom[1]);
	const labelY = $derived(geom[2]);

	// Keys still available on this source (plus the one this edge already uses).
	const options = $derived(BRANCH_KEYS.filter((k) => k === d.key || !ctx.usedKeys(d.source).includes(k)));

	function onChange(e: Event) {
		const next = (e.currentTarget as HTMLSelectElement).value;
		if (next !== d.key) ctx.changeKey(d.source, d.key, next);
	}
</script>

<BaseEdge {path} {markerEnd} />
<EdgeLabel x={labelX} y={labelY}>
	<select
		value={d.key}
		onchange={onChange}
		onpointerdown={(e) => e.stopPropagation()}
		class="nodrag nopan rounded-md border border-gray-300 bg-white px-1 py-0.5 font-mono text-[11px] text-gray-700 shadow-sm"
		title="Which keypress triggers this branch"
	>
		{#each options as k (k)}<option value={k}>{k}</option>{/each}
	</select>
</EdgeLabel>
