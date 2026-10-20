import { describe, expect, test } from 'vitest';
import type { Report } from '@/@types/test';
import { shareMessage } from './shareMessage.ts';

const report: Report = {
	studentName: '김하늘',
	studentAge: '초2',
	courseTitle: '53-1권',
	correct: 70,
	total: 80,
	durationMs: 600_000,
	finishedAt: new Date(2026, 9, 20, 15, 30).getTime(),
	sections: [],
	wrong: [],
};

describe('shareMessage', () => {
	test('제목은 「테스트 결과 리포트 도착」', () => {
		expect(shareMessage(report).title).toBe(
			'두뇌로수학 테스트 결과 리포트 도착',
		);
	});

	test('본문에 학생 이름과 테스트 본 날짜(n월 m일)를 적는다', () => {
		expect(shareMessage(report).text).toBe(
			'김하늘 학생의 10월 20일 연산 테스트 결과입니다.',
		);
	});

	test('날짜가 없는 옛 링크는 날짜 없이 쓴다', () => {
		const { finishedAt: _, ...old } = report;
		expect(shareMessage(old).text).toBe(
			'김하늘 학생의 연산 테스트 결과입니다.',
		);
	});
});
