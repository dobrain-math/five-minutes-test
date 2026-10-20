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

	test('경어(~니다) 중심으로 쓰고, ~요 문장은 많아야 하나만 섞는다', () => {
		const cases = [
			make([sec('가', 10), sec('나', 6)]),
			make([sec('가', 10), sec('나', 10)], 400_000),
			make([sec('가', 10), sec('나', 10)], 100_000),
			make([sec('가', 4), sec('나', 3)]),
			make([sec('가', 10), sec('나', 9)]),
		];
		for (const report of cases) {
			const sentences = evaluate(report).split(/(?<=[.!])\s+/);
			const yo = sentences.filter((x) => /요[.!]$/.test(x));
			const formal = sentences.filter((x) => /니다[.!]$/.test(x));
			expect(yo.length).toBeLessThanOrEqual(1);
			expect(formal.length + yo.length).toBe(sentences.length);
		}
	});

	describe('뱃지와 같은 기준(8개 이상 학습 완료 / 3개 이하 연습 필요)', () => {
		test('8개 맞힌 유형도 칭찬하고, 7개는 칭찬하지 않는다', () => {
			const text = evaluate(make([sec('가', 8), sec('나', 7), sec('다', 5)]));
			expect(text).toMatch(/가 연산에서 실력이 돋보입니다/);
			expect(text).not.toMatch(/나[^.]*돋보입니다/);
		});

		test('가장 낮아도 4개 이상이면 연습을 권하지 않는다', () => {
			const text = evaluate(make([sec('가', 9), sec('나', 6), sec('다', 4)]));
			expect(text).not.toContain('연습해 보면');
		});

		test('3개 이하인 유형은 모두 연습을 권한다', () => {
			const text = evaluate(make([sec('가', 9), sec('나', 3), sec('다', 2)]));
			expect(text).toMatch(/나, 다 연산은[^.]*연습해 보면/);
		});

		test('모든 유형이 8개 이상이면 다음 단계를 권한다', () => {
			const text = evaluate(make([sec('가', 8), sec('나', 10)]));
			expect(text).toContain('다음 단계');
			expect(text).not.toContain('돋보입니다');
		});
	});

	test('문제당 평균 시간을 초 단위로 알려 준다', () => {
		// 20문제 · 100초 → 문제당 5초
		const text = evaluate(make([sec('가', 10), sec('나', 10)], 100_000));
		expect(text).toContain('평균 5초');
	});

	test('잘한 유형은 칭찬하고, 못한 유형은 조금 더 연습을 권한다', () => {
		const text = evaluate(
			make([sec('두두덧셈', 10), sec('셋둘뺄셈', 3), sec('두한곱셈', 7)]),
		);
		expect(text).toMatch(/두두덧셈[^.]*돋보입니다/);
		expect(text).toMatch(/셋둘뺄셈[^.]*30%[^.]*연습/);
		expect(text).not.toMatch(/두한곱셈[^.]*돋보입니다/);
	});

	test('모든 유형이 90% 이상이면 약점 대신 다음 단계를 권한다', () => {
		const text = evaluate(make([sec('가', 10), sec('나', 9)]));
		expect(text).not.toContain('더 연습');
		expect(text).toContain('다음 단계');
	});

	test('잘한 유형이 하나도 없으면 칭찬 문장을 쓰지 않고 기초를 권한다', () => {
		const text = evaluate(make([sec('가', 4), sec('나', 3)]));
		expect(text).not.toContain('돋보입니다');
		expect(text).toContain('기초');
	});

	test('정확하지만 느리면 속도 연습을 권한다', () => {
		// 20문제 · 400초 → 문제당 20초
		const text = evaluate(make([sec('가', 10), sec('나', 10)], 400_000));
		expect(text).toContain('속도');
	});

	test('유형 이름이 「연산」으로 끝나면 「연산」을 또 붙이지 않는다', () => {
		const text = evaluate(
			make([
				sec('받아올림이 있는 두자리 더하기 한자리 연산', 10),
				sec('받아내림이 있는 두자리 빼기 한자리 연산', 3),
				sec('0으로 끝나는 두자리 빼기 한자리 연산', 7),
			]),
		);
		expect(text).toContain('더하기 한자리 연산에서 실력이 돋보입니다');
		expect(text).toContain('빼기 한자리 연산은 정답률이 30%');
		expect(text).not.toContain('연산 연산');
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
