import { globalStyle } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.css.ts';

globalStyle('*, *::before, *::after', {
	margin: 0,
	padding: 0,
	boxSizing: 'border-box',
});

globalStyle('html, body', {
	height: '100%',
	fontFamily: vars.font.family,
	fontSize: vars.font.size.t6,
	lineHeight: vars.font.lineHeight.normal,
	color: vars.color.grey900,
	background: vars.color.grey50,
	WebkitTapHighlightColor: 'transparent',
	WebkitFontSmoothing: 'antialiased',
	wordBreak: 'keep-all',
});

// 폼 요소는 브라우저 기본 글꼴 대신 Pretendard 를 그대로 물려받는다.
globalStyle('button, input, select, textarea', {
	font: 'inherit',
	color: 'inherit',
});
