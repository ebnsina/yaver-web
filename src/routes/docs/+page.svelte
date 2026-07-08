<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Rocket,
		Plug,
		Code2,
		MessageSquareCode,
		LifeBuoy,
		Phone,
		MessageCircle,
		Megaphone,
		ArrowUpRight
	} from '@lucide/svelte';

	const sections = [
		{
			icon: Rocket,
			color: 'text-brand-600',
			bg: 'bg-brand-50',
			title: 'Getting started',
			body: 'Name your store in Settings, send yourself a test call from the Dashboard, then mint an API key and point a webhook at your backend. The Get started checklist on the Dashboard tracks all four.'
		},
		{
			icon: Plug,
			color: 'text-blue-600',
			bg: 'bg-blue-50',
			title: 'Connect your store',
			body: 'POST commerce events to /v1/events with your secret X-API-Key header. Yaver normalizes the phone number, matches it to an active flow, and triggers the right engagement — order confirmation, cart recovery, or delivery reminder.'
		},
		{
			icon: MessageSquareCode,
			color: 'text-emerald-600',
			bg: 'bg-emerald-50',
			title: 'Embed the chat widget',
			body: 'Drop the widget snippet on your site using a publishable key. The widget talks to /public/chat and authenticates cross-origin — no secret key ever touches the browser.'
		},
		{
			icon: Code2,
			color: 'text-cyan-600',
			bg: 'bg-cyan-50',
			title: 'API reference',
			body: 'Every endpoint is described in the served OpenAPI spec at /openapi.yaml. Generate a typed client from it (the web app uses openapi-typescript) so requests and responses stay in sync with the API.'
		}
	];

	const channels = [
		{ icon: Phone, color: 'text-blue-600', label: 'Voice IVR', desc: 'Press-key confirmation flows placed as outbound calls.' },
		{ icon: MessageCircle, color: 'text-emerald-600', label: 'AI chat', desc: 'Website widget + WhatsApp / Messenger on one runtime.' },
		{ icon: Megaphone, color: 'text-orange-600', label: 'Campaigns', desc: 'Bulk outbound with CSV import and scheduling.' }
	];

	const curl = `curl -X POST https://api.yaver.app/v1/events \\
  -H "X-API-Key: sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "order.placed",
    "phone": "01712345678",
    "order": { "id": "A-1029", "amount": 1250 }
  }'`;
</script>

<svelte:head><title>Docs & Help · Yaver</title></svelte:head>

<div class="min-h-screen bg-gray-50">
	<Header />

	<main class="mx-auto max-w-4xl px-6 py-10">
		<div class="flex items-center gap-2">
			<span class="rounded-lg bg-brand-50 p-2"><Rocket size={18} class="text-brand-600" /></span>
			<h1 class="text-2xl font-semibold tracking-tight text-gray-900">Docs & Help</h1>
		</div>
		<p class="mt-2 max-w-2xl text-sm text-gray-500">
			Everything you need to reach customers over voice, chat, and messaging — from your first test
			call to a full store integration.
		</p>

		<!-- channels strip -->
		<div class="mt-6 grid gap-4 sm:grid-cols-3">
			{#each channels as c (c.label)}
				{@const Icon = c.icon}
				<div class="card p-4">
					<Icon size={20} class={c.color} />
					<p class="mt-2 text-sm font-semibold text-gray-900">{c.label}</p>
					<p class="mt-1 text-xs leading-relaxed text-gray-500">{c.desc}</p>
				</div>
			{/each}
		</div>

		<!-- guide sections -->
		<div class="mt-8 space-y-4">
			{#each sections as s (s.title)}
				{@const Icon = s.icon}
				<section class="card flex gap-4 p-5">
					<span class="h-fit rounded-lg {s.bg} p-2.5"><Icon size={18} class={s.color} /></span>
					<div>
						<h2 class="text-sm font-semibold text-gray-900">{s.title}</h2>
						<p class="mt-1 text-sm leading-relaxed text-gray-600">{s.body}</p>
					</div>
				</section>
			{/each}
		</div>

		<!-- example -->
		<section class="mt-8">
			<h2 class="text-sm font-semibold text-gray-900">Send your first event</h2>
			<p class="mt-1 text-sm text-gray-500">A store event triggers the matching flow automatically.</p>
			<pre class="mt-3 overflow-x-auto rounded-xl border border-gray-200 bg-gray-900 p-4 font-mono text-xs leading-relaxed text-gray-100"><code>{curl}</code></pre>
			<a href="/openapi.yaml" class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
				Full API reference <ArrowUpRight size={14} />
			</a>
		</section>

		<!-- support -->
		<section id="support" class="card mt-8 flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-start gap-3">
				<span class="rounded-lg bg-emerald-50 p-2.5"><LifeBuoy size={18} class="text-emerald-600" /></span>
				<div>
					<h2 class="text-sm font-semibold text-gray-900">Need a hand?</h2>
					<p class="mt-1 text-sm text-gray-500">Our team usually replies within a few hours.</p>
				</div>
			</div>
			<Button href="mailto:support@yaver.app" class="shrink-0">Email support</Button>
		</section>
	</main>
</div>
