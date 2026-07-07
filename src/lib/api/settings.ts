import { api, unwrap } from './client';
import type { components } from './schema';

export type WebhookConfig = components['schemas']['WebhookConfig'];

export const createApiKey = () => unwrap(api.POST('/v1/settings/api-keys'));

export const getWebhook = () => unwrap(api.GET('/v1/settings/webhook'));

export const setWebhook = (url: string, events: string[] = []) =>
	unwrap(api.POST('/v1/settings/webhook', { body: { url, events } }));
