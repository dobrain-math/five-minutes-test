import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Question } from '@/@types/test';
import { getCourse } from '@/data/courses.ts';
import { buildTest } from '@/utils/buildTest.ts';
import {
	type ChallengeLogin,
	type ChallengeWho,
	isDoneToday,
} from '@/utils/challenge.ts';

type TestSessionState = {
	/** 학생명·나이는 로그인한 명단 값(2026-11-17 홈 입력 칸 삭제) */
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
	/** 챌린지 로그인(이름 + 코드). null = 로그인 전 — 홈은 로그인 화면만 보여 준다(2026-11-17) */
	login: ChallengeLogin | null;
	/** 챌린지 기록을 보낸 세션의 finishedAt — 리포트를 다시 열어도 두 번 보내지 않게 */
	challengeSentFor: number | null;
	/** 로그인하면 학생명·나이도 명단 값으로 채운다. null = 로그아웃 */
	setLogin: (login: ChallengeLogin | null) => void;
	markChallengeSent: (finishedAt: number) => void;
	start: (courseId: string, part: number | null) => void;
	setAnswer: (questionId: string, value: string) => void;
	finish: () => void;
};

/**
 * 자동 로그인: 이 기기(localStorage)에 지난 로그인 결과(이름·코드·나이·기록)를 남겨 둔다.
 * 다음에 열면 시트에 묻지 않고 바로 홈을 보여 주고(시트 응답이 2초 넘게 걸려서, 2026-11-17), 확인은 홈이 뒤에서 한다.
 */
const AUTO_KEY = 'challenge-login';
type Saved = ChallengeWho & Partial<ChallengeLogin>;
export const autoLogin = {
	get(): Saved | null {
		try {
			const saved = JSON.parse(localStorage.getItem(AUTO_KEY) ?? 'null');
			return saved?.name && saved?.code ? saved : null;
		} catch {
			return null;
		}
	},
	set(who: Saved | null) {
		try {
			if (who) localStorage.setItem(AUTO_KEY, JSON.stringify(who));
			else localStorage.removeItem(AUTO_KEY);
		} catch {
			// 저장이 막힌 브라우저(사생활 보호 모드 등)는 이번에만 로그인한다
		}
	},
};

/** 저장해 둔 로그인(기록까지 있는 것)으로 바로 들어갈 값. 오늘 완료 여부는 지금 날짜로 다시 센다 */
const snapshot = (): ChallengeLogin | null => {
	const saved = autoLogin.get();
	if (!saved?.history) return null;
	return {
		name: saved.name,
		code: saved.code,
		age: saved.age ?? '',
		history: saved.history,
		doneToday: isDoneToday(saved.history),
	};
};
const startLogin = snapshot();
/** 저장해 둔 값으로 들어왔으면 true — 홈이 한 번 시트에 다시 물어 최신으로 바꾼다 */
export const loginFromSnapshot = { pending: startLogin !== null };

// NOTE: 새로고침해도 풀던 문제·답·시간이 남도록 sessionStorage 에 둔다.
export const useTestSessionStore = create<TestSessionState>()(
	persist(
		(set) => ({
			studentName: startLogin?.name ?? '',
			studentAge: startLogin?.age ?? '',
			courseId: null,
			part: null,
			questions: [],
			answers: {},
			startedAt: null,
			finishedAt: null,
			pageStartedAt: null,
			pageTimes: [],
			login: startLogin,
			challengeSentFor: null,
			setLogin: (login) => {
				// 자동 로그인을 켜 둔 기기면 저장해 둔 값도 최신으로(다음에 열 때 바로 보이게)
				if (login && autoLogin.get()) autoLogin.set(login);
				set(
					login
						? { login, studentName: login.name, studentAge: login.age }
						: { login: null, studentName: '', studentAge: '' },
				);
			},
			markChallengeSent: (challengeSentFor) => set({ challengeSentFor }),
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
			// NOTE: 2026-10-22 유형별 풀이, 2026-10-29 전체 풀기 한 페이지, 2026-11-17 챌린지 로그인으로 모양이 바뀌어 이름을 바꿨다(옛 세션은 버린다).
			name: 'test-session-v4',
			storage: createJSONStorage(() => sessionStorage),
		},
	),
);
