<script lang="ts">
	import { goto } from '$app/navigation';
	import { me, logout, type Me } from '$lib/api/auth';

	let user = $state<Me | null>(null);
	let loading = $state(true);

	$effect(() => {
		me()
			.then((u) => (user = u))
			.catch(() => goto('/login'))
			.finally(() => (loading = false));
	});

	async function signOut() {
		await logout();
		await goto('/login');
	}
</script>

<div class="min-h-screen bg-gray-50">
	<header class="border-b border-gray-200 bg-white">
		<div class="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
			<span class="text-lg font-semibold text-gray-900">Yaver</span>
			{#if user}
				<nav class="flex flex-1 gap-4 text-sm">
					<a href="/" class="font-medium text-gray-900">Dashboard</a>
					<a href="/calls" class="text-gray-500 hover:text-gray-900">Calls</a>
					<a href="/settings" class="text-gray-500 hover:text-gray-900">Settings</a>
				</nav>
				<div class="flex items-center gap-4 text-sm">
					<span class="text-gray-500">{user.phone}</span>
					<button onclick={signOut} class="text-gray-700 hover:text-gray-900">Sign out</button>
				</div>
			{/if}
		</div>
	</header>

	<main class="mx-auto max-w-5xl px-6 py-10">
		{#if loading}
			<p class="text-sm text-gray-500">Loading…</p>
		{:else if user}
			<h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
			<p class="mt-2 text-sm text-gray-500">
				Signed in as <span class="font-medium text-gray-700">{user.phone}</span>. Calls, webhooks,
				and settings screens land in the next slices.
			</p>
		{/if}
	</main>
</div>
