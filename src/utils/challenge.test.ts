import { describe, expect, test, vi } from 'vitest';
import type { Report } from '@/@types/test';
import {
	challengeDays,
	challengeRecord,
	isChallengeCode,
	isDoneToday,
	login,
	loginError,
	loginUrl,
} from './challenge.ts';

const report: Report = {
	studentName: '김민준',
	studentAge: '초2',
	courseId: '53-1',
	courseTitle: '53-1권',
	correct: 50,
	total: 57,
	durationMs: 312_900,
	finishedAt: 1_762_760_000_000,
	sections: [{ title: '두한덧셈 (받아올림O)', correct: 3, total: 3 }],
	wrong: [],
};

const who = { name: '김민준', code: '4821' };

describe('challengeRecord — 시트 «기록» 한 줄로 보낼 값', () => {
	test('전체 범위 테스트 — 로그인한 이름·코드를 함께 보낸다', () => {
		expect(challengeRecord(report, who)).toEqual({
			name: '김민준',
			code: '4821',
			course: '53-1권',
			scope: '전체 범위 테스트',
			correct: 50,
			total: 57,
			seconds: 312,
			finishedAt: 1_762_760_000_000,
		});
	});

	test('한 유형 풀이는 «n번 유형 이름»', () => {
		expect(challengeRecord({ ...report, part: 0 }, who).scope).toBe(
			'1번 두한덧셈 (받아올림O)',
		);
	});
});

test('챌린지 코드는 1000~9999 네 자리 숫자', () => {
	for (const ok of ['1000', '4821', '9999'])
		expect(isChallengeCode(ok)).toBe(true);
	for (const bad of ['', '482', '48211', '0482', '48a1', ' 4821'])
		expect(isChallengeCode(bad), bad).toBe(false);
});

test('로그인 주소 — 한글 이름은 인코딩하고 앞뒤 공백은 뺀다', () => {
	expect(loginUrl('https://x.test/exec', ' 김민준 ', '4821')).toBe(
		'https://x.test/exec?name=%EA%B9%80%EB%AF%BC%EC%A4%80&code=4821',
	);
});

test('챌린지 참여 일수 = 기록이 있는 서로 다른 날짜 수', () => {
	const day = (date: string) => ({
		date,
		course: '53-1권',
		scope: '전체 범위 테스트',
		correct: 1,
		total: 2,
		seconds: 10,
	});
	expect(challengeDays([])).toBe(0);
	expect(
		challengeDays([day('2026-11-15'), day('2026-11-16'), day('2026-11-16')]),
	).toBe(2);
});

test('오늘 완료 여부는 한국 날짜로 — 저장해 둔 로그인으로 바로 들어갈 때 다시 계산', () => {
	const history = [
		{
			date: '2026-11-17',
			course: '',
			scope: '',
			correct: 1,
			total: 1,
			seconds: 1,
		},
	];
	// 2026-11-16 15:30 UTC = 11월 17일 00:30 한국
	expect(isDoneToday(history, Date.UTC(2026, 10, 16, 15, 30))).toBe(true);
	// 2026-11-16 14:30 UTC = 11월 16일 23:30 한국
	expect(isDoneToday(history, Date.UTC(2026, 10, 16, 14, 30))).toBe(false);
	expect(isDoneToday([], Date.UTC(2026, 10, 16, 15, 30))).toBe(false);
});

test('옛 시트 스크립트처럼 이름만 와도 기록·나이를 빈 값으로 채운다(빈 화면 방지)', async () => {
	vi.stubGlobal(
		'fetch',
		async () => new Response(JSON.stringify({ ok: true, name: '테스트' })),
	);
	const r = await login('테스트', '6746');
	vi.unstubAllGlobals();
	expect(r).toEqual({
		ok: true,
		login: {
			name: '테스트',
			age: '',
			code: '6746',
			history: [],
			doneToday: false,
		},
	});
});

test('로그인 실패 문구', () => {
	expect(loginError('wrong')).toBe('이름 또는 챌린지 코드가 맞지 않습니다.');
	expect(loginError('network')).toBe(
		'기록 시트에 연결하지 못했습니다. 잠시 뒤 다시 시도해 주세요.',
	);
});
