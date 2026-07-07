import { api, unwrap } from './client';
import type { components } from './schema';

export type Campaign = components['schemas']['Campaign'];

export const listCampaigns = async (): Promise<Campaign[]> =>
	(await unwrap(api.GET('/v1/campaigns'))).campaigns;

export const createCampaign = (name: string) =>
	unwrap(api.POST('/v1/campaigns', { body: { name } }));

export const startCampaign = (id: string) =>
	unwrap(api.POST('/v1/campaigns/{id}/start', { params: { path: { id } } }));
