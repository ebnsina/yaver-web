<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';

	// Shared loading placeholder for list/grid pages. `variant` matches the shape of
	// the content it stands in for so the layout doesn't jump when data arrives.
	let { rows = 5, variant = 'list' }: { rows?: number; variant?: 'list' | 'grid' } = $props();
</script>

{#if variant === 'grid'}
	<div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each Array(rows) as _, i (i)}
			<div class="card p-5">
				<Skeleton class="h-4 w-32" />
				<Skeleton class="mt-3 h-3 w-full" />
				<Skeleton class="mt-2 h-3 w-2/3" />
			</div>
		{/each}
	</div>
{:else}
	<div class="card mt-4 divide-y divide-gray-100">
		{#each Array(rows) as _, i (i)}
			<div class="flex items-center justify-between px-5 py-4">
				<div class="flex items-center gap-3">
					<Skeleton class="h-9 w-9 rounded-full" />
					<div class="space-y-2">
						<Skeleton class="h-3.5 w-40" />
						<Skeleton class="h-3 w-24" />
					</div>
				</div>
				<Skeleton class="h-6 w-16 rounded-full" />
			</div>
		{/each}
	</div>
{/if}
