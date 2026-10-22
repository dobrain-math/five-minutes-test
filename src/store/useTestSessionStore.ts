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
	/** 푸는 유형 번호(0부터). null = 전체 풀기(유형마다 한 페이지) */
	part: number | null;
	/** 문제. 전체 풀기는 유형 목차 순서대로 PER_SECTION 개씩 묶여 있다 */
	questions: Question[];
	answers: Record<string, string>;
	startedAt: number | null;
	finishedAt: number | null;
	/** 지금 푸는 페이지(전체 풀기의 유형 순서, 0부터) */
	page: number;
	pageStartedAt: number | null;
	/** 끝낸 페이지마다 걸린 시간 ms */
	pageTimes: number[];
	setStudentName: (name: string) => void;
	setStudentAge: (age: string) => void;
	start: (courseId: string, part: number | null) => void;
	setAnswer: (questionId: string, value: string) => void;
	/** 이 페이지 시간을 적고 다음 유형으로. 되돌아가기는 없다 */
	nextPage: () => void;
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
			page: 0,
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
					page: 0,
					pageStartedAt: now,
					pageTimes: [],
				});
			},
			setAnswer: (questionId, value) =>
				set((s) => ({ answers: { ...s.answers, [questionId]: value } })),
			nextPage: () =>
				set((s) => {
					const now = Date.now();
					return {
						page: s.page + 1,
						pageStartedAt: now,
						pageTimes: [...s.pageTimes, now - (s.pageStartedAt ?? now)],
					};
				}),
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
			// NOTE: 2026-10-22 유형별 풀이로 모양이 바뀌어 이름을 바꿨다(옛 세션은 버린다).
			name: 'test-session-v2',
			storage: createJSONStorage(() => sessionStorage),
		},
	),
);
