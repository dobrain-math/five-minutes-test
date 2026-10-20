import type { Course, Problem, Rng, SectionDef } from '@/@types/test';

/** lo 이상 hi 이하 정수 */
const int = (rng: Rng, lo: number, hi: number) =>
	lo + Math.floor(rng() * (hi - lo + 1));

const num = (...ds: number[]) => ds.reduce((acc, d) => acc * 10 + d, 0);

const add = (left: number, right: number): Problem => ({
	left,
	op: '+',
	right,
});
const sub = (left: number, right: number): Problem => ({
	left,
	op: '-',
	right,
});
const mul = (left: number, right: number): Problem => ({
	left,
	op: '×',
	right,
});

// ── 공통 생성기 ────────────────────────────────────────────

/** 두자리 + 한자리, 받아올림 o */
const twoPlusOneCarry = (rng: Rng) => {
	const o = int(rng, 1, 9);
	return add(num(int(rng, 1, 9), o), int(rng, Math.max(2, 10 - o), 9));
};

// ── 기본연습 ───────────────────────────────────────────────

const basic: Course = {
	id: 'basic',
	title: '기본연습',
	sections: [
		{
			id: 'basic-1',
			title: '받아올림이 없는 한 + 한 연산',
			generate: (rng) => {
				const a = int(rng, 1, 8);
				return add(a, int(rng, 1, 9 - a));
			},
		},
		{
			id: 'basic-2',
			title: '받아올림이 있는 한자리 + 한자리 연산',
			generate: (rng) => {
				const a = int(rng, 1, 9);
				return add(a, int(rng, 10 - a, 9));
			},
		},
		{
			id: 'basic-3',
			title: '받아내림이 없는 한자리 - 한자리 연산',
			generate: (rng) => {
				const a = int(rng, 2, 9);
				return sub(a, int(rng, 1, a - 1));
			},
		},
		{
			id: 'basic-4',
			title: '받아내림이 없는 두자리 - 한자리 연산',
			generate: (rng) => {
				const o = int(rng, 1, 9);
				return sub(num(int(rng, 1, 9), o), int(rng, 1, o));
			},
		},
		{
			id: 'basic-5',
			title: '받아내림이 있는 11~18 - 한자리 연산',
			generate: (rng) => {
				const o = int(rng, 1, 8);
				return sub(num(1, o), int(rng, o + 1, 9));
			},
		},
		{
			id: 'basic-6',
			title: '받아올림이 있는 두자리 + 한자리 연산',
			generate: twoPlusOneCarry,
		},
		{
			id: 'basic-7',
			title: '받아내림이 있는 두자리 - 한자리 연산',
			generate: (rng) => {
				const o = int(rng, 1, 8);
				return sub(num(int(rng, 2, 9), o), int(rng, o + 1, 9));
			},
		},
		{
			id: 'basic-8',
			title: '0으로 끝나는 두자리 - 한자리 연산',
			generate: (rng) => sub(num(int(rng, 1, 9), 0), int(rng, 1, 9)),
		},
	],
};

// ── 53-1권 ─────────────────────────────────────────────────

/** 셋둘뺄셈: 일의자리·십의자리 모두 받아내림 o */
const threeMinusTwo: SectionDef['generate'] = (rng, i = 0) => {
	const h = int(rng, 1, 9);
	// 짝수 번째 문제(절반)는 「십의자리 9 · 일의자리 4~9」인 세 자리 수
	if (i % 2 === 0) {
		const oa = int(rng, 4, 8); // 받아내림이 생기려면 빼는 수 일의자리가 더 커야 하므로 9 는 불가
		return sub(num(h, 9, oa), num(9, int(rng, oa + 1, 9)));
	}
	const ta = int(rng, 0, 9);
	const oa = ta === 9 ? int(rng, 0, 3) : int(rng, 0, 8);
	// 일의자리에서 1을 빌려 간 뒤에도 십의자리가 모자라야 하므로 tb ≥ ta
	return sub(
		num(h, ta, oa),
		num(int(rng, Math.max(1, ta), 9), int(rng, oa + 1, 9)),
	);
};

const book531: Course = {
	id: '53-1',
	title: '53-1권',
	sections: [
		{
			id: '531-1',
			title: '받아올림이 있는 두자리 + 한자리 연산',
			generate: twoPlusOneCarry,
		},
		{
			id: '531-2',
			title: '받아내림이 있는 두자리 - 한자리 연산',
			generate: (rng) => {
				const o = int(rng, 0, 8);
				return sub(num(int(rng, 1, 9), o), int(rng, o + 1, 9));
			},
		},
		{
			id: '531-3',
			title: '받아올림이 있는 두자리 + 두자리 연산',
			generate: (rng) => {
				const oa = int(rng, 1, 9);
				return add(
					num(int(rng, 1, 9), oa),
					num(int(rng, 1, 9), int(rng, 10 - oa, 9)),
				);
			},
		},
		{
			id: '531-4',
			title: '받아내림이 있는 두자리 - 두자리 연산',
			generate: (rng) => {
				const ta = int(rng, 2, 9);
				const oa = int(rng, 0, 8);
				return sub(num(ta, oa), num(int(rng, 1, ta - 1), int(rng, oa + 1, 9)));
			},
		},
		{
			id: '531-5',
			title: '받아올림이 있는 세자리 + 두자리 연산',
			generate: (rng) => {
				const o = int(rng, 6, 9);
				return add(
					num(int(rng, 1, 9), 9, o),
					num(int(rng, 1, 9), int(rng, 10 - o, 9)),
				);
			},
		},
		{
			id: '531-6',
			title: '받아내림이 두 번 있는 세자리 - 두자리 연산',
			generate: threeMinusTwo,
		},
		{
			id: '531-7-1',
			title: '올림이 없는 두자리 × 한자리 연산',
			generate: (rng) => {
				const b = int(rng, 2, 4);
				const max = Math.floor(9 / b);
				return mul(num(int(rng, 1, max), int(rng, 1, max)), b);
			},
		},
		{
			id: '531-7-2',
			title: '올림이 있는 두자리 × 한자리 연산',
			generate: (rng) => {
				const b = int(rng, 2, 9);
				return mul(num(int(rng, 1, 9), int(rng, Math.ceil(10 / b), 9)), b);
			},
		},
	],
};

/** 홈 화면 종목 리스트. 새 종목은 여기에 추가한다. */
export const courses: Course[] = [basic, book531];

export const getCourse = (id: string | undefined) =>
	courses.find((c) => c.id === id);
