import { describe, expect, test } from 'vitest';
import type { Problem } from '@/@types/test';
import { PER_SECTION, buildTest } from '@/utils/buildTest.ts';
import { courses, getCourse } from './courses.ts';

const ones = (n: number) => n % 10;
const tens = (n: number) => Math.floor(n / 10) % 10;
const digits = (n: number) => String(n).length;

/** 곱셈·덧셈은 절반을 순서를 뒤집어 내므로(원장님 결정 2026-10-22) 뒤집은 쪽도 맞으면 통과 */
const either = (rule: (p: Problem) => boolean) => (p: Problem) =>
	rule(p) || rule({ ...p, left: p.right, right: p.left });

/** 두자리(0으로 안 끝남) × k, 순서는 어느 쪽이든 */
const fixedTimes = ({ left: a, op, right: b }: Problem, k: number) => {
	const two = (x: number) => digits(x) === 2 && ones(x) !== 0;
	return op === '×' && ((two(a) && b === k) || (a === k && two(b)));
};

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
	'basic-6': either(
		({ left: a, op, right: b }) =>
			op === '+' && digits(a) === 2 && digits(b) === 1 && ones(a) + b >= 10,
	),
	'basic-7': ({ left: a, op, right: b }) =>
		op === '-' && digits(a) === 2 && digits(b) === 1 && ones(a) < b,
	'basic-8': ({ left: a, op, right: b }) =>
		op === '-' && digits(a) === 2 && ones(a) === 0 && digits(b) === 1,

	// 53-1권
	'531-1': either(
		({ left: a, op, right: b }) =>
			op === '+' && digits(a) === 2 && digits(b) === 1 && ones(a) + b >= 10,
	),
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
	'531-5': either(
		({ left: a, op, right: b }) =>
			op === '+' &&
			digits(a) === 3 &&
			tens(a) === 9 &&
			ones(a) >= 6 &&
			digits(b) === 2 &&
			ones(a) + ones(b) >= 10,
	),
	'531-6': ({ left: a, op, right: b }) =>
		op === '-' &&
		digits(a) === 3 &&
		digits(b) === 2 &&
		ones(a) < ones(b) &&
		tens(a) - 1 < tens(b),
	'531-7-1': either(
		({ left: a, op, right: b }) =>
			op === '×' &&
			digits(a) === 2 &&
			digits(b) === 1 &&
			b >= 2 &&
			ones(a) * b < 10 &&
			tens(a) * b < 10,
	),
	'531-7-2': either(
		({ left: a, op, right: b }) =>
			op === '×' &&
			digits(a) === 2 &&
			digits(b) === 1 &&
			b >= 2 &&
			ones(a) * b >= 10,
	),
	// 53-1권 곱셈 추가(2026-10-22)
	'531-8': ({ left: a, op, right: b }) =>
		op === '×' &&
		digits(a) === 2 &&
		tens(a) === 1 &&
		ones(a) !== 0 &&
		digits(b) === 2 &&
		tens(b) === 1 &&
		ones(b) !== 0,
	// 두자리(0으로 안 끝남) × 몇십(20~90), 순서는 절반씩 뒤집힌다
	'531-9': ({ left: a, op, right: b }) => {
		const tidy = (x: number, y: number) =>
			digits(x) === 2 && ones(x) !== 0 && ones(y) === 0 && y >= 20 && y <= 90;
		return op === '×' && (tidy(a, b) || tidy(b, a));
	},
	'531-10': either(
		({ left: a, op, right: b }) =>
			op === '×' &&
			digits(a) === 3 &&
			tens(a) === 0 &&
			ones(a) >= 2 &&
			digits(b) === 1 &&
			b >= 2,
	),
	// X5·X11·X99: 정해진 수가 뒤(91 × 11)든 앞(11 × 91)이든 된다
	'531-11': (p) => fixedTimes(p, 5),
	'531-12': (p) => fixedTimes(p, 11),
	'531-13': either(
		({ left: a, op, right: b }) =>
			op === '×' &&
			digits(a) === 3 &&
			ones(a) === 0 &&
			tens(a) >= 2 &&
			digits(b) === 1 &&
			b >= 2,
	),
	'531-14': ({ left: a, op, right: b }) =>
		op === '×' &&
		digits(a) === 2 &&
		ones(a) !== 0 &&
		digits(b) === 2 &&
		ones(b) !== 0,
	'531-15': (p) => fixedTimes(p, 99),
};

describe('53-1권 유형 목록', () => {
	test('유형 이름은 짧은 이름 + 괄호 조건(원장님 결정 2026-10-22, 16번 ST부터는 아직 없음)', () => {
		expect(getCourse('basic')!.sections.map((s) => s.title)).toEqual([
			'한한덧셈(받아올림X)',
			'한한덧셈(받아올림O)',
			'한한뺄셈(받아내림X)',
			'두한뺄셈(받아내림X)',
			'십몇한뺄셈(받아내림O)',
			'두한덧셈(받아올림O)',
			'두한뺄셈(받아내림O)',
			'몇십한뺄셈(받아내림O)',
		]);
		expect(getCourse('53-1')!.sections.map((s) => s.title)).toEqual([
			'두한덧셈(받아올림O)',
			'두한뺄셈(받아내림O)',
			'두두덧셈(받아올림O)',
			'두두뺄셈(받아내림O)',
			'셋둘덧셈(받아올림O)',
			'셋둘뺄셈(받아내림 두 번)',
			'두한곱셈(올림X)',
			'두한곱셈(올림O)',
			'19단',
			'두자리 × 몇십',
			'세한곱-1',
			'X5',
			'X11',
			'세한곱-2',
			'두두곱',
			'X99',
		]);
	});

	test('유형 이름이 겹치지 않는다(리포트·공유 링크가 이름으로 유형을 찾는다)', () => {
		for (const course of courses) {
			const titles = course.sections.map((s) => s.title);
			expect(new Set(titles).size).toBe(titles.length);
		}
	});

	test('두자리 × 몇십: 24문제 중 절반은 몇십이 뒤, 절반은 앞', () => {
		const questions = buildTest(getCourse('53-1')!, 9);
		const tensLast = questions.filter((q) =>
			q.text.split(' ')[2].endsWith('0'),
		);
		expect(tensLast).toHaveLength(12);
	});
});

describe('유형별 문제 생성', () => {
	for (const course of courses) {
		for (const section of course.sections) {
			test(`${course.title} · ${section.title}`, () => {
				const rule = rules[section.id];
				expect(rule, `${section.id} 규칙이 없다`).toBeDefined();
				for (let i = 0; i < 500; i++) {
					// i 를 넘겨 짝수·홀수 번째(순서를 뒤집는 절반)를 모두 검사한다
					const p = section.generate(Math.random, i % 24);
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
		test(`${course.title} 전체 풀기: 유형마다 24문제씩 목차 순서대로, 유형 안 중복 없음`, () => {
			const questions = buildTest(course);
			expect(questions).toHaveLength(24 * course.sections.length);

			// 유형 목차 순서대로 24문제씩 묶여 나온다(전체 풀기는 유형마다 한 페이지)
			course.sections.forEach((section, i) => {
				const page = questions.slice(i * 24, (i + 1) * 24);
				expect(page.every((q) => q.sectionId === section.id)).toBe(true);
				expect(new Set(page.map((q) => q.text)).size).toBe(24);
			});
			expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
		});

		test(`${course.title} 한 유형: 그 유형 24문제만`, () => {
			course.sections.forEach((section, i) => {
				const questions = buildTest(course, i);
				expect(questions).toHaveLength(PER_SECTION);
				expect(questions.every((q) => q.sectionId === section.id)).toBe(true);
				expect(new Set(questions.map((q) => q.text)).size).toBe(24);
			});
		});
	}

	test('없는 유형 번호면 오류', () => {
		expect(() => buildTest(getCourse('basic')!, 8)).toThrow();
	});

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
		const questions = buildTest(getCourse('53-1')!, 5);
		const special = questions.filter((q) => {
			const a = Number(q.text.split(' ')[0]);
			return tens(a) === 9 && ones(a) >= 4;
		});
		expect(special).toHaveLength(questions.length / 2);
	});

	test('유형 안에서는 섞여서 나온다(만든 순서 그대로가 아니다)', () => {
		const order = buildTest(getCourse('basic')!, 0).map((q) =>
			Number(q.id.split('#')[1]),
		);
		expect(order).not.toEqual([...order].sort((a, b) => a - b));
	});
});

describe('X5·X11·X99: 절반은 정해진 수가 앞(91 × 11 ↔ 11 × 91)', () => {
	for (const [id, k] of [
		['531-11', 5],
		['531-12', 11],
		['531-15', 99],
	] as const) {
		test(`${id}: 짝수 번째는 × ${k}, 홀수 번째는 ${k} ×`, () => {
			const section = getCourse('53-1')!.sections.find((s) => s.id === id)!;
			for (let i = 0; i < 24; i++) {
				const p = section.generate(Math.random, i);
				if (i % 2 === 0) expect(p.right, JSON.stringify(p)).toBe(k);
				else expect(p.left, JSON.stringify(p)).toBe(k);
			}
		});
	}
});

describe('곱셈·덧셈 유형은 절반을 순서를 뒤집어 낸다(세한곱 → 7 × 405, 두한덧셈 → 7 + 48)', () => {
	const sectionOf = (id: string) =>
		courses.flatMap((c) => c.sections).find((s) => s.id === id)!;
	// 두 수의 자릿수가 다른 곱셈 유형만 자릿수로 순서를 가릴 수 있다(19단·두두곱·X11·X99 는 둘 다 두자리 — X11·X99 는 위 테스트가 검사)
	// 한한덧셈·두두덧셈·19단·두두곱은 두 수의 자릿수가 같아 아래 «같은 난수면 뒤집힌 짝» 테스트가 검사
	const uneven = [
		'basic-6',
		'531-1',
		'531-5',
		'531-7-1',
		'531-7-2',
		'531-9',
		'531-10',
		'531-11',
		'531-13',
	];
	for (const id of uneven) {
		test(`${id}: 짝수 번째는 긴 수가 앞, 홀수 번째는 뒤`, () => {
			const section = sectionOf(id);
			for (let i = 0; i < 24; i++) {
				const p = section.generate(Math.random, i);
				const longFirst = String(p.left).length >= String(p.right).length;
				// 두자리 × 몇십은 둘 다 두자리라 «몇십이 뒤면 짝수» 로 가린다
				const evenShape = id === '531-9' ? p.right % 10 === 0 : longFirst;
				expect(evenShape, `${i}번째 ${JSON.stringify(p)}`).toBe(i % 2 === 0);
			}
		});
	}

	// 같은 난수를 넣으면 홀수 번째는 짝수 번째를 뒤집은 식이어야 한다
	const seeded = (seed: number) => {
		let x = seed;
		return () => (x = (x * 9301 + 49297) % 233280) / 233280;
	};
	for (const id of ['basic-1', 'basic-2', '531-3', '531-8', '531-14']) {
		test(`${id}: 같은 난수면 홀수 번째는 짝수 번째를 뒤집은 식`, () => {
			const section = sectionOf(id);
			for (let n = 1; n <= 50; n++) {
				const a = section.generate(seeded(n), 0);
				const b = section.generate(seeded(n), 1);
				expect(b).toEqual({ ...a, left: a.right, right: a.left });
			}
		});
	}
});
