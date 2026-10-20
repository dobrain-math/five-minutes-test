import { describe, expect, test } from 'vitest';
import { formatMonthDay, formatTestDate } from './formatDate.ts';

const at = new Date(2026, 9, 5, 15, 30).getTime();

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
