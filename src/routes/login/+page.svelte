<script lang="ts">
	import { goto } from '$app/navigation';
	import { requestOtp, verifyOtp, type ApiError } from '$lib/api/auth';

	let step = $state<'phone' | 'code'>('phone');
	let phone = $state('');
	let code = $state('');
	let devCode = $state<string | null>(null);
	let error = $state<string | null>(null);
	let busy = $state(false);

	async function sendCode(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		busy = true;
		try {
			const res = await requestOtp(phone);
			devCode = res.dev_code ?? null; // dev only, until SMS is wired
			step = 'code';
		} catch (err) {
			error = (err as ApiError).error ?? 'could not send code';
		} finally {
			busy = false;
		}
	}

	async function confirm(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		busy = true;
		try {
			await verifyOtp(phone, code);
			await goto('/');
		} catch (err) {
			error = (err as ApiError).error ?? 'invalid code';
		} finally {
			busy = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
	<div class="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
		<h1 class="text-xl font-semibold text-gray-900">Sign in to Yaver</h1>
		<p class="mt-1 text-sm text-gray-500">
			{step === 'phone' ? 'Enter your phone number' : `Code sent to ${phone}`}
		</p>

		{#if step === 'phone'}
			<form class="mt-6 space-y-4" onsubmit={sendCode}>
				<input
					bind:value={phone}
					type="tel"
					placeholder="01712345678"
					autocomplete="tel"
					required
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
				/>
				<button
					disabled={busy}
					class="w-full rounded-lg bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
				>
					{busy ? 'Sending…' : 'Send code'}
				</button>
			</form>
		{:else}
			<form class="mt-6 space-y-4" onsubmit={confirm}>
				{#if devCode}
					<p class="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
						Dev code: <span class="font-mono font-semibold">{devCode}</span>
					</p>
				{/if}
				<input
					bind:value={code}
					inputmode="numeric"
					placeholder="6-digit code"
					required
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-lg tracking-widest outline-none focus:border-gray-900"
				/>
				<button
					disabled={busy}
					class="w-full rounded-lg bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
				>
					{busy ? 'Verifying…' : 'Verify'}
				</button>
				<button
					type="button"
					onclick={() => (step = 'phone')}
					class="w-full text-center text-xs text-gray-500 hover:text-gray-700"
				>
					Use a different number
				</button>
			</form>
		{/if}

		{#if error}
			<p class="mt-4 text-sm text-red-600">{error}</p>
		{/if}
	</div>
</div>
