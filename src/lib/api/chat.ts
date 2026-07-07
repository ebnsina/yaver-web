import { api, unwrap } from './client';
import type { components } from './schema';

export type Conversation = components['schemas']['Conversation'];
export type ChatMessage = components['schemas']['ChatMessage'];

export const listConversations = async (): Promise<Conversation[]> =>
	(await unwrap(api.GET('/v1/chat/conversations'))).conversations;

export const getMessages = async (id: string): Promise<ChatMessage[]> =>
	(await unwrap(api.GET('/v1/chat/conversations/{id}', { params: { path: { id } } }))).messages;

export type ChatSettings = components['schemas']['ChatSettings'];

export const getChatSettings = () => unwrap(api.GET('/v1/chat/settings'));

export const saveChatSettings = (s: ChatSettings) =>
	unwrap(api.PUT('/v1/chat/settings', { body: s }));

export const sendMessage = (text: string, conversationId?: string) =>
	unwrap(
		api.POST('/v1/chat/messages', {
			body: conversationId ? { conversation_id: conversationId, text } : { text }
		})
	);
