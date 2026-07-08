// Onboarding assistant. Plain fetch because the endpoint postdates the generated
// schema; regenerate with `pnpm gen:api` to fold it into the typed client.

export interface OnboardingProgress {
	store_named: boolean;
	has_api_key: boolean;
	webhook_set: boolean;
	has_flow: boolean;
}

export async function askOnboarding(
	question: string,
	progress: OnboardingProgress
): Promise<{ answer: string }> {
	const res = await fetch('/v1/onboarding/ask', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ question, progress })
	});
	if (!res.ok) throw { status: res.status, error: 'assistant unavailable' };
	return res.json();
}
