// Live activity feed over Server-Sent Events. openapi-fetch doesn't model
// streaming, so this is a thin EventSource wrapper. Same-origin via the Vite dev
// proxy (`/v1` → API), so the session cookie rides along automatically.

export type ActivityEvent = {
	type: string; // e.g. "call.completed", "chat.message"
	title: string;
	detail?: string;
	at: string; // RFC3339
};

/**
 * Open the activity stream. `onEvent` fires per event; the returned function
 * closes the connection. EventSource reconnects on its own, so transient drops
 * are handled for us.
 */
export function subscribeActivity(
	onEvent: (e: ActivityEvent) => void,
	onError?: (e: Event) => void
): () => void {
	const es = new EventSource('/v1/activity/stream', { withCredentials: true });

	es.onmessage = (msg) => {
		try {
			onEvent(JSON.parse(msg.data) as ActivityEvent);
		} catch {
			// ignore malformed frames
		}
	};
	if (onError) es.onerror = onError;

	return () => es.close();
}
