// Typed API client generated from the Go OpenAPI spec.
//
// `schema.d.ts` is produced by `pnpm gen:api` (openapi-typescript against the
// running API's /openapi.yaml). openapi-fetch gives fully-typed requests and
// responses derived from that schema. Same-origin via the Vite dev proxy, with
// the session cookie included.

import createClient from 'openapi-fetch';
import type { paths } from './schema';

export type ApiError = { status: number; error: string };

/** Only a real 401 means "log in again"; network blips / 5xx must NOT sign you out. */
export const isUnauthorized = (e: unknown): boolean => (e as ApiError | undefined)?.status === 401;

export const api = createClient<paths>({ credentials: 'include' });

/** unwrap turns an openapi-fetch result into data-or-throw(ApiError). */
export async function unwrap<T>(
	p: Promise<{ data?: T; error?: unknown; response: Response }>
): Promise<T> {
	const { data, error, response } = await p;
	if (error || !response.ok) {
		const e = error as { error?: string } | undefined;
		throw { status: response.status, error: e?.error ?? 'request failed' } satisfies ApiError;
	}
	return data as T;
}
