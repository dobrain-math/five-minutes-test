import {
	assignVars,
	createGlobalTheme,
	createThemeContract,
	globalStyle,
} from '@vanilla-extract/css';
import { darkColors, lightColors } from '@/styles/palette.ts';

const colorVars = createThemeContract(lightColors);

// 토스처럼 「있는 듯 없는 듯」 아주 옅게. 두 겹(가까운 그림자 + 넓게 퍼지는 그림자)으로 깊이를 낸다.
const lightShadows = {
	xs: '0 1px 2px rgba(0, 27, 55, 0.04)',
	sm: '0 1px 3px rgba(0, 27, 55, 0.04), 0 2px 8px rgba(0, 27, 55, 0.04)',
	md: '0 2px 6px rgba(0, 27, 55, 0.04), 0 8px 24px rgba(0, 27, 55, 0.06)',
	lg: '0 4px 12px rgba(0, 27, 55, 0.05), 0 16px 40px rgba(0, 27, 55, 0.08)',
};

// 어두운 바탕에서는 옅은 그림자가 안 보이므로 검정 농도를 높인다.
const darkShadows: typeof lightShadows = {
	xs: '0 1px 2px rgba(0, 0, 0, 0.2)',
	sm: '0 1px 3px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.16)',
	md: '0 2px 6px rgba(0, 0, 0, 0.24), 0 8px 24px rgba(0, 0, 0, 0.2)',
	lg: '0 4px 12px rgba(0, 0, 0, 0.28), 0 16px 40px rgba(0, 0, 0, 0.24)',
};

const shadowVars = createThemeContract(lightShadows);

createGlobalTheme(':root', colorVars, lightColors);
createGlobalTheme(':root', shadowVars, lightShadows);

createGlobalTheme(':root[data-theme="dark"]', colorVars, darkColors);
createGlobalTheme(':root[data-theme="dark"]', shadowVars, darkShadows);

globalStyle(':root:not([data-theme="light"])', {
	'@media': {
		'(prefers-color-scheme: dark)': {
			vars: {
				...assignVars(colorVars, darkColors),
				...assignVars(shadowVars, darkShadows),
			},
		},
	},
});

const fontVars = createGlobalTheme(':root', {
	body: "Pretendard, -apple-system, 'Malgun Gothic', sans-serif",
});

export const vars = {
	color: colorVars,
	shadow: shadowVars,
	font: fontVars,
};

/** 모바일 우선 브레이크포인트 (min-width) */
export const breakpoints = {
	tablet: 'screen and (min-width: 640px)',
	laptop: 'screen and (min-width: 960px)',
	desktop: 'screen and (min-width: 1280px)',
} as const;

/** 마우스가 있는 기기에서만 hover 효과 (터치 기기에서 hover 가 눌린 채 남는 것 방지) */
export const canHover = '(hover: hover) and (pointer: fine)';
