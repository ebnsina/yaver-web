import { api, unwrap } from './client';
import type { components } from './schema';

export type Call = components['schemas']['Call'];

export const listCalls = async (): Promise<Call[]> => (await unwrap(api.GET('/v1/calls'))).calls;
