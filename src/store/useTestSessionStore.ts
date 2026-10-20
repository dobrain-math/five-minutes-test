import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Question } from '@/@types/test';
import { getCourse } from '@/data/courses.ts';
import { buildTest } from '@/utils/buildTest.ts';

type TestSessionState = {
	studentName: string;
	/** 나이·학년 표시. 예: "7세", "초3" (data/ages.ts) */
	studentAge: string;
	courseId: string | null;
	questions: Question[];
	answers: Record<string, string>;
	startedAt: number | null;
	finishedAt: number | null;
	setStudentName: (name: string) => void;
	setStudentAge: (age: string) => void;
	start: (courseId: string) => void;
	setAnswer: (questionId: string, value: string) => void;
	finish: () => void;
};

// NOTE: 새로고침해도 풀던 문제·답·시간이 남도록 sessionStorage 에 둔다.
export const useTestSessionStore = create<TestSessionState>()(
	persist(
		(set) => ({
			studentName: '',
			studentAge: '',
			courseId: null,
			questions: [],
			answers: {},
			startedAt: null,
			finishedAt: null,
			setStudentName: (studentName) => set({ studentName }),
			setStudentAge: (studentAge) => set({ studentAge }),
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
