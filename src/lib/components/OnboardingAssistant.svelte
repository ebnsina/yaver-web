<script lang="ts">
	import { Sparkles, Send } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { askOnboarding, type OnboardingProgress } from '$lib/api/onboarding';

	let { progress }: { progress: OnboardingProgress } = $props();

	let question = $state('');
	let answer = $state<string | null>(null);
	let busy = $state(false);
	let error = $state(false);

	const suggestions = [
		'How do I connect my store?',
		'How do I send a test call?',
		'How do I add chat to my website?'
	];

	async function ask(q: string) {
		if (!q.trim()) return;
		question = q;
		busy = true;
		error = false;
		answer = null;
		try {
			answer = (await askOnboarding(q, progress)).answer;
		} catch {
			error = true;
		} finally {
			busy = false;
		}
	}
</script>

<section class="card p-6">
	<h2 class="flex items-center gap-2 text-sm font-semibold text-gray-900">
		<Sparkles size={16} class="text-brand-600" /> Setup assistant
	</h2>
	<p class="mt-1 text-sm text-gray-500">Ask anything about setting up Yaver.</p>

	<form class="mt-4 flex gap-2" onsubmit={(e) => (e.preventDefault(), ask(question))}>
		<Input bind:value={question} placeholder="How do I…?" class="flex-1" />
		<Button disabled={busy}><Send size={15} />{busy ? '…' : 'Ask'}</Button>
	</form>

	<div class="mt-3 flex flex-wrap gap-2">
		{#each suggestions as s (s)}
			<button
				type="button"
				onclick={() => ask(s)}
				class="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-brand-300 hover:text-brand-700"
			>
				{s}
			</button>
		{/each}
	</div>

	{#if answer}
		<p class="mt-4 whitespace-pre-line rounded-xl bg-brand-50 px-4 py-3 text-sm leading-relaxed text-gray-800">
			{answer}
		</p>
	{:else if error}
		<p class="mt-4 text-sm text-red-600">The assistant is unavailable right now.</p>
	{/if}
</section>
