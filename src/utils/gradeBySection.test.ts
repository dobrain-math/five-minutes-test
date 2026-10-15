import { expect, test } from 'vitest';
import { gradeBySection } from './gradeBySection.ts';

test('목차별로 맞힌 개수를 센다', () => {
	const questions = [
		{ id: 'q1', sectionId: 'a', answer: '3' },
		{ id: 'q2', sectionId: 'a', answer: '5' },
		{ id: 'q3', sectionId: 'b', answer: '7' },
	];
	expect(gradeBySection(questions, { q1: '3', q2: '4', q3: ' 7 ' })).toEqual([
		{ sectionId: 'a', correct: 1, total: 2 },
		{ sectionId: 'b', correct: 1, total: 1 },
	]);
});
