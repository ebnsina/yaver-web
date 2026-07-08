import { api, unwrap } from './client';
import type { components } from './schema';

export type { ApiError } from './client';
export type Me = components['schemas']['Me'];

export const requestOtp = (phone: string) => unwrap(api.POST('/v1/auth/otp/request', { body: { phone } }));

export const verifyOtp = (phone: string, code: string) =>
	unwrap(api.POST('/v1/auth/otp/verify', { body: { phone, code } }));

export const me = () => unwrap(api.GET('/v1/me'));

export const logout = () => unwrap(api.POST('/v1/auth/logout'));

// Email/password — plain fetch because these endpoints postdate the generated
// schema; regenerate with `pnpm gen:api` to fold them into the typed client.
async function post(path: string, body: unknown) {
	const res = await fetch(path, {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) {
		const e = await res.json().catch(() => ({}));
		throw { status: res.status, error: e?.error ?? 'request failed' };
	}
	return res.json();
}

export const register = (email: string, password: string, name?: string) =>
	post('/v1/auth/register', { email, password, name });

export const login = (email: string, password: string) => post('/v1/auth/login', { email, password });
