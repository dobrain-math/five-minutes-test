import { useState } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import {
	THEME_KEY,
	type Theme,
	resolveTheme,
	toggleTheme,
} from '@/utils/theme.ts';
import * as s from './ThemeToggle.css.ts';

function currentTheme(): Theme {
	const set = document.documentElement.dataset.theme ?? null;
	return resolveTheme(
		set,
		window.matchMedia('(prefers-color-scheme: dark)').matches,
	);
}

/** 라이트·다크를 바꾸는 작은 원형 버튼. 고른 값은 다음 방문에도 남는다. */
export default function ThemeToggle() {
	const [theme, setTheme] = useState(currentTheme);
	const isDark = theme === 'dark';

	const handleClick = () => {
		const next = toggleTheme(theme);
		document.documentElement.dataset.theme = next;
		try {
			localStorage.setItem(THEME_KEY, next);
		} catch {
			// 사생활 보호 모드 등에서 저장이 막혀도 지금 화면은 바뀐다.
		}
		setTheme(next);
	};

	return (
		<button
			type="button"
			className={s.button}
			onClick={handleClick}
			aria-label={isDark ? '라이트 모드로 바꾸기' : '다크 모드로 바꾸기'}
			title={isDark ? '라이트 모드' : '다크 모드'}
		>
			{/* NOTE: Heroicons 기본 굵기(1.5)는 18px 에서 흐려 보여 Semibold 이상(2.25)으로 올린다. */}
			{isDark ? (
				<SunIcon className={s.icon} strokeWidth={2.25} aria-hidden />
			) : (
				<MoonIcon className={s.icon} strokeWidth={2.25} aria-hidden />
			)}
		</button>
	);
}
