import { api, unwrap } from './client';
import type { components } from './schema';

export type Customer = components['schemas']['Customer'];

export const listCustomers = async (): Promise<Customer[]> =>
	(await unwrap(api.GET('/v1/customers'))).customers;

export const setDND = (id: string, dnd: boolean) =>
	dnd
		? unwrap(api.POST('/v1/customers/{id}/dnd', { params: { path: { id } } }))
		: unwrap(api.DELETE('/v1/customers/{id}/dnd', { params: { path: { id } } }));
