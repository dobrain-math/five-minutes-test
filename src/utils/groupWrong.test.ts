import { describe, expect, test } from 'vitest';
import type { SectionScore, WrongAnswer } from '@/@types/test';
import { groupWrong } from './groupWrong.ts';

const sections: SectionScore[] = [
	{ title: '가', correct: 20, total: 24 },
	{ title: '나', correct: 24, total: 24 },
	{ title: '다', correct: 10, total: 24 },
];
const w = (text: string, sectionTitle: string): WrongAnswer => ({
	text,
	mine: '1',
	answer: '2',
	sectionTitle,
});

describe('groupWrong', () => {
	test('유형 목차 순서로 묶고, 묶음 안은 출제 순서 그대로', () => {
		const groups = groupWrong(sections, [
			w('a', '다'),
			w('b', '가'),
			w('c', '다'),
		]);
		expect(groups).toEqual([
			{ number: 1, title: '가', items: [w('b', '가')] },
			{ number: 3, title: '다', items: [w('a', '다'), w('c', '다')] },
		]);
	});

	test('틀린 문제가 없는 유형은 뺀다', () => {
		expect(groupWrong(sections, [w('a', '나')]).map((g) => g.title)).toEqual([
			'나',
		]);
	});

	test('목차에 없는 유형 이름(깨진 옛 링크)은 맨 뒤 번호 없는 묶음으로', () => {
		expect(groupWrong(sections, [w('a', '?'), w('b', '가')])).toEqual([
			{ number: 1, title: '가', items: [w('b', '가')] },
			{ number: null, title: '?', items: [w('a', '?')] },
		]);
	});
});
