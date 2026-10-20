import { describe, expect, test } from 'vitest';
import type { Report } from '@/@types/test';
import { decodeReport, encodeReport, shareUrl } from './shareLink.ts';

const report: Report = {
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
		{ text: '304 - 87', mine: '227', answer: '217', sectionTitle: '셋둘뺄셈' },
		{ text: '512 - 96', mine: '', answer: '416', sectionTitle: '셋둘뺄셈' },
		{ text: '700 - 18', mine: '692', answer: '682', sectionTitle: '셋둘뺄셈' },
	],
};

describe('encodeReport / decodeReport', () => {
	test('한글 이름·빈 답까지 그대로 되살린다', () => {
		expect(decodeReport(encodeReport(report))).toEqual(report);
	});

	test('테스트 본 시각까지 되살린다', () => {
		const dated = { ...report, finishedAt: 1_792_481_400_000 };
		expect(decodeReport(encodeReport(dated))).toEqual(dated);
	});

	test('주소에 그대로 붙일 수 있는 글자만 쓴다', () => {
		expect(encodeReport(report)).toMatch(/^[A-Za-z0-9_-]+$/);
	});

	test('80문제를 모두 틀려도 메신저에 붙일 만한 길이(3,000자 이하)다', () => {
		const titles = ['두 자리 + 한 자리 받아올림 O', '□0 - 한 자리'];
		const all: Report = {
			...report,
			correct: 0,
			total: 80,
			sections: titles.map((title) => ({ title, correct: 0, total: 40 })),
			wrong: Array.from({ length: 80 }, (_, i) => ({
				text: '999 - 99',
				mine: '1000',
				answer: '900',
				sectionTitle: titles[i % 2],
			})),
		};
		expect(encodeReport(all).length).toBeLessThanOrEqual(3000);
	});

	test('다 맞혀 틀린 문제가 없어도 되살린다', () => {
		const perfect = { ...report, correct: 20, wrong: [] };
		perfect.sections = perfect.sections.map((sec) => ({ ...sec, correct: 10 }));
		expect(decodeReport(encodeReport(perfect))).toEqual(perfect);
	});

	test('깨진 코드는 null', () => {
		expect(decodeReport('%%%')).toBeNull();
		expect(decodeReport('')).toBeNull();
	});

	test('읽히긴 해도 리포트 모양이 아니면 null', () => {
		// "{"x":1}" 를 base64url 로 적은 것
		expect(decodeReport('eyJ4IjoxfQ')).toBeNull();
	});
});

describe('shareUrl', () => {
	test('주어진 주소 뒤에 /share?r=코드 를 붙인다', () => {
		expect(shareUrl('https://five.app', 'abc_-1')).toBe(
			'https://five.app/share?r=abc_-1',
		);
	});
});
