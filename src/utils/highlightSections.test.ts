import { describe, expect, test } from 'vitest';
import type { SectionScore } from '@/@types/test';
import { highlightSections } from './highlightSections.ts';

const sec = (title: string, correct: number, total = 10): SectionScore => ({
	title,
	correct,
	total,
});

describe('highlightSections', () => {
	test('정답률이 가장 높은 유형은 strong, 가장 낮은 유형은 weak', () => {
		expect(
			highlightSections([sec('가', 9), sec('나', 4), sec('다', 7)]),
		).toEqual(['strong', 'weak', null]);
	});

	test('맞힌 개수가 아니라 정답률로 비교한다', () => {
		// 8/20 = 40% 이 5/10 = 50% 보다 약하다
		expect(highlightSections([sec('가', 8, 20), sec('나', 5)])).toEqual([
			'weak',
			'strong',
		]);
	});

	test('같은 최고·최저가 여럿이면 모두 표시한다', () => {
		expect(
			highlightSections([
				sec('가', 10),
				sec('나', 3),
				sec('다', 10),
				sec('라', 3),
			]),
		).toEqual(['strong', 'weak', 'strong', 'weak']);
	});

	test('모든 유형 정답률이 같으면 아무것도 표시하지 않는다', () => {
		expect(highlightSections([sec('가', 10), sec('나', 10)])).toEqual([
			null,
			null,
		]);
	});

	test('문제 수가 0인 유형은 표시하지 않는다', () => {
		expect(
			highlightSections([sec('가', 9), sec('나', 0, 0), sec('다', 2)]),
		).toEqual(['strong', null, 'weak']);
	});
});
