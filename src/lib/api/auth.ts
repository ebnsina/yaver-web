import { get, post } from './client';

export type { ApiError } from './client';

export type Me = { user_id: string; phone: string; email: string; name: string };

export const requestOtp = (phone: string) =>
	post<{ status: string; dev_code?: string }>('/v1/auth/otp/request', { phone });

export const verifyOtp = (phone: string, code: string) =>
	post<{ user_id: string; phone: string }>('/v1/auth/otp/verify', { phone, code });

export const me = () => get<Me>('/v1/me');

export const logout = () => post<{ status: string }>('/v1/auth/logout');
