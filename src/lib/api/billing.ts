import { api, unwrap } from './client';
import type { components } from './schema';

export type Billing = components['schemas']['Billing'];

export const getBilling = () => unwrap(api.GET('/v1/billing'));

export const topUp = (amount: number) => unwrap(api.POST('/v1/billing/topup', { body: { amount } }));

// checkout starts a real payment and returns the gateway redirect URL.
export const checkout = (credits: number) =>
	unwrap(api.POST('/v1/billing/checkout', { body: { credits } }));
