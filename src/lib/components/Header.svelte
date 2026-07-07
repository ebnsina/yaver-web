<script lang="ts">
	import { goto } from '$app/navigation';
	import { me, logout } from '$lib/api/auth';

	let { active }: { active: 'dashboard' | 'calls' | 'settings' } = $props();

	let phone = $state('');

	$effect(() => {
		me()
			.then((u) => (phone = u.phone))
			.catch(() => goto('/login'));
	});

	async function signOut() {
		await logout();
		await goto('/login');
	}

	const tabs = [
		{ key: 'dashboard', label: 'Dashboard', href: '/' },
		{ key: 'calls', label: 'Calls', href: '/calls' },
		{ key: 'settings', label: 'Settings', href: '/settings' }
	] as const;
</script>

<header class="border-b border-gray-200 bg-white">
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
				My Store
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
			<button
				onclick={signOut}
				title={phone ? `Sign out (${phone})` : 'Sign out'}
				class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
				aria-label="Sign out"
			>
				<svg class="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1c-2.5 0-6 1.2-6 3.5V14h12v-1.5C14 10.2 10.5 9 8 9Z"/></svg>
			</button>
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
