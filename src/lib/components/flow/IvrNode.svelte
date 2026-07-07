<script lang="ts">
	import { getContext } from 'svelte';
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import type { IvrFlowCtx } from './context';

	let { data }: NodeProps = $props();
	const name = $derived((data as { name: string }).name);

	const ctx = getContext<IvrFlowCtx>('ivrflow');
	const kind = $derived(ctx.kind(name));
</script>

<div
	class="w-44 rounded-xl border-2 bg-white px-3 py-2 shadow-sm {kind.cls}"
	ondblclick={() => ctx.editNode(name)}
	role="button"
	tabindex="0"
>
	<Handle type="target" position={Position.Left} />
	<div class="flex items-center gap-1.5">
		<span class="truncate font-mono text-xs font-semibold text-gray-900">{name}</span>
		{#if ctx.isEntry(name)}<span class="rounded bg-gray-900 px-1 text-[10px] text-white">entry</span>{/if}
	</div>
	<p class="mt-0.5 truncate text-[11px] text-gray-600">{ctx.saySnippet(name) || kind.label}</p>
	<Handle type="source" position={Position.Right} />
</div>
