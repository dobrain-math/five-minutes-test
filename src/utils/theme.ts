export type Theme = 'light' | 'dark';

/** localStorage 키. index.html 의 깜빡임 방지 스크립트도 같은 키를 읽는다. */
export const THEME_KEY = 'theme';

/** 직접 고른 값(stored)이 있으면 그것을, 없으면 기기 설정을 따른다. */
export function resolveTheme(
	stored: string | null,
	systemDark: boolean,
): Theme {
	if (stored === 'light' || stored === 'dark') return stored;
	return systemDark ? 'dark' : 'light';
}

export const toggleTheme = (theme: Theme): Theme =>
	theme === 'dark' ? 'light' : 'dark';
