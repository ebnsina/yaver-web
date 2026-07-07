<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import { isUnauthorized } from '$lib/api/client';
	import { listCustomers, setDND, type Customer } from '$lib/api/customers';

	let customers = $state<Customer[] | null>(null);
	let loading = $state(true);
	let pending = $state<Record<string, boolean>>({});

	$effect(() => {
		listCustomers()
			.then((c) => (customers = c))
			.catch((e) => {
				if (isUnauthorized(e)) goto('/login');
			})
			.finally(() => (loading = false));
	});

	async function toggle(c: Customer) {
		const next = !c.dnd;
		pending = { ...pending, [c.id]: true };
		try {
			await setDND(c.id, next);
			c.dnd = next;
		} finally {
			pending = { ...pending, [c.id]: false };
		}
	}

	const when = (iso: string) => new Date(iso).toLocaleDateString();
</script>

<div class="min-h-screen bg-gray-50">
	<Header active="customers" />

	<main class="mx-auto max-w-6xl px-6 py-10">
		<h1 class="text-2xl font-semibold tracking-tight text-gray-900">Customers</h1>
		<p class="mt-1 text-sm text-gray-500">
			Everyone we've seen from your store events. Toggle DND to stop calling someone.
		</p>

		{#if loading}
			<p class="mt-4 text-sm text-gray-500">Loading…</p>
		{:else if !customers || customers.length === 0}
			<div class="card mt-6 p-10 text-center">
				<p class="text-sm text-gray-500">No customers yet — they appear as store events arrive.</p>
			</div>
		{:else}
			<div class="card mt-6 overflow-hidden">
				<table class="w-full text-left text-sm">
					<thead class="border-b border-gray-200 bg-gray-50/70 text-xs uppercase tracking-wide text-gray-500">
						<tr>
							<th class="px-5 py-3 font-medium">Name</th>
							<th class="px-5 py-3 font-medium">Phone</th>
							<th class="px-5 py-3 font-medium">Added</th>
							<th class="px-5 py-3 text-right font-medium">Do not call</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each customers as c (c.id)}
							<tr class="hover:bg-gray-50">
								<td class="px-5 py-3.5 font-medium text-gray-900">{c.name || '—'}</td>
								<td class="px-5 py-3.5 font-mono text-gray-600">{c.phone}</td>
								<td class="px-5 py-3.5 text-gray-500">{when(c.created_at)}</td>
								<td class="px-5 py-3.5 text-right">
									<button
										role="switch"
										aria-checked={c.dnd}
										aria-label="Do not call {c.name || c.phone}"
										disabled={pending[c.id]}
										onclick={() => toggle(c)}
										class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 {c.dnd
											? 'bg-red-500'
											: 'bg-gray-200'}"
									>
										<span
											class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform {c.dnd
												? 'translate-x-4'
												: 'translate-x-0.5'}"
										></span>
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</main>
</div>
