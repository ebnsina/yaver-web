import { api, unwrap } from './client';
import type { components } from './schema';

export type WebhookConfig = components['schemas']['WebhookConfig'];

export const renameOrg = (name: string) =>
	unwrap(api.PUT('/v1/settings/org', { body: { name } }));

export const createApiKey = () => unwrap(api.POST('/v1/settings/api-keys'));

export const createPublishableKey = () => unwrap(api.POST('/v1/settings/publishable-key'));

export const listApiKeys = async () => (await unwrap(api.GET('/v1/settings/api-keys'))).keys;

export const getWebhook = () => unwrap(api.GET('/v1/settings/webhook'));

export const setWebhook = (url: string, events: string[] = []) =>
	unwrap(api.POST('/v1/settings/webhook', { body: { url, events } }));
