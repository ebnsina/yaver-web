// Shared canvas actions, passed to custom node/edge components via Svelte context
// so they can read the live spec and mutate it without prop-drilling.
export type IvrFlowCtx = {
	isEntry: (name: string) => boolean;
	kind: (name: string) => { label: string; cls: string };
	saySnippet: (name: string) => string;
	editNode: (name: string) => void;
	// keys already used on a source node (to disable them in the edge key picker)
	usedKeys: (source: string) => string[];
	changeKey: (source: string, oldKey: string, newKey: string) => void;
};

// The keys an IVR branch can fire on.
export const BRANCH_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'timeout', 'invalid'];
