import { createGlobalTheme } from '@vanilla-extract/css';

export const vars = createGlobalTheme(':root', {
	color: {
		primary: '#2f6fed',
		correct: '#1f9d55',
		wrong: '#e5484d',
		text: '#1c1c1e',
		background: '#ffffff',
	},
	font: {
		body: "Pretendard, -apple-system, 'Malgun Gothic', sans-serif",
	},
});
