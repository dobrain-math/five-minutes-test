import { describe, expect, test } from 'vitest';
import type { Report } from '@/@types/test';
import { challengeRecord, isChallengeCode } from './challenge.ts';

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

describe('challengeRecord — 시트 «기록» 한 줄로 보낼 값', () => {
	test('전체 범위 테스트', () => {
		expect(challengeRecord(report, '4821')).toEqual({
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
		expect(challengeRecord({ ...report, part: 0 }, '4821').scope).toBe(
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
