<script lang="ts">
	import { goto } from '$app/navigation';
	import { me, logout } from '$lib/api/auth';
	import { isUnauthorized } from '$lib/api/client';

	let {
		active
	}: { active: 'dashboard' | 'calls' | 'customers' | 'campaigns' | 'flows' | 'settings' } = $props();

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
		{ key: 'dashboard', label: 'Dashboard', href: '/' },
		{ key: 'calls', label: 'Calls', href: '/calls' },
		{ key: 'customers', label: 'Customers', href: '/customers' },
		{ key: 'campaigns', label: 'Campaigns', href: '/campaigns' },
		{ key: 'flows', label: 'Flows', href: '/flows' },
		{ key: 'settings', label: 'Settings', href: '/settings' }
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
				<svg class="h-3 w-3 text-gray-400" viewBox="0 0 12 12" fill="none"><path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</span>
			<span class="text-gray-300">/</span>
			<span class="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100">
				{orgName || '…'}
				<svg class="h-3 w-3 text-gray-400" viewBox="0 0 12 12" fill="none"><path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</span>
			<span class="text-gray-300">/</span>
			<span class="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100">
				<span class="h-2 w-2 rounded-full bg-green-500"></span>
				Live
				<svg class="h-3 w-3 text-gray-400" viewBox="0 0 12 12" fill="none"><path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</span>
		</div>

		<div class="flex items-center gap-4 text-sm text-gray-500">
			<div class="hidden items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-gray-400 md:flex">
				<svg class="h-4 w-4" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/><path d="m11 11 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
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
					<svg class="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1c-2.5 0-6 1.2-6 3.5V14h12v-1.5C14 10.2 10.5 9 8 9Z"/></svg>
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
				<a
					href={t.href}
					class="border-b-2 pb-3 pt-1 {active === t.key
						? 'border-gray-900 font-medium text-gray-900'
						: 'border-transparent text-gray-500 hover:text-gray-900'}"
				>
					{t.label}
				</a>
			{/each}
		</nav>
	</div>
</header>
