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
	// 한국 2026-10-27(화) 18:25
	finishedAt: Date.UTC(2026, 9, 27, 9, 25),
	sections: [],
	wrong: [],
};

const url = 'https://five-minutes-test.vercel.app/r/QkoAsq';

describe('shareMessage', () => {
	test('안내 글과 링크를 한 덩어리로 — 카톡이 글 아래 링크 카드를 붙인다', () => {
		expect(shareMessage(report, url)).toBe(
			'🍀 10월 27일(화) 연산 테스트 리포트\n' +
				'\n' +
				'김하늘 학생의 두뇌로수학 테스트 결과를 보내드립니다.\n' +
				'클릭해 자세한 내용을 확인해 보세요.\n' +
				'\n' +
				'https://five-minutes-test.vercel.app/r/QkoAsq',
		);
	});

	test('날짜가 없는 옛 결과는 날짜 없이', () => {
		const { finishedAt: _, ...old } = report;
		expect(shareMessage(old, url).split('\n')[0]).toBe('🍀 연산 테스트 리포트');
	});
});
