import { describe, expect, test } from 'vitest';
import { summarize } from './summarize.ts';

const r = (title: string, correct: number, total = 10) => ({
	title,
	correct,
	total,
});

describe('강점', () => {
	test('다 맞힌 유형이 있으면 그 유형을 칭찬한다', () => {
		expect(summarize([r('두한덧셈', 10), r('두한뺄셈', 7)]).strength).toBe(
			'두한덧셈 유형은 모두 맞혔어요',
		);
	});

	test('다 맞힌 유형이 여럿이면 함께 적고, 셋 이상은 「외 n개」로 줄인다', () => {
		expect(
			summarize([r('가', 10), r('나', 10), r('다', 10), r('라', 3)]).strength,
		).toBe('가, 나 외 1개 유형은 모두 맞혔어요');
	});

	test('다 맞힌 유형이 없으면 정답률이 가장 높은 유형을 적는다', () => {
		expect(summarize([r('가', 8), r('나', 6)]).strength).toBe(
			'가 유형을 가장 잘 풀었어요 (정답률 80%)',
		);
	});

	test('가장 잘한 유형도 절반 미만이면 기초부터 권한다', () => {
		expect(summarize([r('가', 4), r('나', 2)]).strength).toBe(
			'아직 자신 있는 유형이 없어요. 쉬운 유형부터 다시 연습해요',
		);
	});
});

describe('취약점', () => {
	test('정답률이 가장 낮은 유형을 적는다', () => {
		expect(summarize([r('가', 10), r('나', 7), r('다', 4)]).weakness).toBe(
			'다 유형에서 가장 많이 틀렸어요 (정답률 40%)',
		);
	});

	test('가장 낮은 유형도 90% 이상이면 취약점이 없다고 한다', () => {
		expect(summarize([r('가', 10), r('나', 9)]).weakness).toBe(
			'뚜렷한 취약점 없이 고르게 잘 풀었어요',
		);
	});
});

describe('모든 유형 정답률이 같을 때', () => {
	test('모두 다 맞혔으면', () => {
		expect(summarize([r('가', 10), r('나', 10)])).toEqual({
			strength: '모든 유형을 다 맞혔어요',
			weakness: '뚜렷한 취약점 없이 고르게 잘 풀었어요',
		});
	});

	test('같은 정답률이면 유형 이름을 나열하지 않는다', () => {
		expect(summarize([r('가', 6), r('나', 6)])).toEqual({
			strength: '모든 유형의 정답률이 60%로 비슷해요',
			weakness: '모든 유형을 골고루 더 연습해요',
		});
	});
});
