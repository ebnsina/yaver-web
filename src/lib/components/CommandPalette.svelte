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

	type Item = { label: string; icon: typeof Phone; keywords?: string; href: string };

	const groups: { heading: string; items: Item[] }[] = [
		{
			heading: 'Navigate',
			items: [
				{ label: 'Dashboard', icon: LayoutDashboard, href: '/' },
				{ label: 'Calls', icon: Phone, href: '/calls' },
				{ label: 'Chat', icon: MessageCircle, href: '/chat' },
				{ label: 'Inbox', icon: Inbox, href: '/inbox' },
				{ label: 'Customers', icon: Users, href: '/customers' },
				{ label: 'Campaigns', icon: Megaphone, href: '/campaigns' },
				{ label: 'Flows', icon: Workflow, href: '/flows' },
				{ label: 'Settings', icon: Settings, href: '/settings' },
				{ label: 'Docs & help', icon: BookOpen, keywords: 'documentation guide support', href: '/docs' }
			]
		},
		{
			heading: 'Actions',
			items: [
				{ label: 'New flow', icon: Plus, keywords: 'create build ivr', href: '/flows/new' },
				{ label: 'Top up credits', icon: Wallet, keywords: 'billing balance pay', href: '/settings' }
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
						<Icon class="text-muted-foreground" />
						<span>{it.label}</span>
					</Command.Item>
				{/each}
			</Command.Group>
		{/each}
	</Command.List>
</Command.Dialog>
