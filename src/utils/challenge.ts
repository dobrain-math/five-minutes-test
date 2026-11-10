import type { Report } from '@/@types/test';

/**
 * 챌린지 기록 시트(원장님 구글 시트의 Apps Script 웹 앱) 주소. 비어 있으면 챌린지 기능을 숨긴다.
 * 시트 스크립트는 challenge/Code.gs (프로토타입 2026-11-10).
 */
// NOTE: 로컬 시험용으로 .env 의 VITE_CHALLENGE_URL 이 있으면 그쪽을 쓴다.
export const CHALLENGE_URL: string = import.meta.env.VITE_CHALLENGE_URL ?? '';

/** 챌린지 코드: 1000~9999 네 자리 숫자(시트 Code.gs newCode_ 와 같은 규칙) */
export const isChallengeCode = (code: string) => /^[1-9]\d{3}$/.test(code);

/** 시트 «기록» 한 줄로 보낼 값 */
export function challengeRecord(report: Report, code: string) {
	return {
		code,
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

// NOTE: Apps Script 웹 앱은 미리 묻는 요청(preflight)을 못 받는다 — Content-Type 을 붙이지 않고(text/plain) 보낸다.

/** 명단에 있는 코드면 학생 이름, 없으면 null */
export async function lookupChallenge(code: string): Promise<string | null> {
	const res = await fetch(`${CHALLENGE_URL}?code=${code}`);
	const data = (await res.json()) as { ok: boolean; name?: string };
	return data.ok ? (data.name ?? null) : null;
}

/** 기록 한 줄 저장. first = 그날 첫 풀이(그래프에 쓰임) */
export async function sendChallenge(
	record: ReturnType<typeof challengeRecord>,
): Promise<{ ok: boolean; first?: boolean }> {
	const res = await fetch(CHALLENGE_URL, {
		method: 'POST',
		body: JSON.stringify(record),
	});
	return (await res.json()) as { ok: boolean; first?: boolean };
}
