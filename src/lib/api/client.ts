// Minimal typed API client. Talks to the Go API through the Vite proxy (dev) or
// the reverse proxy (prod), same-origin, with the session cookie included.
//
// This is hand-written for the auth slice; it will be replaced by a client
// generated from the Go OpenAPI spec once the API emits one.

export type ApiError = { status: number; error: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(path, {
		...init,
		credentials: 'include',
		headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }
	});
	const body = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw { status: res.status, error: body.error ?? 'request failed' } satisfies ApiError;
	}
	return body as T;
}

export const get = <T>(path: string) => request<T>(path, { method: 'GET' });

export const post = <T>(path: string, data?: unknown) =>
	request<T>(path, { method: 'POST', body: data === undefined ? undefined : JSON.stringify(data) });
