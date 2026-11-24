import type { Report } from '@/@types/test';

/**
 * 챌린지 기록 시트(원장님 구글 시트의 Apps Script 웹 앱) 주소.
 * 시트 스크립트는 challenge/Code.gs (2026-11-17 로그인판: 이름 + 학원이 발급한 4자리 코드).
 */
// NOTE: 로컬 시험용으로 .env 의 VITE_CHALLENGE_URL 이 있으면 그쪽을 쓴다.
// 비밀값이 아니다(누구나 부를 수 있는 웹 앱 주소). 시트에서 «새 배포»를 하면 주소가 바뀌니 여기도 바꿀 것.
export const CHALLENGE_URL: string =
	import.meta.env.VITE_CHALLENGE_URL ??
	'https://script.google.com/macros/s/AKfycbwWD8s_xmb0QpFVUWLIaYi5NJMv8wj6E4GD0Zpv8eFJIqAwD6Z3oco214VHTffSC0U1/exec';

/**
 * 챌린지 코드: 네 자리 숫자 0000~9999. 시트가 새로 주는 코드는 1000~9999(newCode_)지만
 * 선생님이 시트에서 0000 처럼 직접 바꿔 쓸 수 있다(2026-11-17)
 */
export const isChallengeCode = (code: string) => /^\d{4}$/.test(code);

/** 로그인한 학생 — 이름 + 코드가 명단과 둘 다 맞아야 한다 */
export type ChallengeWho = { name: string; code: string };

/** 시트 «기록» 한 줄(그 학생 것만, 오래된 것부터) */
export type ChallengeDay = {
	date: string;
	course: string;
	scope: string;
	correct: number;
	total: number;
	seconds: number;
};

export type ChallengeLogin = {
	name: string;
	age: string;
	code: string;
	/** 오늘 이미 풀었으면 true — 다시 풀 때 홈에서 한 번 묻는다(하루 한 번 제한은 2026-11-24 없앰) */
	doneToday: boolean;
	history: ChallengeDay[];
};

export type LoginFailure = 'wrong' | 'network';

/** 시트 «기록» 한 줄로 보낼 값 */
export function challengeRecord(report: Report, who: ChallengeWho) {
	return {
		name: who.name,
		code: who.code,
		course: report.courseTitle,
		scope:
			report.part === undefined
				? '전체 범위 테스트'
				: `${report.part + 1}번 ${report.sections[0]?.title ?? ''}`,
		correct: report.correct,
		total: report.total,
		seconds: Math.floor(report.durationMs / 1000),
		finishedAt: report.finishedAt,
	};
}

export const loginUrl = (base: string, name: string, code: string) =>
	`${base}?name=${encodeURIComponent(name.trim())}&code=${code}`;

/** 챌린지 참여 일수 = 기록이 있는 서로 다른 날짜 수 */
export const challengeDays = (history: ChallengeDay[]) =>
	new Set(history.map((h) => h.date)).size;

export function loginError(error: LoginFailure) {
	if (error === 'network')
		return '기록 시트에 연결하지 못했습니다. 잠시 뒤 다시 시도해 주세요.';
	return '이름 또는 챌린지 코드가 맞지 않습니다.';
}

type SheetAnswer =
	| ({ ok: true } & Partial<Omit<ChallengeLogin, 'code'>> & { name: string })
	| { ok: false; error?: string };

/** 한국 날짜 'YYYY-MM-DD' — 시트(Asia/Seoul)와 같은 기준 */
const kstDate = (ms: number) =>
	new Date(ms).toLocaleDateString('sv', { timeZone: 'Asia/Seoul' });

/** 오늘(한국 날짜) 기록이 있으면 true — 저장해 둔 로그인으로 바로 들어갈 때 다시 계산한다 */
export const isDoneToday = (history: ChallengeDay[], now = Date.now()) =>
	history.some((h) => h.date === kstDate(now));

// NOTE: 옛 시트 스크립트(배포 전)는 이름만 돌려줘 history 가 없었다 → 기록을 세다 멈춰 빈 화면(2026-11-17). 빠진 값은 채운다
const toLogin = (data: SheetAnswer, code: string) =>
	data.ok
		? ({
				ok: true,
				login: {
					name: data.name,
					age: data.age ?? '',
					code,
					history: data.history ?? [],
					doneToday: data.doneToday ?? false,
				},
			} as const)
		: ({ ok: false, error: 'wrong' as LoginFailure } as const);

// NOTE: Apps Script 웹 앱은 미리 묻는 요청(preflight)을 못 받는다 — Content-Type 을 붙이지 않고(text/plain) 보낸다.

/** 로그인(이름 + 코드). 맞으면 나이·오늘 완료 여부·기록까지 받는다 */
export async function login(name: string, code: string) {
	try {
		const res = await fetch(loginUrl(CHALLENGE_URL, name, code));
		return toLogin((await res.json()) as SheetAnswer, code);
	} catch {
		return { ok: false, error: 'network' as LoginFailure } as const;
	}
}

/** 기록 한 줄 저장. 성공하면 오늘 줄까지 들어간 기록을 돌려받는다 */
export async function sendChallenge(
	record: ReturnType<typeof challengeRecord>,
) {
	const res = await fetch(CHALLENGE_URL, {
		method: 'POST',
		body: JSON.stringify(record),
	});
	return toLogin((await res.json()) as SheetAnswer, record.code);
}
