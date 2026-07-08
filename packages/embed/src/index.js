// @yaver/js — the Yaver embed SDK. Dependency-free; talks to the public,
// publishable-key endpoints so it's safe to ship in client-side code.

/**
 * Create a Yaver client bound to a publishable key.
 * @param {{ publishableKey: string, apiBase?: string }} opts
 */
export function createYaver({ publishableKey, apiBase = 'https://api.yaver.app' } = {}) {
	if (!publishableKey) throw new Error('createYaver: publishableKey is required');
	const base = apiBase.replace(/\/$/, '');
	const headers = { 'Content-Type': 'application/json', 'X-Yaver-Key': publishableKey };

	async function config() {
		const r = await fetch(`${base}/public/chat/config`, { headers });
		if (!r.ok) throw new Error(`yaver: config failed (${r.status})`);
		return r.json();
	}

	async function send(text, conversationId) {
		const r = await fetch(`${base}/public/chat/messages`, {
			method: 'POST',
			headers,
			body: JSON.stringify({ text, conversation_id: conversationId })
		});
		if (!r.ok) throw new Error(`yaver: send failed (${r.status})`);
		return r.json();
	}

	/** A stateful conversation that remembers its conversation_id across turns. */
	function conversation() {
		let id;
		return {
			get id() {
				return id;
			},
			async send(text) {
				const res = await send(text, id);
				id = res.conversation_id;
				return res;
			}
		};
	}

	return { config, send, conversation };
}
