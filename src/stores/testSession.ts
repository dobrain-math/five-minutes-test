import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Question } from '@/@types/test';
import { getCourse } from '@/data/courses.ts';
import { buildTest } from '@/utils/buildTest.ts';

interface TestSessionState {
	studentName: string;
	courseId: string | null;
	questions: Question[];
	answers: Record<string, string>;
	startedAt: number | null;
	finishedAt: number | null;
	setStudentName: (name: string) => void;
	start: (courseId: string) => void;
	setAnswer: (questionId: string, value: string) => void;
	finish: () => void;
}

// 새로고침해도 풀던 문제·답·시간이 남도록 sessionStorage 에 둔다.
export const useTestSession = create<TestSessionState>()(
	persist(
		(set) => ({
			studentName: '',
			courseId: null,
			questions: [],
			answers: {},
			startedAt: null,
			finishedAt: null,
			setStudentName: (studentName) => set({ studentName }),
			start: (courseId) => {
				const course = getCourse(courseId);
				if (!course) return;
				set({
					courseId,
					questions: buildTest(course),
					answers: {},
					startedAt: Date.now(),
					finishedAt: null,
				});
			},
			setAnswer: (questionId, value) =>
				set((s) => ({ answers: { ...s.answers, [questionId]: value } })),
			finish: () => set({ finishedAt: Date.now() }),
		}),
		{
			name: 'test-session',
			storage: createJSONStorage(() => sessionStorage),
		},
	),
);
