import { style } from '@vanilla-extract/css';
import { breakpoints, vars } from '@/styles/theme.css.ts';

export const header = style({ marginBottom: 24 });

export const stats = style({
	display: 'grid',
	gridTemplateColumns: '1fr 1fr',
	gap: 10,
	marginBottom: 16,
	'@media': {
		[breakpoints.tablet]: { gap: 12 },
	},
});

export const statLabel = style({
	fontSize: 14,
	fontWeight: 600,
	color: vars.color.grey500,
});

export const statValue = style({
	marginTop: 6,
	fontSize: 30,
	fontWeight: 700,
	letterSpacing: '-0.02em',
	color: vars.color.grey900,
	fontVariantNumeric: 'tabular-nums',
});

export const statUnit = style({
	marginLeft: 4,
	fontSize: 17,
	fontWeight: 600,
	color: vars.color.grey400,
});

export const block = style({ marginBottom: 16 });

export const blockTitle = style({
	marginBottom: 14,
	fontSize: 18,
	fontWeight: 700,
	color: vars.color.grey900,
});

export const legend = style({
	display: 'flex',
	gap: 16,
	marginBottom: 10,
	fontSize: 13,
	color: vars.color.grey600,
});

export const legendDot = style({
	display: 'inline-block',
	width: 10,
	height: 10,
	marginRight: 6,
	borderRadius: 3,
	verticalAlign: 'middle',
});

export const wrongList = style({
	display: 'grid',
	gridTemplateColumns: '1fr',
	gap: 8,
	listStyle: 'none',
	'@media': {
		[breakpoints.tablet]: { gridTemplateColumns: 'repeat(2, 1fr)' },
	},
});

export const wrongItem = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: 12,
	padding: '12px 16px',
	borderRadius: 14,
	background: vars.color.red50,
});

export const wrongExpr = style({
	fontSize: 20,
	fontWeight: 600,
	color: vars.color.grey900,
	fontVariantNumeric: 'tabular-nums',
});

export const wrongSection = style({
	marginTop: 2,
	fontSize: 12,
	color: vars.color.grey500,
});

export const wrongAnswers = style({
	flexShrink: 0,
	textAlign: 'right',
	fontSize: 15,
	color: vars.color.grey600,
	fontVariantNumeric: 'tabular-nums',
});

export const mine = style({
	color: vars.color.red500,
	fontWeight: 700,
	textDecoration: 'line-through',
});

export const correctAnswer = style({
	marginLeft: 8,
	color: vars.color.green600,
	fontWeight: 700,
});

export const allCorrect = style({
	padding: 20,
	borderRadius: 14,
	textAlign: 'center',
	fontSize: 16,
	fontWeight: 600,
	color: vars.color.green700,
	background: vars.color.green50,
});

export const bottomButton = style({
	maxWidth: 560,
	margin: '0 auto',
});
