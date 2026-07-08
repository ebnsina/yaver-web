<script lang="ts">
	import { goto } from '$app/navigation';
	import { requestOtp, verifyOtp, register, login, type ApiError } from '$lib/api/auth';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	let method = $state<'phone' | 'email'>('phone');

	// Phone-OTP
	let step = $state<'phone' | 'code'>('phone');
	let phone = $state('');
	let code = $state('');
	let devCode = $state<string | null>(null);

	// Email/password
	let emailMode = $state<'login' | 'register'>('login');
	let email = $state('');
	let password = $state('');
	let name = $state('');

	let error = $state<string | null>(null);
	let busy = $state(false);

	async function run(fn: () => Promise<void>) {
		error = null;
		busy = true;
		try {
			await fn();
		} catch (err) {
			error = (err as ApiError).error ?? 'something went wrong';
		} finally {
			busy = false;
		}
	}

	const sendCode = (e: SubmitEvent) => {
		e.preventDefault();
		run(async () => {
			const res = await requestOtp(phone);
			devCode = res.dev_code ?? null;
			step = 'code';
		});
	};

	const confirm = (e: SubmitEvent) => {
		e.preventDefault();
		run(async () => {
			await verifyOtp(phone, code);
			await goto('/');
		});
	};

	const submitEmail = (e: SubmitEvent) => {
		e.preventDefault();
		run(async () => {
			if (emailMode === 'register') await register(email, password, name);
			else await login(email, password);
			await goto('/');
		});
	};
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
	<div class="w-full max-w-sm">
		<div class="mb-6 flex flex-col items-center text-center">
			<div class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
				Y
			</div>
			<h1 class="mt-4 text-xl font-semibold tracking-tight text-gray-900">Sign in to Yaver</h1>
		</div>

		<div class="card p-6">
			<!-- method tabs -->
			<div class="mb-5 grid grid-cols-2 rounded-lg bg-gray-100 p-1 text-sm font-medium">
				<button
					type="button"
					onclick={() => ((method = 'phone'), (error = null))}
					class="rounded-md py-1.5 {method === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}"
				>
					Phone
				</button>
				<button
					type="button"
					onclick={() => ((method = 'email'), (error = null))}
					class="rounded-md py-1.5 {method === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}"
				>
					Email
				</button>
			</div>

			{#if method === 'phone'}
				{#if step === 'phone'}
					<form class="space-y-3" onsubmit={sendCode}>
						<Input bind:value={phone} type="tel" placeholder="01712345678" autocomplete="tel" required class="w-full" />
						<Button disabled={busy} class="w-full">{busy ? 'Sending…' : 'Send code'}</Button>
					</form>
				{:else}
					<form class="space-y-3" onsubmit={confirm}>
						{#if devCode}
							<p class="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
								Dev code: <span class="font-mono font-semibold">{devCode}</span>
							</p>
						{/if}
						<Input bind:value={code} inputmode="numeric" placeholder="••••••" required class="w-full text-center text-lg tracking-[0.5em]" />
						<Button disabled={busy} class="w-full">{busy ? 'Verifying…' : 'Verify'}</Button>
						<button type="button" onclick={() => (step = 'phone')} class="w-full text-center text-xs text-gray-500 hover:text-gray-700">
							Use a different number
						</button>
					</form>
				{/if}
			{:else}
				<form class="space-y-3" onsubmit={submitEmail}>
					{#if emailMode === 'register'}
						<Input bind:value={name} type="text" placeholder="Your name" autocomplete="name" class="w-full" />
					{/if}
					<Input bind:value={email} type="email" placeholder="you@store.com" autocomplete="email" required class="w-full" />
					<Input
						bind:value={password}
						type="password"
						placeholder="Password"
						autocomplete={emailMode === 'register' ? 'new-password' : 'current-password'}
						minlength={emailMode === 'register' ? 8 : undefined}
						required
						class="w-full"
					/>
					<Button disabled={busy} class="w-full">
						{busy ? 'Please wait…' : emailMode === 'register' ? 'Create account' : 'Sign in'}
					</Button>
					<button
						type="button"
						onclick={() => ((emailMode = emailMode === 'register' ? 'login' : 'register'), (error = null))}
						class="w-full text-center text-xs text-gray-500 hover:text-gray-700"
					>
						{emailMode === 'register' ? 'Already have an account? Sign in' : 'New here? Create an account'}
					</button>
				</form>
			{/if}

			{#if error}
				<p class="mt-4 text-sm text-red-600">{error}</p>
			{/if}
		</div>
	</div>
</div>
