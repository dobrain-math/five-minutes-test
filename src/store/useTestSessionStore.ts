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
	/** 챌린지 코드(4자리, 비면 챌린지 아님). 매일 다시 치지 않게 기기(localStorage)에도 남긴다 */
	challengeCode: string;
	/** 챌린지 기록을 보낸 세션의 finishedAt — 리포트를 다시 열어도 두 번 보내지 않게 */
	challengeSentFor: number | null;
	setStudentName: (name: string) => void;
	setChallengeCode: (code: string) => void;
	markChallengeSent: (finishedAt: number) => void;
	setStudentAge: (age: string) => void;
	start: (courseId: string, part: number | null) => void;
	setAnswer: (questionId: string, value: string) => void;
	finish: () => void;
};

const CODE_KEY = 'challenge-code';
const savedCode = () => {
	try {
		return localStorage.getItem(CODE_KEY) ?? '';
	} catch {
		return '';
	}
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
			challengeCode: savedCode(),
			challengeSentFor: null,
			setStudentName: (studentName) => set({ studentName }),
			setChallengeCode: (challengeCode) => {
				try {
					localStorage.setItem(CODE_KEY, challengeCode);
				} catch {
					// 저장이 막힌 브라우저(사생활 보호 모드 등)는 이번 세션에만 둔다
				}
				set({ challengeCode });
			},
			markChallengeSent: (challengeSentFor) => set({ challengeSentFor }),
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
