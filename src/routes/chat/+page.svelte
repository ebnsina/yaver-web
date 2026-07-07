<script lang="ts">
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import { isUnauthorized } from '$lib/api/client';
	import { Plus, History, ChevronDown, ArrowUp } from '@lucide/svelte';
	import {
		listConversations,
		getMessages,
		sendMessage,
		type Conversation,
		type ChatMessage
	} from '$lib/api/chat';

	type Msg = { role: string; content: string };

	let conversations = $state<Conversation[]>([]);
	let activeId = $state<string | null>(null);
	let messages = $state<Msg[]>([]);
	let input = $state('');
	let thinking = $state(false); // waiting for the reply
	let streaming = $state(false); // revealing the reply
	let historyOpen = $state(false);
	let scroller = $state<HTMLElement | null>(null);

	const busy = $derived(thinking || streaming);

	async function refreshList() {
		conversations = await listConversations();
	}

	$effect(() => {
		refreshList().catch((e) => {
			if (isUnauthorized(e)) goto('/login');
		});
	});

	async function scrollDown() {
		await tick();
		scroller?.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
	}

	const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

	async function openConversation(id: string) {
		historyOpen = false;
		activeId = id;
		const msgs = await getMessages(id);
		messages = msgs.map((m: ChatMessage) => ({ role: m.role, content: m.content }));
		scrollDown();
	}

	function newChat() {
		historyOpen = false;
		activeId = null;
		messages = [];
		input = '';
	}

	// Reveal the assistant reply word-by-word for a live, streamed feel.
	async function streamReply(full: string) {
		streaming = true;
		messages = [...messages, { role: 'assistant', content: '' }];
		const words = full.split(' ');
		let shown = '';
		for (const w of words) {
			shown += (shown ? ' ' : '') + w;
			messages[messages.length - 1] = { role: 'assistant', content: shown };
			messages = [...messages];
			scrollDown();
			await sleep(24);
		}
		streaming = false;
	}

	async function send() {
		const text = input.trim();
		if (!text || busy) return;
		input = '';
		messages = [...messages, { role: 'user', content: text }];
		thinking = true;
		scrollDown();
		try {
			const r = await sendMessage(text, activeId ?? undefined);
			activeId = r.conversation_id;
			thinking = false;
			await streamReply(r.reply);
			await refreshList();
		} catch {
			thinking = false;
			messages = [...messages, { role: 'assistant', content: '⚠️ Something went wrong. Please try again.' }];
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}
</script>

<div class="flex h-screen flex-col bg-gray-50">
	<Header active="chat" />

	<main class="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden px-4">
		<!-- toolbar -->
		<div class="flex shrink-0 items-center justify-between py-3">
			<div>
				<h1 class="text-sm font-semibold text-gray-900">Assistant playground</h1>
				<p class="text-xs text-gray-400">The same replies power your embeddable chat widget.</p>
			</div>
			<div class="flex items-center gap-2">
				<div class="relative">
					<button onclick={() => (historyOpen = !historyOpen)} class="btn-secondary px-3 py-1.5">
						<History size={15} />
						History
						<ChevronDown size={14} class="text-gray-400" />
					</button>
					{#if historyOpen}
						<button class="fixed inset-0 z-10 cursor-default" aria-label="Close" onclick={() => (historyOpen = false)}></button>
						<div class="absolute right-0 z-20 mt-2 max-h-80 w-80 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1">
							{#if conversations.length === 0}
								<p class="px-4 py-3 text-sm text-gray-400">No conversations yet.</p>
							{:else}
								{#each conversations as c (c.id)}
									<button
										onclick={() => openConversation(c.id)}
										class="block w-full px-4 py-2.5 text-left hover:bg-gray-50 {activeId === c.id ? 'bg-gray-50' : ''}"
									>
										<p class="truncate text-sm text-gray-800">{c.last_message || 'New conversation'}</p>
										<p class="mt-0.5 font-mono text-xs text-gray-400">{c.message_count} messages</p>
									</button>
								{/each}
							{/if}
						</div>
					{/if}
				</div>
				<button onclick={newChat} class="btn-primary px-3 py-1.5"><Plus size={15} />New chat</button>
			</div>
		</div>

		<!-- messages -->
		<div bind:this={scroller} class="flex flex-1 flex-col gap-6 overflow-y-auto py-4">
			{#if messages.length === 0 && !thinking}
				<div class="flex flex-1 flex-col items-center justify-center text-center">
					<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-lg font-bold text-white">Y</div>
					<p class="mt-4 text-base font-medium text-gray-900">How can I help?</p>
					<p class="mt-1 text-sm text-gray-400">Try "where is my order?" or "I want a refund".</p>
				</div>
			{/if}

			{#each messages as m, i (i)}
				{#if m.role === 'user'}
					<!-- user: right-aligned bubble -->
					<div class="max-w-[80%] self-end whitespace-pre-wrap rounded-2xl rounded-br-md bg-gray-900 px-4 py-2.5 text-sm text-white">
						{m.content}
					</div>
				{:else}
					<!-- assistant: avatar + prose, left -->
					<div class="flex max-w-[85%] gap-3 self-start">
						<div class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white">Y</div>
						<div class="whitespace-pre-wrap pt-1 text-sm leading-relaxed text-gray-900">
							{m.content}{#if streaming && i === messages.length - 1}<span class="caret"></span>{/if}
						</div>
					</div>
				{/if}
			{/each}

			{#if thinking}
				<div class="flex gap-3 self-start">
					<div class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white">Y</div>
					<div class="flex items-center gap-1 pt-2.5">
						<span class="dot"></span>
						<span class="dot" style="animation-delay:.2s"></span>
						<span class="dot" style="animation-delay:.4s"></span>
					</div>
				</div>
			{/if}
		</div>

		<!-- composer -->
		<div class="shrink-0 pb-5 pt-1">
			<div class="flex items-end gap-2 rounded-2xl border border-gray-300 bg-white p-2 focus-within:border-gray-400">
				<textarea
					bind:value={input}
					onkeydown={onKeydown}
					rows="1"
					placeholder="Message the assistant…"
					class="max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
				></textarea>
				<button
					onclick={send}
					disabled={busy || !input.trim()}
					aria-label="Send"
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white transition-colors hover:bg-gray-800 disabled:opacity-40"
				>
					<ArrowUp size={18} />
				</button>
			</div>
			<p class="mt-2 text-center text-xs text-gray-400">Enter to send · Shift+Enter for a new line</p>
		</div>
	</main>
</div>

<style>
	.dot {
		width: 6px;
		height: 6px;
		border-radius: 9999px;
		background: #9ca3af;
		animation: blink 1.3s infinite both;
	}
	@keyframes blink {
		0%,
		80%,
		100% {
			opacity: 0.2;
		}
		40% {
			opacity: 1;
		}
	}
	.caret {
		display: inline-block;
		width: 2px;
		height: 1em;
		margin-left: 1px;
		vertical-align: text-bottom;
		background: #111827;
		animation: caret 1s steps(1) infinite;
	}
	@keyframes caret {
		50% {
			opacity: 0;
		}
	}
</style>
