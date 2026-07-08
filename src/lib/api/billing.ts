import { api, unwrap } from './client';
import type { components } from './schema';

export type Billing = components['schemas']['Billing'];

export const getBilling = () => unwrap(api.GET('/v1/billing'));

export const topUp = (amount: number) => unwrap(api.POST('/v1/billing/topup', { body: { amount } }));

// checkout starts a real payment and returns the gateway redirect URL. Sent via
// a plain fetch because this endpoint postdates the generated schema; regenerate
// with `pnpm gen:api` to fold it into the typed client.
export async function checkout(credits: number): Promise<{ redirect_url: string }> {
	const res = await fetch('/v1/billing/checkout', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ credits })
	});
	if (!res.ok) throw { status: res.status, error: 'checkout failed' };
	return res.json();
}
