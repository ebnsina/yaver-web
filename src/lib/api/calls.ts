import { api, unwrap } from './client';
import type { components } from './schema';

export type Call = components['schemas']['Call'];
export type Summary = components['schemas']['Summary'];

export const listCalls = async (): Promise<Call[]> => (await unwrap(api.GET('/v1/calls'))).calls;

export const getSummary = () => unwrap(api.GET('/v1/analytics/summary'));

export const sendTestCall = (phone: string, digit: string) =>
	unwrap(api.POST('/v1/dev/test-call', { body: { phone, digit } }));
