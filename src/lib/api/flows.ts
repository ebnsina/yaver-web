import { api, unwrap } from './client';
import type { components } from './schema';

export type FlowSummary = components['schemas']['FlowSummary'];

// The IVR spec shape (JSONB on the server; typed here for the editor).
export type IVRNode = {
	say?: { tts?: string; audio?: string };
	gather?: { digits: number; timeout_s: number };
	on?: Record<string, string>;
	result?: string;
	end?: boolean;
};
export type IVRSpec = { entry: string; nodes: Record<string, IVRNode> };

export type FlowDetail = {
	id: string;
	name: string;
	version: number;
	channel: string;
	type: string;
	locale: string;
	spec: IVRSpec;
};

export const listFlows = async (): Promise<FlowSummary[]> => (await unwrap(api.GET('/v1/flows'))).flows;

export const getFlow = (id: string) =>
	unwrap(api.GET('/v1/flows/{id}', { params: { path: { id } } })) as Promise<FlowDetail>;

export const updateFlow = (id: string, spec: IVRSpec) =>
	// spec is our typed object; the API validates it.
	unwrap(api.PUT('/v1/flows/{id}', { params: { path: { id } }, body: { spec: spec as never } }));
