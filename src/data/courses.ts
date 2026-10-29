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

/**
 * 곱셈·덧셈은 홀수 번째(절반)를 순서를 뒤집어 낸다(405 × 7 ↔ 7 × 405, 48 + 7 ↔ 7 + 48, 원장님 결정 2026-10-22).
 * 생성기는 «긴 수 ○ 짧은 수» 모양만 만들고 이 함수로 감싼다. 뺄셈은 뒤집으면 답이 바뀌므로 쓰지 않는다.
 */
const bothWays =
	(gen: SectionDef['generate']): SectionDef['generate'] =>
	(rng, i = 0) => {
		const p = gen(rng, i);
		return i % 2 === 0 ? p : { ...p, left: p.right, right: p.left };
	};

/** 두자리 + 한자리, 받아올림 o */
const twoPlusOneCarry = bothWays((rng) => {
	const o = int(rng, 1, 9);
	return add(num(int(rng, 1, 9), o), int(rng, Math.max(2, 10 - o), 9));
});

/**
 * 두자리(0으로 안 끝남) × k. 홀수 번째(절반)는 k 를 앞에 둔다(91 × 11 ↔ 11 × 91, 원장님 결정 2026-10-22).
 */
const fixedTimes =
	(k: number): SectionDef['generate'] =>
	(rng, i = 0) => {
		const two = num(int(rng, 1, 9), int(rng, 1, 9));
		return i % 2 === 0 ? mul(two, k) : mul(k, two);
	};

// ── 기본연습 ───────────────────────────────────────────────

const basic: Course = {
	id: 'basic',
	title: '기본연습',
	sections: [
		{
			id: 'basic-1',
			title: '한한덧셈 (받아올림X)',
			generate: bothWays((rng) => {
				const a = int(rng, 1, 8);
				return add(a, int(rng, 1, 9 - a));
			}),
		},
		{
			id: 'basic-2',
			title: '한한덧셈 (받아올림O)',
			generate: bothWays((rng) => {
				const a = int(rng, 1, 9);
				return add(a, int(rng, 10 - a, 9));
			}),
		},
		{
			id: 'basic-3',
			title: '한한뺄셈 (받아내림X)',
			generate: (rng) => {
				const a = int(rng, 2, 9);
				return sub(a, int(rng, 1, a - 1));
			},
		},
		{
			id: 'basic-4',
			title: '두한뺄셈 (받아내림X)',
			generate: (rng) => {
				const o = int(rng, 1, 9);
				return sub(num(int(rng, 1, 9), o), int(rng, 1, o));
			},
		},
		{
			id: 'basic-5',
			title: '십몇한뺄셈 (받아내림O)',
			generate: (rng) => {
				const o = int(rng, 1, 8);
				return sub(num(1, o), int(rng, o + 1, 9));
			},
		},
		{
			id: 'basic-6',
			title: '두한덧셈 (받아올림O)',
			generate: twoPlusOneCarry,
		},
		{
			id: 'basic-7',
			title: '두한뺄셈 (받아내림O)',
			generate: (rng) => {
				const o = int(rng, 1, 8);
				return sub(num(int(rng, 2, 9), o), int(rng, o + 1, 9));
			},
		},
		{
			id: 'basic-8',
			title: '몇십한뺄셈 (받아내림O)',
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
			title: '두한덧셈 (받아올림O)',
			generate: twoPlusOneCarry,
		},
		{
			id: '531-2',
			title: '두한뺄셈 (받아내림O)',
			generate: (rng) => {
				const o = int(rng, 0, 8);
				return sub(num(int(rng, 1, 9), o), int(rng, o + 1, 9));
			},
		},
		{
			id: '531-3',
			title: '두두덧셈 (받아올림O)',
			generate: bothWays((rng) => {
				const oa = int(rng, 1, 9);
				return add(
					num(int(rng, 1, 9), oa),
					num(int(rng, 1, 9), int(rng, 10 - oa, 9)),
				);
			}),
		},
		{
			id: '531-4',
			title: '두두뺄셈 (받아내림O)',
			generate: (rng) => {
				const ta = int(rng, 2, 9);
				const oa = int(rng, 0, 8);
				return sub(num(ta, oa), num(int(rng, 1, ta - 1), int(rng, oa + 1, 9)));
			},
		},
		{
			id: '531-5',
			title: '셋둘덧셈 (받아올림O)',
			generate: bothWays((rng) => {
				const o = int(rng, 6, 9);
				return add(
					num(int(rng, 1, 9), 9, o),
					num(int(rng, 1, 9), int(rng, 10 - o, 9)),
				);
			}),
		},
		{
			id: '531-6',
			title: '셋둘뺄셈 (받아내림 두 번)',
			generate: threeMinusTwo,
		},
		{
			id: '531-7-1',
			title: '두한곱셈 (올림X)',
			generate: bothWays((rng) => {
				const b = int(rng, 2, 4);
				const max = Math.floor(9 / b);
				return mul(num(int(rng, 1, max), int(rng, 1, max)), b);
			}),
		},
		{
			id: '531-7-2',
			title: '두한곱셈 (올림O)',
			generate: bothWays((rng) => {
				const b = int(rng, 2, 9);
				return mul(num(int(rng, 1, 9), int(rng, Math.ceil(10 / b), 9)), b);
			}),
		},
		// ── 곱셈 추가(2026-10-22, 원장님 목록 8~15번) ──
		// NOTE: 제목은 원장님이 준 짧은 이름 그대로(앞 유형들도 2026-10-22 「두두덧셈(받아올림O)」 꼴 짧은 이름으로 바꿈). 「세한곱」이 둘이라 -1·-2 를 붙였다(이름으로 유형을 찾으므로 겹치면 안 됨).
		{
			id: '531-8',
			title: '19단',
			generate: bothWays((rng) =>
				mul(num(1, int(rng, 1, 9)), num(1, int(rng, 1, 9))),
			),
		},
		{
			id: '531-9',
			title: '두자리 × 몇십',
			// 두자리(0으로 안 끝남) × 몇십(20~90). 홀수 번째(절반)는 몇십을 앞에 둔다.
			generate: (rng, i = 0) => {
				const two = num(int(rng, 1, 9), int(rng, 1, 9));
				const tensOf = num(int(rng, 2, 9), 0);
				return i % 2 === 0 ? mul(two, tensOf) : mul(tensOf, two);
			},
		},
		{
			id: '531-10',
			title: '세한곱-1',
			// 405 × 7 처럼 세자리의 십의자리 0, 일의자리 2~9 / 한자리 2~9
			generate: bothWays((rng) =>
				mul(num(int(rng, 1, 9), 0, int(rng, 2, 9)), int(rng, 2, 9)),
			),
		},
		{
			id: '531-11',
			title: 'X5',
			generate: fixedTimes(5),
		},
		{
			id: '531-12',
			title: 'X11',
			generate: fixedTimes(11),
		},
		{
			id: '531-13',
			title: '세한곱-2',
			// 340 × 6 처럼 세자리의 일의자리 0, 십의자리 2~9 / 한자리 2~9(세한곱-1 과 같게)
			generate: bothWays((rng) =>
				mul(num(int(rng, 1, 9), int(rng, 2, 9), 0), int(rng, 2, 9)),
			),
		},
		{
			id: '531-14',
			title: '두두곱',
			generate: bothWays((rng) =>
				mul(
					num(int(rng, 1, 9), int(rng, 1, 9)),
					num(int(rng, 1, 9), int(rng, 1, 9)),
				),
			),
		},
		{
			id: '531-15',
			title: 'X99',
			generate: fixedTimes(99),
		},
		// ── 곱셈 추가(2026-10-29, 원장님 목록 16~19번) ──
		// NOTE: 공유 링크가 유형을 «권 안 순서»로 찾으므로 늘 맨 뒤에 이어 붙인다(shareLink.ts decodeShort).
		{
			id: '531-16',
			title: 'ST',
			// Same Ten: 앞자리가 같고 뒷자리끼리 더해 10 (47 × 43)
			generate: bothWays((rng) => {
				const t = int(rng, 1, 9);
				const o = int(rng, 1, 9);
				return mul(num(t, o), num(t, 10 - o));
			}),
		},
		{
			id: '531-17',
			title: 'TS',
			// Ten Same: 뒷자리가 같고 앞자리끼리 더해 10 (92 × 12)
			generate: bothWays((rng) => {
				const t = int(rng, 1, 9);
				const o = int(rng, 1, 9);
				return mul(num(t, o), num(10 - t, o));
			}),
		},
		{
			id: '531-18',
			title: '91단 곱',
			// 일의자리가 1인 두자리끼리(앞자리 1~9)
			generate: bothWays((rng) =>
				mul(num(int(rng, 1, 9), 1), num(int(rng, 1, 9), 1)),
			),
		},
		{
			id: '531-19',
			title: 'SQ',
			// NOTE: 원장님 표에 설명이 없어 «같은 두자리(0으로 안 끝남)의 제곱»(37 × 37)으로 정함(2026-10-29)
			generate: (rng) => {
				const two = num(int(rng, 1, 9), int(rng, 1, 9));
				return mul(two, two);
			},
		},
	],
};

/** 홈 화면 종목 리스트. 새 종목은 여기에 추가한다. */
export const courses: Course[] = [basic, book531];

export const getCourse = (id: string | undefined) =>
	courses.find((c) => c.id === id);
