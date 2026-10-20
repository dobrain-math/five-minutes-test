import { describe, expect, test } from 'vitest';
import type { Report } from '@/@types/test';
import { getCourse } from '@/data/courses.ts';
import indexHtml from '../../index.html?raw';
import { injectCard, linkCard } from './linkCard.ts';
import { encodeReport } from './shareLink.ts';

const course = getCourse('basic')!;
const report: Report = {
	studentName: '김하늘',
	studentAge: '초2',
	courseId: 'basic',
	courseTitle: course.title,
	correct: 80,
	total: 80,
	durationMs: 300_000,
	// 한국 2026-10-20(화) 18:25
	finishedAt: Date.UTC(2026, 9, 20, 9, 25),
	sections: course.sections.map((sec) => ({
		title: sec.title,
		correct: 10,
		total: 10,
	})),
	wrong: [],
};

describe('linkCard', () => {
	test('제목은 「⭐m월 d일(요일) 연산 테스트 리포트」', () => {
		expect(linkCard(encodeReport(report))?.title).toBe(
			'⭐10월 20일(화) 연산 테스트 리포트',
		);
	});

	test('내용은 학생 이름 + 금일 결과 안내', () => {
		expect(linkCard(encodeReport(report))?.description).toBe(
			'김하늘 학생의 금일 테스트 결과입니다. 클릭해 자세한 리포트를 확인해 보세요.',
		);
	});

	test('실시일이 없는 링크는 날짜 없이', () => {
		const { finishedAt: _, ...old } = report;
		expect(linkCard(encodeReport(old))?.title).toBe('⭐연산 테스트 리포트');
	});

	test('예전 v1 긴 코드도 이름을 읽는다', () => {
		const v1 = btoa(
			String.fromCharCode(
				...new TextEncoder().encode(
					JSON.stringify({
						v: 1,
						n: '박하나',
						a: '7세',
						c: 'x',
						t: 1,
						s: [],
						w: '',
					}),
				),
			),
		);
		expect(linkCard(v1)).toEqual({
			title: '⭐연산 테스트 리포트',
			description:
				'박하나 학생의 금일 테스트 결과입니다. 클릭해 자세한 리포트를 확인해 보세요.',
		});
	});

	test('깨진 코드는 null', () => {
		expect(linkCard('3%%%')).toBeNull();
		expect(linkCard('')).toBeNull();
	});
});

describe('injectCard', () => {
	const html = `<html><head><title>두뇌로수학 테스트</title>
<meta name="description" content="기본 설명" />
<meta property="og:url" content="https://five-minutes-test.vercel.app/" />
<meta property="og:title" content="기본 제목" />
<meta property="og:description" content="기본 설명" />
</head><body></body></html>`;

	test('제목·설명·주소 메타를 카드 문구로 바꾼다', () => {
		const out = injectCard(
			html,
			{ title: '⭐제목', description: '설명' },
			'https://five-minutes-test.vercel.app/s/3abc',
		);
		expect(out).toContain('<meta property="og:title" content="⭐제목" />');
		expect(out).toContain('<meta property="og:description" content="설명" />');
		expect(out).toContain('<meta name="description" content="설명" />');
		expect(out).toContain(
			'<meta property="og:url" content="https://five-minutes-test.vercel.app/s/3abc" />',
		);
		expect(out).toContain('<title>⭐제목</title>');
	});

	test('실제 index.html(여러 줄 메타)에서도 네 곳을 모두 바꾼다', () => {
		const out = injectCard(
			indexHtml,
			{ title: 'T1', description: 'D1' },
			'https://x/s/3',
		);
		expect(out.match(/content="D1"/g)).toHaveLength(2);
		expect(out).toContain('<meta property="og:title" content="T1" />');
		expect(out).toContain('content="https://x/s/3"');
		expect(out).toContain('<title>T1</title>');
	});

	test('이름에 따옴표·꺾쇠가 있어도 HTML 이 깨지지 않게 바꿔 적는다', () => {
		const out = injectCard(
			html,
			{ title: 't', description: '"><script>alert(1)</script>' },
			'https://x/',
		);
		expect(out).not.toContain('<script>');
		expect(out).toContain('&quot;&gt;&lt;script&gt;');
	});
});
