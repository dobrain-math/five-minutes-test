import { describe, expect, test } from 'vitest';
import {
	formatCardDate,
	formatMonthDay,
	formatTestDate,
} from './formatDate.ts';

// 한국 시각 2026-10-05(월) 15:30 = UTC 06:30
const at = Date.UTC(2026, 9, 5, 6, 30);

describe('formatTestDate', () => {
	test('연·월·일을 한글로 적는다(앞자리 0 없이)', () => {
		expect(formatTestDate(at)).toBe('2026년 10월 5일');
	});
});

describe('formatMonthDay', () => {
	test('월·일만 적는다', () => {
		expect(formatMonthDay(at)).toBe('10월 5일');
	});
});

describe('formatCardDate', () => {
	test('월·일 뒤에 요일을 붙인다', () => {
		expect(formatCardDate(at)).toBe('10월 5일(월)');
	});

	test('서버(UTC)에서 돌아도 한국 날짜로 적는다 — 한국 0시 30분은 이미 다음 날', () => {
		// 한국 2026-10-06(화) 00:30 = UTC 10-05 15:30
		expect(formatCardDate(Date.UTC(2026, 9, 5, 15, 30))).toBe('10월 6일(화)');
	});
});
