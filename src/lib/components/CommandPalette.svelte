<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Command from '$lib/components/ui/command/index.js';
	import {
		LayoutDashboard,
		Phone,
		MessageCircle,
		Inbox,
		Users,
		Megaphone,
		Workflow,
		Settings,
		BookOpen,
		Wallet,
		Plus
	} from '@lucide/svelte';

	// Bindable so the Header search box can open it; the component owns the global
	// ⌘K / Ctrl+K shortcut. Filtering + arrow-key nav come from the Command primitive.
	let { open = $bindable(false) }: { open?: boolean } = $props();

	type Item = { label: string; icon: typeof Phone; color: string; keywords?: string; href: string };

	const groups: { heading: string; items: Item[] }[] = [
		{
			heading: 'Navigate',
			items: [
				{ label: 'Dashboard', icon: LayoutDashboard, color: 'text-brand-600', href: '/' },
				{ label: 'Calls', icon: Phone, color: 'text-blue-600', href: '/calls' },
				{ label: 'Chat', icon: MessageCircle, color: 'text-emerald-600', href: '/chat' },
				{ label: 'Inbox', icon: Inbox, color: 'text-amber-600', href: '/inbox' },
				{ label: 'Customers', icon: Users, color: 'text-pink-600', href: '/customers' },
				{ label: 'Campaigns', icon: Megaphone, color: 'text-orange-600', href: '/campaigns' },
				{ label: 'Flows', icon: Workflow, color: 'text-cyan-600', href: '/flows' },
				{ label: 'Settings', icon: Settings, color: 'text-slate-600', href: '/settings' },
				{ label: 'Docs & help', icon: BookOpen, color: 'text-violet-600', keywords: 'documentation guide support', href: '/docs' }
			]
		},
		{
			heading: 'Actions',
			items: [
				{ label: 'New flow', icon: Plus, color: 'text-cyan-600', keywords: 'create build ivr', href: '/flows/new' },
				{ label: 'Top up credits', icon: Wallet, color: 'text-green-600', keywords: 'billing balance pay', href: '/settings' }
			]
		}
	];

	function run(href: string) {
		open = false;
		goto(href);
	}

	function onWindowKey(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			open = !open;
		}
	}
</script>

<svelte:window onkeydown={onWindowKey} />

<Command.Dialog bind:open>
	<Command.Input placeholder="Search pages and actions…" />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		{#each groups as g (g.heading)}
			<Command.Group heading={g.heading}>
				{#each g.items as it (it.label)}
					{@const Icon = it.icon}
					<Command.Item value={`${it.label} ${it.keywords ?? ''}`} onSelect={() => run(it.href)}>
						<Icon class={it.color} />
						<span>{it.label}</span>
					</Command.Item>
				{/each}
			</Command.Group>
		{/each}
	</Command.List>
</Command.Dialog>
