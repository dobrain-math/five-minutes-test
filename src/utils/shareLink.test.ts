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
	// NOTE: 짧은 코드는 걸린 시간을 초 단위, 실시일을 분 단위로 싣는다.
	durationMs: 245_000,
	finishedAt: 1_792_481_400_000,
	sections: titles.map((title, i) => ({
		title,
		correct: corrects[i],
		total: 10,
	})),
	// 흔한 경우: 18문제 틀림. 틀린 답은 대개 정답과 1·10 차이(받아올림 실수)
	wrong: Array.from({ length: 18 }, (_, i) => {
		const answer = 300 + i * 7 - (80 + i);
		return {
			text: `${300 + i * 7} − ${80 + i}`,
			mine: i % 5 === 0 ? '' : String(answer + (i % 2 ? 1 : -10)),
			answer: String(answer),
			sectionTitle: titles[(i * 3) % 8],
		};
	}),
};

// v2(2026-10-20 배포) 코드 — 기본연습, 김하늘·초2, 1문제(4 + 8 → 11) 틀림
const V2_CODE =
	'2BWJhc2ljCeq5gO2VmOuKmATstIgyg_sO-LDc1gYICgoICgAKAAoACgAKAAoACgEHBAgN';

describe('encodeReport / decodeReport', () => {
	test('한글 이름·빈 답·실시일까지 그대로 되살린다', () => {
		expect(decodeReport(encodeReport(report))).toEqual(report);
	});

	test('주소에 그대로 붙일 수 있는 글자만 쓴다(메신저가 링크를 끊는 + $ 등 없음)', () => {
		expect(encodeReport(report)).toMatch(/^[A-Za-z0-9_-]+$/);
	});

	test('18문제 틀린 흔한 결과의 코드가 170자 이하다(v2 는 201자)', () => {
		expect(encodeReport(report).length).toBeLessThanOrEqual(170);
	});

	test('목록에 없는 나이 글자도 되살린다', () => {
		const odd = { ...report, studentAge: '초2 (빠른)' };
		expect(decodeReport(encodeReport(odd))).toEqual(odd);
	});

	test('먼저 배포한 v2 짧은 링크도 그대로 열린다', () => {
		const r = decodeReport(V2_CODE);
		expect(r).toMatchObject({
			studentName: '김하늘',
			studentAge: '초2',
			courseId: 'basic',
			durationMs: 245_123,
			finishedAt: 1_792_481_400_000,
			correct: 18,
		});
		expect(r?.wrong).toEqual([
			{
				text: '4 + 8',
				mine: '11',
				answer: '12',
				// 이 코드를 만들 때 유형 이름을 모두 빈칸으로 넣어 마지막(8번째) 유형으로 적혔다
				sectionTitle: getCourse('basic')!.sections[7].title,
			},
		]);
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

// v3(2026-10-20 ~ 10-22 배포) 코드 — 기본연습 80문제, 이바다·7세, 3문제 틀림
const V3_CODE =
	'3BWJhc2ljCeydtOuwlOuLpAOtAoK0nw4ICgkJCQoKCgoKAwEECAMUDwgAAAIDBA';

describe('v4 — 유형별 24문제(2026-10-22)', () => {
	const basic = getCourse('basic')!;

	test('먼저 배포한 v3 짧은 링크도 그대로 열린다', () => {
		const r = decodeReport(V3_CODE)!;
		expect(r).toMatchObject({
			studentName: '이바다',
			studentAge: '7세',
			courseTitle: basic.title,
			correct: 77,
			total: 80,
			durationMs: 301_000,
		});
		expect(r.part).toBeUndefined();
		expect(r.sections.map((sec) => sec.correct)).toEqual([
			9, 9, 9, 10, 10, 10, 10, 10,
		]);
		expect(r.sections[0].durationMs).toBeUndefined();
		expect(r.wrong[1]).toEqual({
			text: '15 − 8',
			mine: '',
			answer: '7',
			sectionTitle: basic.sections[4].title,
		});
	});

	const all: Report = {
		...report,
		total: 192,
		correct: 150,
		sections: titles.map((title, i) => ({
			title,
			correct: [24, 20, 19, 7, 22, 18, 21, 19][i],
			total: 24,
			durationMs: (60 + i * 7) * 1000,
		})),
	};

	test('새 코드는 4 로 시작한다', () => {
		expect(encodeReport(all)[0]).toBe('4');
	});

	test('전체 풀기: 유형마다 걸린 시간까지 되살린다', () => {
		expect(decodeReport(encodeReport(all))).toEqual(all);
	});

	test('한 유형 풀이: 유형 번호와 그 유형 하나만 되살린다', () => {
		const single: Report = {
			...report,
			part: 3,
			correct: 17,
			total: 24,
			durationMs: 95_000,
			sections: [
				{ title: titles[3], correct: 17, total: 24, durationMs: 95_000 },
			],
			wrong: report.wrong
				.slice(0, 7)
				.map((w) => ({ ...w, sectionTitle: titles[3] })),
		};
		expect(decodeReport(encodeReport(single))).toEqual(single);
	});

	test('192문제 중 18문제 틀린 흔한 결과의 코드가 200자 이하다', () => {
		expect(encodeReport(all).length).toBeLessThanOrEqual(200);
	});

	test('걸린 시간은 화면처럼 초를 버림해 싣는다(받은 쪽이 1초 길게 보이지 않게)', () => {
		const odd: Report = {
			...all,
			durationMs: 61_900,
			sections: all.sections.map((sec) => ({ ...sec, durationMs: 17_600 })),
		};
		const r = decodeReport(encodeReport(odd))!;
		expect(r.durationMs).toBe(61_000);
		expect(r.sections[0].durationMs).toBe(17_000);
	});
});

describe('shareUrl', () => {
	test('주어진 주소 뒤에 /s/코드 를 붙인다(예전 /share?r= 보다 짧게)', () => {
		expect(shareUrl('https://five.app', 'abc_-1')).toBe(
			'https://five.app/s/abc_-1',
		);
	});
});
