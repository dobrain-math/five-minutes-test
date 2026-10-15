import { assignVars, createGlobalTheme, createThemeContract, globalStyle } from '@vanilla-extract/css';
import { darkColors, lightColors } from '@/styles/palette.ts';

const colorVars = createThemeContract(lightColors);

createGlobalTheme(':root', colorVars, lightColors);

createGlobalTheme(':root[data-theme="dark"]', colorVars, darkColors);

globalStyle(':root:not([data-theme="light"])', {
	'@media': {
		'(prefers-color-scheme: dark)': {
			vars: assignVars(colorVars, darkColors),
		},
	},
});

const fontVars = createGlobalTheme(':root', {
	body: "Pretendard, -apple-system, 'Malgun Gothic', sans-serif",
});

export const vars = {
	color: colorVars,
	font: fontVars,
};
