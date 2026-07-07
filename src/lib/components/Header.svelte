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
		CircleUser
	} from '@lucide/svelte';

	let {
		active
	}: {
		active:
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
	let menuOpen = $state(false);

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

	const tabs = [
		{ key: 'dashboard', label: 'Dashboard', href: '/', icon: LayoutDashboard },
		{ key: 'calls', label: 'Calls', href: '/calls', icon: Phone },
		{ key: 'chat', label: 'Chat', href: '/chat', icon: MessageCircle },
		{ key: 'inbox', label: 'Inbox', href: '/inbox', icon: Inbox },
		{ key: 'customers', label: 'Customers', href: '/customers', icon: Users },
		{ key: 'campaigns', label: 'Campaigns', href: '/campaigns', icon: Megaphone },
		{ key: 'flows', label: 'Flows', href: '/flows', icon: Workflow },
		{ key: 'settings', label: 'Settings', href: '/settings', icon: Settings }
	] as const;
</script>

<header class="sticky top-0 z-30 border-b border-gray-200 bg-white/85 backdrop-blur-md">
	<!-- top bar: brand + breadcrumb switchers / search + docs + avatar -->
	<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
		<div class="flex items-center gap-2">
			<div
				class="flex h-6 w-6 items-center justify-center rounded-md bg-gray-900 text-xs font-bold text-white"
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
			<div class="hidden items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-gray-400 md:flex">
				<Search size={16} />
				<span>Search</span>
				<kbd class="ml-8 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">⌘K</kbd>
			</div>
			<a href="/" class="hover:text-gray-900">Docs</a>
			<a href="/" class="hover:text-gray-900">Help</a>
			<div class="relative">
				<button
					onclick={() => (menuOpen = !menuOpen)}
					class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
					aria-label="Account menu"
					aria-expanded={menuOpen}
				>
					<CircleUser size={18} />
				</button>
				{#if menuOpen}
					<!-- click-away backdrop -->
					<button
						class="fixed inset-0 z-10 cursor-default"
						aria-label="Close menu"
						onclick={() => (menuOpen = false)}
					></button>
					<div
						class="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white py-1"
					>
						<div class="px-3 py-2 text-xs text-gray-400">Signed in as</div>
						<div class="truncate px-3 pb-2 font-mono text-sm text-gray-900">{phone || '—'}</div>
						<div class="border-t border-gray-100"></div>
						<button
							onclick={signOut}
							class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
						>
							Sign out
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- tab nav -->
	<div class="mx-auto max-w-6xl px-6">
		<nav class="-mb-px flex gap-6 text-sm">
			{#each tabs as t (t.key)}
				{@const Icon = t.icon}
				<a
					href={t.href}
					class="flex items-center gap-1.5 border-b-2 pb-3 pt-1 {active === t.key
						? 'border-gray-900 font-medium text-gray-900'
						: 'border-transparent text-gray-500 hover:text-gray-900'}"
				>
					<Icon size={15} />
					{t.label}
				</a>
			{/each}
		</nav>
	</div>
</header>
