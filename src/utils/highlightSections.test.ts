import { describe, expect, test } from 'vitest';
import type { SectionScore } from '@/@types/test';
import { highlightSections } from './highlightSections.ts';

const sec = (title: string, correct: number, total = 10): SectionScore => ({
	title,
	correct,
	total,
});

describe('highlightSections', () => {
	test('10문제 중 8개 이상 맞힌 유형은 모두 strong', () => {
		expect(
			highlightSections([sec('가', 8), sec('나', 10), sec('다', 9)]),
		).toEqual(['strong', 'strong', 'strong']);
	});

	test('10문제 중 3개 이하 맞힌 유형은 모두 weak', () => {
		expect(
			highlightSections([sec('가', 3), sec('나', 0), sec('다', 1)]),
		).toEqual(['weak', 'weak', 'weak']);
	});

	test('4~7개는 최고·최저여도 표시하지 않는다', () => {
		expect(
			highlightSections([sec('가', 7), sec('나', 4), sec('다', 5)]),
		).toEqual([null, null, null]);
	});

	test('경계값: 8개는 strong·7개는 없음, 3개는 weak·4개는 없음', () => {
		expect(
			highlightSections([
				sec('가', 8),
				sec('나', 7),
				sec('다', 4),
				sec('라', 3),
			]),
		).toEqual(['strong', null, null, 'weak']);
	});

	test('문제 수가 10이 아니면 정답률(80%·30%)로 판단한다', () => {
		// 16/20 = 80%, 6/20 = 30%, 15/20 = 75%
		expect(
			highlightSections([
				sec('가', 16, 20),
				sec('나', 6, 20),
				sec('다', 15, 20),
			]),
		).toEqual(['strong', 'weak', null]);
	});

	test('문제 수가 0인 유형은 표시하지 않는다', () => {
		expect(highlightSections([sec('가', 9), sec('나', 0, 0)])).toEqual([
			'strong',
			null,
		]);
	});
});
