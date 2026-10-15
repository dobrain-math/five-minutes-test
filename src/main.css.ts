import { globalStyle } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.css.ts';

globalStyle('*, *::before, *::after', {
	margin: 0,
	padding: 0,
	boxSizing: 'border-box',
});

globalStyle('html, body', {
	height: '100%',
	fontFamily: vars.font.body,
	color: vars.color.text,
	background: vars.color.background,
});
