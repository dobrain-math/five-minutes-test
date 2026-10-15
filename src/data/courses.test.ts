import { describe, expect, test } from 'vitest';
import type { Problem } from '@/@types/test';
import { buildTest } from '@/utils/buildTest.ts';
import { courses, getCourse } from './courses.ts';

const ones = (n: number) => n % 10;
const tens = (n: number) => Math.floor(n / 10) % 10;
const digits = (n: number) => String(n).length;

/** 각 유형이 지켜야 할 조건. 생성기와 따로 적어서 서로 검증한다. */
const rules: Record<string, (p: Problem) => boolean> = {
	// 기본연습
	'basic-1': ({ left: a, op, right: b }) =>
		op === '+' && digits(a) === 1 && digits(b) === 1 && a + b < 10,
	'basic-2': ({ left: a, op, right: b }) =>
		op === '+' && digits(a) === 1 && digits(b) === 1 && a + b >= 10,
	'basic-3': ({ left: a, op, right: b }) =>
		op === '-' && digits(a) === 1 && digits(b) === 1 && a > b,
	'basic-4': ({ left: a, op, right: b }) =>
		op === '-' && digits(a) === 2 && digits(b) === 1 && ones(a) >= b,
	'basic-5': ({ left: a, op, right: b }) =>
		op === '-' &&
		tens(a) === 1 &&
		digits(a) === 2 &&
		digits(b) === 1 &&
		ones(a) < b,
	'basic-6': ({ left: a, op, right: b }) =>
		op === '+' && digits(a) === 2 && digits(b) === 1 && ones(a) + b >= 10,
	'basic-7': ({ left: a, op, right: b }) =>
		op === '-' && digits(a) === 2 && digits(b) === 1 && ones(a) < b,
	'basic-8': ({ left: a, op, right: b }) =>
		op === '-' && digits(a) === 2 && ones(a) === 0 && digits(b) === 1,

	// 53-1권
	'531-1': ({ left: a, op, right: b }) =>
		op === '+' && digits(a) === 2 && digits(b) === 1 && ones(a) + b >= 10,
	'531-2': ({ left: a, op, right: b }) =>
		op === '-' && digits(a) === 2 && digits(b) === 1 && ones(a) < b,
	'531-3': ({ left: a, op, right: b }) =>
		op === '+' && digits(a) === 2 && digits(b) === 2 && ones(a) + ones(b) >= 10,
	'531-4': ({ left: a, op, right: b }) =>
		op === '-' &&
		digits(a) === 2 &&
		digits(b) === 2 &&
		a > b &&
		ones(a) < ones(b),
	'531-5': ({ left: a, op, right: b }) =>
		op === '+' &&
		digits(a) === 3 &&
		tens(a) === 9 &&
		ones(a) >= 6 &&
		digits(b) === 2 &&
		ones(a) + ones(b) >= 10,
	'531-6': ({ left: a, op, right: b }) =>
		op === '-' &&
		digits(a) === 3 &&
		digits(b) === 2 &&
		ones(a) < ones(b) &&
		tens(a) - 1 < tens(b),
	'531-7-1': ({ left: a, op, right: b }) =>
		op === '×' &&
		digits(a) === 2 &&
		digits(b) === 1 &&
		b >= 2 &&
		ones(a) * b < 10 &&
		tens(a) * b < 10,
	'531-7-2': ({ left: a, op, right: b }) =>
		op === '×' &&
		digits(a) === 2 &&
		digits(b) === 1 &&
		b >= 2 &&
		ones(a) * b >= 10,
};

describe('유형별 문제 생성', () => {
	for (const course of courses) {
		for (const section of course.sections) {
			test(`${course.title} · ${section.title}`, () => {
				const rule = rules[section.id];
				expect(rule, `${section.id} 규칙이 없다`).toBeDefined();
				for (let i = 0; i < 500; i++) {
					const p = section.generate(Math.random);
					expect(rule(p), JSON.stringify(p)).toBe(true);
					expect(p.left).toBeGreaterThan(0);
					expect(p.right).toBeGreaterThan(0);
				}
			});
		}
	}
});

describe('buildTest', () => {
	for (const course of courses) {
		test(`${course.title}: 80문제, 유형마다 같은 개수, 유형 안 중복 없음`, () => {
			const questions = buildTest(course);
			expect(questions).toHaveLength(80);

			const perSection = 80 / course.sections.length;
			for (const section of course.sections) {
				const mine = questions.filter((q) => q.sectionId === section.id);
				expect(mine).toHaveLength(perSection);
				expect(new Set(mine.map((q) => q.text)).size).toBe(perSection);
			}
			expect(new Set(questions.map((q) => q.id)).size).toBe(80);
		});
	}

	test('정답은 실제 계산값이다', () => {
		for (const q of buildTest(getCourse('53-1')!)) {
			const [l, op, r] = q.text.split(' ');
			const a = Number(l);
			const b = Number(r);
			const expected = op === '+' ? a + b : op === '−' ? a - b : a * b;
			expect(q.answer).toBe(String(expected));
		}
	});

	test('셋둘뺄셈은 절반이 「십의자리 9 · 일의자리 4~9」인 세 자리 수다', () => {
		const questions = buildTest(getCourse('53-1')!).filter(
			(q) => q.sectionId === '531-6',
		);
		const special = questions.filter((q) => {
			const a = Number(q.text.split(' ')[0]);
			return tens(a) === 9 && ones(a) >= 4;
		});
		expect(special).toHaveLength(questions.length / 2);
	});

	test('섞여서 나온다 (유형 순서대로 묶여 있지 않다)', () => {
		const ids = buildTest(getCourse('basic')!).map((q) => q.sectionId);
		const sorted = [...ids].sort();
		expect(ids).not.toEqual(sorted);
	});
});
