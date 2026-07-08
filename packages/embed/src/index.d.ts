export interface YaverConfig {
	/** Widget title. */
	title: string;
	/** Opening assistant message. */
	welcome: string;
	/** Brand accent color (hex). */
	accent: string;
}

export interface YaverReply {
	/** Server-assigned conversation id — pass it back to continue the thread. */
	conversation_id: string;
	/** The assistant's reply text. */
	reply: string;
}

export interface YaverConversation {
	/** Current conversation id, once the first message has been sent. */
	readonly id: string | undefined;
	/** Send a message and get the assistant reply, tracking the conversation id. */
	send(text: string): Promise<YaverReply>;
}

export interface Yaver {
	/** Fetch the widget's public appearance (title, welcome, accent). */
	config(): Promise<YaverConfig>;
	/** Send a message; pass a conversationId to continue an existing thread. */
	send(text: string, conversationId?: string): Promise<YaverReply>;
	/** Start a stateful conversation that remembers its id across turns. */
	conversation(): YaverConversation;
}

export function createYaver(opts: { publishableKey: string; apiBase?: string }): Yaver;
