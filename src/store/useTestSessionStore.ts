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
	/** 푸는 유형 번호(0부터). null = 전체 풀기(유형마다 FULL_PER_SECTION 문제, 한 페이지) */
	part: number | null;
	/** 문제. 전체 풀기는 유형 목차 순서대로 FULL_PER_SECTION 개씩 묶여 있다 */
	questions: Question[];
	answers: Record<string, string>;
	startedAt: number | null;
	finishedAt: number | null;
	pageStartedAt: number | null;
	/** 걸린 시간 ms(한 페이지라 채점할 때 하나 적힌다) */
	pageTimes: number[];
	setStudentName: (name: string) => void;
	setStudentAge: (age: string) => void;
	start: (courseId: string, part: number | null) => void;
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
			part: null,
			questions: [],
			answers: {},
			startedAt: null,
			finishedAt: null,
			pageStartedAt: null,
			pageTimes: [],
			setStudentName: (studentName) => set({ studentName }),
			setStudentAge: (studentAge) => set({ studentAge }),
			start: (courseId, part) => {
				const course = getCourse(courseId);
				if (!course || (part !== null && !course.sections[part])) return;
				const now = Date.now();
				set({
					courseId,
					part,
					questions: buildTest(course, part),
					answers: {},
					startedAt: now,
					finishedAt: null,
					pageStartedAt: now,
					pageTimes: [],
				});
			},
			setAnswer: (questionId, value) =>
				set((s) => ({ answers: { ...s.answers, [questionId]: value } })),
			finish: () =>
				set((s) => {
					const now = Date.now();
					return {
						finishedAt: now,
						pageTimes: [...s.pageTimes, now - (s.pageStartedAt ?? now)],
					};
				}),
		}),
		{
			// NOTE: 2026-10-22 유형별 풀이, 2026-10-29 전체 풀기 한 페이지로 모양이 바뀌어 이름을 바꿨다(옛 세션은 버린다).
			name: 'test-session-v3',
			storage: createJSONStorage(() => sessionStorage),
		},
	),
);
