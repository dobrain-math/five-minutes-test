import { style } from '@vanilla-extract/css';

/** 잘못된 링크 안내: 버튼 없이 글만 화면 한가운데 */
export const brokenPage = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	minHeight: '100dvh',
	padding: '0 24px',
});

export const brokenText = style({
	maxWidth: 360,
	textAlign: 'center',
	wordBreak: 'keep-all',
});
