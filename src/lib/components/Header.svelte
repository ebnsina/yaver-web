<script lang="ts">
	import { goto } from '$app/navigation';
	import { me, logout } from '$lib/api/auth';
	import { isUnauthorized } from '$lib/api/client';
	import {
		LayoutDashboard,
		Phone,
		MessageCircle,
		Inbox,
		Users,
		Megaphone,
		Workflow,
		Settings,
		Search,
		ChevronDown,
		CircleUser,
		BookOpen,
		LifeBuoy
	} from '@lucide/svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	let {
		active
	}: {
		active?:
			| 'dashboard'
			| 'calls'
			| 'chat'
			| 'inbox'
			| 'customers'
			| 'campaigns'
			| 'flows'
			| 'settings';
	} = $props();

	let phone = $state('');
	let orgName = $state('');
	let searchOpen = $state(false);

	$effect(() => {
		me()
			.then((u) => {
				phone = u.phone;
				orgName = u.org.name;
			})
			.catch((e) => {
				// Only a real 401 signs you out; ignore transient errors.
				if (isUnauthorized(e)) goto('/login');
			});
	});

	async function signOut() {
		await logout();
		await goto('/login');
	}

	// Each tab carries its own accent so the nav reads as a set of colored icons,
	// not a wall of gray. The active tab underlines in its own hue.
	const tabs = [
		{ key: 'dashboard', label: 'Dashboard', href: '/', icon: LayoutDashboard, color: 'text-brand-600', border: 'border-brand-600' },
		{ key: 'calls', label: 'Calls', href: '/calls', icon: Phone, color: 'text-blue-600', border: 'border-blue-600' },
		{ key: 'chat', label: 'Chat', href: '/chat', icon: MessageCircle, color: 'text-emerald-600', border: 'border-emerald-600' },
		{ key: 'inbox', label: 'Inbox', href: '/inbox', icon: Inbox, color: 'text-amber-600', border: 'border-amber-600' },
		{ key: 'customers', label: 'Customers', href: '/customers', icon: Users, color: 'text-pink-600', border: 'border-pink-600' },
		{ key: 'campaigns', label: 'Campaigns', href: '/campaigns', icon: Megaphone, color: 'text-orange-600', border: 'border-orange-600' },
		{ key: 'flows', label: 'Flows', href: '/flows', icon: Workflow, color: 'text-cyan-600', border: 'border-cyan-600' },
		{ key: 'settings', label: 'Settings', href: '/settings', icon: Settings, color: 'text-slate-600', border: 'border-slate-600' }
	] as const;
</script>

<header class="sticky top-0 z-30 border-b border-gray-200 bg-white/85 backdrop-blur-md">
	<!-- top bar: brand + breadcrumb switchers / search + docs + avatar -->
	<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
		<div class="flex items-center gap-2">
			<div
				class="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white"
			>
				Y
			</div>
			<span class="ml-1 flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100">
				Yaver
				<ChevronDown class="text-gray-400" size={14} />
			</span>
			<span class="text-gray-300">/</span>
			<span class="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100">
				{orgName || '…'}
				<ChevronDown class="text-gray-400" size={14} />
			</span>
			<span class="text-gray-300">/</span>
			<span class="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100">
				<span class="h-2 w-2 rounded-full bg-green-500"></span>
				Live
				<ChevronDown class="text-gray-400" size={14} />
			</span>
		</div>

		<div class="flex items-center gap-4 text-sm text-gray-500">
			<Button
				variant="outline"
				size="sm"
				onclick={() => (searchOpen = true)}
				class="hidden text-gray-400 md:inline-flex"
			>
				<Search />
				<span>Search</span>
				<kbd class="ml-8 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">⌘K</kbd>
			</Button>
			<a href="/docs" class="flex items-center gap-1.5 hover:text-gray-900">
				<BookOpen size={15} class="text-violet-500" />Docs
			</a>
			<a href="/docs#support" class="flex items-center gap-1.5 hover:text-gray-900">
				<LifeBuoy size={15} class="text-emerald-500" />Help
			</a>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-gray-600 outline-none hover:bg-gray-300"
					aria-label="Account menu"
				>
					<CircleUser size={18} />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="w-52">
					<DropdownMenu.Label class="text-xs font-normal text-gray-400">Signed in as</DropdownMenu.Label>
					<p class="truncate px-2 pb-1 font-mono text-sm text-gray-900">{phone || '—'}</p>
					<Separator class="my-1" />
					<DropdownMenu.Item onSelect={signOut}>Sign out</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>

	<!-- tab nav -->
	<div class="mx-auto max-w-6xl px-6">
		<nav class="-mb-px flex gap-6 text-sm">
			{#each tabs as t (t.key)}
				{@const Icon = t.icon}
				{@const isActive = active === t.key}
				<a
					href={t.href}
					class="flex items-center gap-1.5 border-b-2 pb-3 pt-1 transition-colors {isActive
						? `${t.border} font-medium ${t.color}`
						: 'border-transparent text-gray-500 hover:text-gray-900'}"
				>
					<Icon size={15} class={isActive ? t.color : 'text-gray-400'} />
					{t.label}
				</a>
			{/each}
		</nav>
	</div>
</header>

<CommandPalette bind:open={searchOpen} />
