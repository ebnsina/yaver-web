<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Compass, ServerCrash, TriangleAlert, ArrowLeft, LayoutDashboard } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	// One page handles every error status. Copy + accent adapt to the class of error.
	const meta = $derived.by(() => {
		const s = page.status;
		if (s === 404)
			return { icon: Compass, color: 'text-brand-600', bg: 'bg-brand-50', title: 'Page not found', hint: 'The page you’re looking for doesn’t exist or may have moved.' };
		if (s >= 500)
			return { icon: ServerCrash, color: 'text-red-600', bg: 'bg-red-50', title: 'Something went wrong', hint: 'An unexpected error occurred on our end. Please try again in a moment.' };
		return { icon: TriangleAlert, color: 'text-amber-600', bg: 'bg-amber-50', title: 'Something’s not right', hint: page.error?.message ?? 'The request could not be completed.' };
	});

	const Icon = $derived(meta.icon);
</script>

<svelte:head><title>{page.status} · Yaver</title></svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-6">
	<div class="w-full max-w-md text-center">
		<span class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl {meta.bg}">
			<Icon size={26} class={meta.color} />
		</span>

		<p class="mt-6 font-mono text-sm font-medium tracking-wider text-gray-400">ERROR {page.status}</p>
		<h1 class="mt-1 text-2xl font-semibold tracking-tight text-gray-900">{meta.title}</h1>
		<p class="mt-2 text-sm leading-relaxed text-gray-500">{meta.hint}</p>

		{#if page.error?.message && page.status !== 404}
			<p class="mt-4 rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-500">
				{page.error.message}
			</p>
		{/if}

		<div class="mt-8 flex items-center justify-center gap-3">
			<Button variant="outline" onclick={() => history.back()}>
				<ArrowLeft size={16} /> Go back
			</Button>
			<Button onclick={() => goto('/')}>
				<LayoutDashboard size={16} /> Dashboard
			</Button>
		</div>
	</div>
</div>
