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

// A cloneable starter flow from the API's built-in template set.
export type FlowTemplate = {
	name: string;
	title: string;
	description: string;
	channel: string;
	type: string;
	locale: string;
	spec: IVRSpec;
};

// One turn produced by the simulator.
export type SimStep = {
	node: string;
	kind: 'say' | 'say_gather' | 'hangup';
	awaits_input: boolean;
	say?: { tts?: string; audio?: string };
};
export type Simulation = {
	steps: SimStep[];
	ended: boolean;
	result: string;
	status: string;
};

export const listFlows = async (): Promise<FlowSummary[]> => (await unwrap(api.GET('/v1/flows'))).flows;

export const getFlow = (id: string) =>
	unwrap(api.GET('/v1/flows/{id}', { params: { path: { id } } })) as Promise<FlowDetail>;

export const updateFlow = (id: string, spec: IVRSpec) =>
	// spec is our typed object; the API validates it.
	unwrap(api.PUT('/v1/flows/{id}', { params: { path: { id } }, body: { spec: spec as never } }));

export const listFlowTemplates = async (): Promise<FlowTemplate[]> =>
	(await unwrap(api.GET('/v1/flows/templates'))).templates as FlowTemplate[];

export const createFlow = (input: { name: string; type: string; channel?: string; locale?: string; spec: IVRSpec }) =>
	unwrap(api.POST('/v1/flows', { body: input as never })) as Promise<{ id: string }>;

// Dry-run a spec against a keypad-input sequence (each "1".."9" or "timeout").
export const simulateFlow = (spec: IVRSpec, inputs: string[]) =>
	unwrap(api.POST('/v1/flows/simulate', { body: { spec: spec as never, inputs } })) as Promise<Simulation>;
