import { api, unwrap } from './client';

export interface OnboardingProgress {
	store_named: boolean;
	has_api_key: boolean;
	webhook_set: boolean;
	has_flow: boolean;
}

export const askOnboarding = (question: string, progress: OnboardingProgress) =>
	unwrap(api.POST('/v1/onboarding/ask', { body: { question, progress } }));
