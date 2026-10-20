import { describe, expect, test } from 'vitest';
import type { Report, SectionScore } from '@/@types/test';
import { evaluate } from './evaluate.ts';

const sec = (title: string, correct: number, total = 10): SectionScore => ({
	title,
	correct,
	total,
});

const make = (sections: SectionScore[], durationMs = 400_000): Report => ({
	studentName: '김하늘',
	studentAge: '초2',
	courseTitle: '53-1권',
	correct: sections.reduce((s, x) => s + x.correct, 0),
	total: sections.reduce((s, x) => s + x.total, 0),
	durationMs,
	sections,
	wrong: [],
});

describe('evaluate', () => {
	test('이름·맞힌 수·정답률로 시작한다', () => {
		const text = evaluate(make([sec('가', 10), sec('나', 6)]));
		expect(text).toContain('김하늘 학생은');
		expect(text).toContain('20문제 중 16문제');
		expect(text).toContain('정답률 80%');
	});

	test('문제당 평균 시간을 초 단위로 알려 준다', () => {
		// 20문제 · 100초 → 문제당 5초
		const text = evaluate(make([sec('가', 10), sec('나', 10)], 100_000));
		expect(text).toContain('문제당 평균 5초');
	});

	test('잘한 유형은 두각, 못한 유형은 집중 학습을 권한다', () => {
		const text = evaluate(
			make([sec('두두덧셈', 10), sec('셋둘뺄셈', 4), sec('두한곱셈', 8)]),
		);
		expect(text).toMatch(/두두덧셈[^.]*두각/);
		expect(text).toMatch(/셋둘뺄셈[^.]*40%[^.]*집중/);
		expect(text).not.toMatch(/두한곱셈[^.]*두각/);
	});

	test('모든 유형이 90% 이상이면 약점 대신 다음 단계를 권한다', () => {
		const text = evaluate(make([sec('가', 10), sec('나', 9)]));
		expect(text).not.toContain('집중');
		expect(text).toContain('다음 단계');
	});

	test('잘한 유형이 하나도 없으면 두각 문장을 쓰지 않고 기초를 권한다', () => {
		const text = evaluate(make([sec('가', 4), sec('나', 3)]));
		expect(text).not.toContain('두각');
		expect(text).toContain('기초');
	});

	test('정확하지만 느리면 속도 연습을 권한다', () => {
		// 20문제 · 400초 → 문제당 20초
		const text = evaluate(make([sec('가', 10), sec('나', 10)], 400_000));
		expect(text).toContain('속도');
	});

	test('유형 이름이 길고 많아도 350자를 넘지 않는다', () => {
		const long = (n: number, c: number) =>
			sec(`두 자리 + 한 자리 받아올림 O ${n}`, c);
		const text = evaluate(
			make([
				long(1, 10),
				long(2, 10),
				long(3, 10),
				long(4, 2),
				long(5, 2),
				long(6, 2),
			]),
		);
		expect(text.length).toBeLessThanOrEqual(350);
	});
});
