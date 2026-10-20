import { describe, expect, test } from 'vitest';
import { resolveTheme, toggleTheme } from './theme.ts';

describe('resolveTheme', () => {
	test('직접 고른 값이 있으면 기기 설정보다 먼저 따른다', () => {
		expect(resolveTheme('light', true)).toBe('light');
		expect(resolveTheme('dark', false)).toBe('dark');
	});

	test('고른 값이 없으면 기기 설정을 따른다', () => {
		expect(resolveTheme(null, true)).toBe('dark');
		expect(resolveTheme(null, false)).toBe('light');
	});

	test('알 수 없는 값은 없는 것으로 본다', () => {
		expect(resolveTheme('blue', true)).toBe('dark');
	});
});

describe('toggleTheme', () => {
	test('라이트 ↔ 다크로 바꾼다', () => {
		expect(toggleTheme('light')).toBe('dark');
		expect(toggleTheme('dark')).toBe('light');
	});
});
