import { api, unwrap } from './client';
import type { components } from './schema';

export type { ApiError } from './client';
export type Me = components['schemas']['Me'];

export const requestOtp = (phone: string) => unwrap(api.POST('/v1/auth/otp/request', { body: { phone } }));

export const verifyOtp = (phone: string, code: string) =>
	unwrap(api.POST('/v1/auth/otp/verify', { body: { phone, code } }));

export const me = () => unwrap(api.GET('/v1/me'));

export const logout = () => unwrap(api.POST('/v1/auth/logout'));
