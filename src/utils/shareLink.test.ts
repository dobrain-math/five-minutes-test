import { describe, expect, test } from 'vitest';
import type { Report } from '@/@types/test';
import { getCourse } from '@/data/courses.ts';
import { decodeReport, encodeReport, shareUrl } from './shareLink.ts';

const toBase64Url = (text: string) =>
	btoa(String.fromCharCode(...new TextEncoder().encode(text)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

// 실제 종목(53-1권)으로 만든 리포트. 짧은 코드는 유형 이름을 싣지 않고 종목에서 되찾는다.
const course = getCourse('53-1')!;
const titles = course.sections.map((sec) => sec.title);
const corrects = [10, 7, 9, 3, 8, 10, 6, 9];

const report: Report = {
	studentName: '김하늘',
	studentAge: '초2',
	courseId: '53-1',
	courseTitle: course.title,
	correct: corrects.reduce((a, b) => a + b, 0),
	total: 80,
	durationMs: 245_123,
	finishedAt: 1_792_481_400_000,
	sections: titles.map((title, i) => ({
		title,
		correct: corrects[i],
		total: 10,
	})),
	// 흔한 경우: 18문제 틀림
	wrong: Array.from({ length: 18 }, (_, i) => ({
		text: `${300 + i * 7} − ${80 + i}`,
		mine: i % 5 === 0 ? '' : String(200 + i),
		answer: String(300 + i * 7 - (80 + i)),
		sectionTitle: titles[(i * 3) % 8],
	})),
};

describe('encodeReport / decodeReport', () => {
	test('한글 이름·빈 답·실시일까지 그대로 되살린다', () => {
		expect(decodeReport(encodeReport(report))).toEqual(report);
	});

	test('주소에 그대로 붙일 수 있는 글자만 쓴다(메신저가 링크를 끊는 + $ 등 없음)', () => {
		expect(encodeReport(report)).toMatch(/^[A-Za-z0-9_-]+$/);
	});

	test('18문제 틀린 흔한 결과의 코드가 250자 이하다', () => {
		expect(encodeReport(report).length).toBeLessThanOrEqual(250);
	});

	test('80문제를 모두 틀려도 900자 이하다', () => {
		const all: Report = {
			...report,
			correct: 0,
			sections: report.sections.map((sec) => ({ ...sec, correct: 0 })),
			wrong: Array.from({ length: 80 }, (_, i) => ({
				text: `${100 + i * 11} − ${10 + i}`,
				mine: String(i * 13),
				answer: String(100 + i * 11 - (10 + i)),
				sectionTitle: titles[i % 8],
			})),
		};
		const code = encodeReport(all);
		expect(code.length).toBeLessThanOrEqual(900);
		expect(decodeReport(code)).toEqual(all);
	});

	test('식 모양이 예상과 달라도, 답이 0 으로 시작해도 그대로 되살린다', () => {
		const odd: Report = {
			...report,
			wrong: [
				{ text: '□ + 3 = 7', mine: '07', answer: '4', sectionTitle: titles[0] },
				{ text: '12 × 3', mine: '36', answer: '35', sectionTitle: titles[7] },
			],
		};
		expect(decodeReport(encodeReport(odd))).toEqual(odd);
	});

	test('다 맞혀 틀린 문제가 없어도 되살린다', () => {
		const perfect: Report = {
			...report,
			correct: 80,
			sections: report.sections.map((sec) => ({ ...sec, correct: 10 })),
			wrong: [],
		};
		expect(decodeReport(encodeReport(perfect))).toEqual(perfect);
	});

	test('예전(v1) 긴 링크도 그대로 열린다', () => {
		const v1 = {
			v: 1,
			n: '김하늘',
			a: '초2',
			c: '53-1권',
			t: 245_000,
			s: [
				['두한덧셈', 10, 10],
				['셋둘뺄셈', 7, 10],
			],
			w: '304 - 87|227|217|1~512 - 96||416|1',
		};
		expect(decodeReport(toBase64Url(JSON.stringify(v1)))).toEqual({
			studentName: '김하늘',
			studentAge: '초2',
			courseTitle: '53-1권',
			correct: 17,
			total: 20,
			durationMs: 245_000,
			sections: [
				{ title: '두한덧셈', correct: 10, total: 10 },
				{ title: '셋둘뺄셈', correct: 7, total: 10 },
			],
			wrong: [
				{
					text: '304 - 87',
					mine: '227',
					answer: '217',
					sectionTitle: '셋둘뺄셈',
				},
				{ text: '512 - 96', mine: '', answer: '416', sectionTitle: '셋둘뺄셈' },
			],
		});
	});

	test('깨진 코드는 null', () => {
		expect(decodeReport('%%%')).toBeNull();
		expect(decodeReport('')).toBeNull();
		expect(decodeReport('2abc')).toBeNull();
	});

	test('읽히긴 해도 리포트 모양이 아니면 null', () => {
		// "{"x":1}" 를 base64url 로 적은 것
		expect(decodeReport('eyJ4IjoxfQ')).toBeNull();
	});
});

describe('shareUrl', () => {
	test('주어진 주소 뒤에 /s/코드 를 붙인다(예전 /share?r= 보다 짧게)', () => {
		expect(shareUrl('https://five.app', 'abc_-1')).toBe(
			'https://five.app/s/abc_-1',
		);
	});
});
