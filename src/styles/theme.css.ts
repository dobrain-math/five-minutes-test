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

// 글자 — 토스 타이포 스케일(t1 가장 큼 → t8 가장 작음). 실제 조합은 typography.css.ts 의 text 를 쓴다.
const fontVars = createGlobalTheme(':root', {
	family:
		"'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
	size: {
		t1: '30px',
		t2: '26px',
		t3: '22px',
		t4: '20px',
		t5: '17px',
		t6: '15px',
		t7: '13px',
		t8: '12px',
	},
	weight: {
		regular: '400',
		medium: '500',
		semibold: '600',
		bold: '700',
	},
	lineHeight: {
		tight: '1.3',
		normal: '1.5',
	},
	letterSpacing: {
		tight: '-0.02em',
		normal: '0',
	},
});

// 모서리 — 바깥 카드일수록 크게, 안쪽 요소일수록 작게.
const radiusVars = createGlobalTheme(':root', {
	xs: '6px', // 번호 뱃지
	sm: '10px', // 답 입력칸, 카드 안쪽 목록
	md: '12px', // 버튼, 이름 입력칸, 안내 상자
	lg: '14px', // 문제 카드, 종목 카드
	xl: '16px', // 큰 카드(리포트 섹션)
	full: '9999px', // 알약 모양
});

export const vars = {
	color: colorVars,
	shadow: shadowVars,
	font: fontVars,
	radius: radiusVars,
};

/** 모바일 우선 브레이크포인트 (min-width) */
export const breakpoints = {
	tablet: 'screen and (min-width: 640px)',
	laptop: 'screen and (min-width: 960px)',
	desktop: 'screen and (min-width: 1280px)',
} as const;

/** 마우스가 있는 기기에서만 hover 효과 (터치 기기에서 hover 가 눌린 채 남는 것 방지) */
export const canHover = '(hover: hover) and (pointer: fine)';
