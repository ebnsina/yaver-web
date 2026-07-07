import { api, unwrap } from './client';
import type { components } from './schema';

export type Channel = components['schemas']['Channel'];

export const listChannels = async (): Promise<Channel[]> =>
	(await unwrap(api.GET('/v1/channels'))).channels;

export const connectChannel = (
	type: 'whatsapp' | 'messenger',
	external_id: string,
	access_token: string,
	verify_token: string
) => unwrap(api.POST('/v1/channels', { body: { type, external_id, access_token, verify_token } }));

export const disconnectChannel = (type: string) =>
	unwrap(api.DELETE('/v1/channels/{type}', { params: { path: { type } } }));
