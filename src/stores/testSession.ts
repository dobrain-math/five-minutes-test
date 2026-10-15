import { create } from 'zustand';

interface TestSessionState {
	startedAt: number | null;
	answers: Record<string, string>;
	start: () => void;
	setAnswer: (questionId: string, value: string) => void;
}

export const useTestSession = create<TestSessionState>((set) => ({
	startedAt: null,
	answers: {},
	start: () => set({ startedAt: Date.now(), answers: {} }),
	setAnswer: (questionId, value) =>
		set((s) => ({ answers: { ...s.answers, [questionId]: value } })),
}));
