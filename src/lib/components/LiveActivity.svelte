<script lang="ts">
	import { subscribeActivity, type ActivityEvent } from '$lib/api/activity';
	import { Phone, CircleCheckBig, MessageCircle, Activity } from '@lucide/svelte';

	// Rolling window of the most recent live events. The stream is best-effort, so
	// we just keep the last few and let older ones fall off.
	let events = $state<ActivityEvent[]>([]);
	let connected = $state(false);

	$effect(() => {
		const stop = subscribeActivity(
			(e) => {
				connected = true;
				events = [e, ...events].slice(0, 8);
			},
			() => (connected = false)
		);
		// EventSource opens optimistically; treat the mounted stream as live.
		connected = true;
		return stop;
	});

	function look(type: string) {
		if (type === 'call.completed') return { icon: CircleCheckBig, color: 'text-emerald-600', bg: 'bg-emerald-50' };
		if (type.startsWith('call.')) return { icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50' };
		if (type.startsWith('chat.')) return { icon: MessageCircle, color: 'text-violet-600', bg: 'bg-violet-50' };
		return { icon: Activity, color: 'text-gray-500', bg: 'bg-gray-100' };
	}

	const fmt = (at: string) => {
		const d = new Date(at);
		return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};
</script>

<section class="card p-6">
	<div class="flex items-center justify-between">
		<h2 class="flex items-center gap-2 text-sm font-semibold text-gray-900">
			<Activity size={16} class="text-brand-600" />Live activity
		</h2>
		<span class="flex items-center gap-1.5 text-xs text-gray-400">
			<span class="relative flex h-2 w-2">
				{#if connected}
					<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
				{/if}
				<span class="relative inline-flex h-2 w-2 rounded-full {connected ? 'bg-emerald-500' : 'bg-gray-300'}"></span>
			</span>
			{connected ? 'Live' : 'Offline'}
		</span>
	</div>

	{#if events.length === 0}
		<p class="mt-4 text-sm text-gray-400">Waiting for activity — new calls and chats appear here in real time.</p>
	{:else}
		<ul class="mt-4 space-y-3">
			{#each events as e, i (e.at + i)}
				{@const l = look(e.type)}
				{@const Icon = l.icon}
				<li class="flex items-start gap-3">
					<span class="mt-0.5 rounded-lg {l.bg} p-1.5"><Icon size={14} class={l.color} /></span>
					<div class="min-w-0 flex-1">
						<p class="text-sm text-gray-900">{e.title}</p>
						{#if e.detail}<p class="truncate text-xs text-gray-500">{e.detail}</p>{/if}
					</div>
					<span class="shrink-0 font-mono text-xs text-gray-400">{fmt(e.at)}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>
