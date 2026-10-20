import { describe, expect, test } from 'vitest';
import type { Course, Question } from '@/@types/test';
import { buildReport } from './buildReport.ts';

const course: Course = {
	id: 'demo',
	title: '데모',
	sections: [
		{
			id: 'a',
			title: '덧셈',
			generate: () => ({ left: 1, op: '+', right: 1 }),
		},
		{
			id: 'b',
			title: '뺄셈',
			generate: () => ({ left: 1, op: '-', right: 1 }),
		},
	],
};

// 출제 순서는 섞여 있다: 뺄셈이 먼저 나온다.
const questions: Question[] = [
	{ id: 'q1', sectionId: 'b', text: '9 - 3', answer: '6' },
	{ id: 'q2', sectionId: 'a', text: '4 + 8', answer: '12' },
	{ id: 'q3', sectionId: 'a', text: '5 + 7', answer: '12' },
	{ id: 'q4', sectionId: 'b', text: '15 - 8', answer: '7' },
];

const session = {
	studentName: '김하늘',
	studentAge: '초2',
	questions,
	answers: { q1: '6', q2: ' 12 ', q3: '11' },
	startedAt: 1_000,
	finishedAt: 61_000,
};

describe('buildReport', () => {
	test('이름·나이·종목·점수·걸린 시간을 담는다', () => {
		const r = buildReport(course, session);
		expect(r).toMatchObject({
			studentName: '김하늘',
			studentAge: '초2',
			courseTitle: '데모',
			correct: 2,
			total: 4,
			durationMs: 60_000,
		});
	});

	test('테스트를 마친 시각을 담는다(공유 메시지의 날짜)', () => {
		expect(buildReport(course, session).finishedAt).toBe(session.finishedAt);
	});

	test('유형 점수는 출제 순서가 아니라 목차 순서다', () => {
		expect(buildReport(course, session).sections).toEqual([
			{ title: '덧셈', correct: 1, total: 2 },
			{ title: '뺄셈', correct: 1, total: 2 },
		]);
	});

	test('틀린 문제는 출제 순서대로, 빈칸은 빈 문자열로 적는다', () => {
		expect(buildReport(course, session).wrong).toEqual([
			{ text: '5 + 7', mine: '11', answer: '12', sectionTitle: '덧셈' },
			{ text: '15 - 8', mine: '', answer: '7', sectionTitle: '뺄셈' },
		]);
	});
});
