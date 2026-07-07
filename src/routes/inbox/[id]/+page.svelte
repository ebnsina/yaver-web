<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import { isUnauthorized } from '$lib/api/client';
	import { getMessages, listConversations, type ChatMessage, type Conversation } from '$lib/api/chat';

	let messages = $state<ChatMessage[]>([]);
	let convo = $state<Conversation | null>(null);
	let loading = $state(true);
	let notFound = $state(false);

	$effect(() => {
		const id = page.params.id;
		if (!id) return;
		Promise.all([getMessages(id), listConversations()])
			.then(([m, list]) => {
				messages = m;
				convo = list.find((c) => c.id === id) ?? null;
			})
			.catch((e) => {
				if (isUnauthorized(e)) goto('/login');
				else notFound = true;
			})
			.finally(() => (loading = false));
	});

	const channelLabel = (ch?: string) =>
		ch === 'whatsapp' ? 'WhatsApp' : ch === 'messenger' ? 'Messenger' : 'Website';
	const at = (iso: string) => new Date(iso).toLocaleString();
</script>

<div class="min-h-screen bg-gray-50">
	<Header active="inbox" />

	<main class="mx-auto max-w-3xl px-6 py-10">
		<a href="/inbox" class="text-sm text-gray-500 hover:text-gray-900">← Inbox</a>

		{#if loading}
			<p class="mt-4 text-sm text-gray-500">Loading…</p>
		{:else if notFound}
			<p class="mt-4 text-sm text-gray-500">Conversation not found.</p>
		{:else}
			<div class="mt-3 flex items-center gap-3">
				<h1 class="text-xl font-semibold tracking-tight text-gray-900">
					{convo?.customer ?? 'Conversation'}
				</h1>
				{#if convo}
					<span
						class="badge {convo.channel === 'whatsapp'
							? 'bg-green-50 text-green-700'
							: convo.channel === 'messenger'
								? 'bg-blue-50 text-blue-700'
								: 'bg-gray-100 text-gray-600'}"
					>
						{channelLabel(convo.channel)}
					</span>
				{/if}
			</div>

			<div class="card mt-6 flex flex-col gap-5 p-6">
				{#each messages as m, i (i)}
					{#if m.role === 'user'}
						<div class="max-w-[80%] self-end rounded-2xl rounded-br-md bg-gray-900 px-4 py-2.5 text-sm whitespace-pre-wrap text-white">
							{m.content}
						</div>
					{:else}
						<div class="flex max-w-[85%] gap-3 self-start">
							<div class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white">Y</div>
							<div class="pt-1 text-sm leading-relaxed whitespace-pre-wrap text-gray-900">
								{m.content}
							</div>
						</div>
					{/if}
				{/each}
			</div>
			<p class="mt-3 text-xs text-gray-400">Read-only. Replies are handled automatically by your assistant.</p>
		{/if}
	</main>
</div>
