<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import { isUnauthorized } from '$lib/api/client';
	import { listConversations, type Conversation } from '$lib/api/chat';

	let conversations = $state<Conversation[] | null>(null);
	let loading = $state(true);

	$effect(() => {
		listConversations()
			.then((c) => (conversations = c))
			.catch((e) => {
				if (isUnauthorized(e)) goto('/login');
			})
			.finally(() => (loading = false));
	});

	const channelBadge = (ch: string) =>
		ch === 'whatsapp'
			? 'bg-green-50 text-green-700'
			: ch === 'messenger'
				? 'bg-blue-50 text-blue-700'
				: 'bg-gray-100 text-gray-600';
	const channelLabel = (ch: string) =>
		ch === 'whatsapp' ? 'WhatsApp' : ch === 'messenger' ? 'Messenger' : 'Website';
	const when = (iso: string) => new Date(iso).toLocaleString();
</script>

<div class="min-h-screen bg-gray-50">
	<Header active="inbox" />

	<main class="mx-auto max-w-6xl px-6 py-10">
		<h1 class="text-2xl font-semibold tracking-tight text-gray-900">Inbox</h1>
		<p class="mt-1 text-sm text-gray-500">Every customer conversation, across all your channels.</p>

		{#if loading}
			<p class="mt-4 text-sm text-gray-500">Loading…</p>
		{:else if !conversations || conversations.length === 0}
			<div class="card mt-6 p-10 text-center">
				<p class="text-sm text-gray-500">
					No conversations yet — they appear here when customers chat with you.
				</p>
			</div>
		{:else}
			<div class="card mt-6 divide-y divide-gray-100 overflow-hidden">
				{#each conversations as c (c.id)}
					<a href="/inbox/{c.id}" class="flex items-center gap-4 px-5 py-4 hover:bg-gray-50">
						<span class="badge {channelBadge(c.channel)} shrink-0">{channelLabel(c.channel)}</span>
						<div class="min-w-0 flex-1">
							<div class="flex items-center justify-between gap-3">
								<span class="truncate font-medium text-gray-900">{c.customer}</span>
								<span class="shrink-0 text-xs text-gray-400">{when(c.updated_at)}</span>
							</div>
							<p class="mt-0.5 truncate text-sm text-gray-500">{c.last_message}</p>
						</div>
						<span class="shrink-0 font-mono text-xs text-gray-400">{c.message_count} msgs</span>
						<span class="shrink-0 text-gray-300">›</span>
					</a>
				{/each}
			</div>
		{/if}
	</main>
</div>
