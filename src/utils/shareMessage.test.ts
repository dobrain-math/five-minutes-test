import { describe, expect, test } from 'vitest';
import type { Report } from '@/@types/test';
import { shareParts, shouldUseShareSheet } from './shareMessage.ts';

const report: Report = {
	studentName: '김하늘',
	studentAge: '초2',
	courseTitle: '53-1권',
	correct: 70,
	total: 80,
	durationMs: 600_000,
	// 한국 2026-10-20(화) 18:25
	finishedAt: Date.UTC(2026, 9, 20, 9, 25),
	sections: [],
	wrong: [],
};

const url = 'https://five-minutes-test.vercel.app/s/3abc';

describe('shareParts', () => {
	test('카톡 두 개로 보낸다: 첫째는 카드와 같은 제목·안내(링크 없음), 둘째는 링크만', () => {
		expect(shareParts(report, url)).toEqual({
			message:
				'⭐10월 20일(화) 연산 테스트 리포트\n' +
				'김하늘 학생의 금일 테스트 결과입니다. 클릭해 자세한 리포트를 확인해 보세요.',
			link: url,
		});
	});

	test('날짜가 없는 옛 결과는 날짜 없이', () => {
		const { finishedAt: _, ...old } = report;
		expect(shareParts(old, url).message.split('\n')[0]).toBe(
			'⭐연산 테스트 리포트',
		);
	});
});

describe('shouldUseShareSheet', () => {
	test('터치 기기에 공유 시트가 있으면 공유 시트를 쓴다', () => {
		expect(shouldUseShareSheet(true, true)).toBe(true);
	});

	test('PC(마우스)는 공유 시트가 있어도 복사로 보낸다 — 윈도 공유 창엔 카톡·복사가 없음', () => {
		expect(shouldUseShareSheet(true, false)).toBe(false);
	});

	test('공유 시트가 없으면 터치 기기여도 복사로 보낸다', () => {
		expect(shouldUseShareSheet(false, true)).toBe(false);
	});
});
