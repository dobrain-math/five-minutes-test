import { style } from '@vanilla-extract/css';
import { canHover, vars } from '@/styles/theme.css.ts';

export const header = style({ marginBottom: 28 });

export const field = style({ marginBottom: 28 });

export const nameInput = style({
	width: '100%',
	height: 56,
	padding: '0 18px',
	border: 'none',
	borderRadius: 16,
	fontSize: 18,
	fontWeight: 600,
	fontFamily: 'inherit',
	color: vars.color.grey900,
	background: vars.color.layeredBackground,
	boxShadow: vars.shadow.sm,
	outline: 'none',
	transition: 'box-shadow 0.15s',
	'::placeholder': { color: vars.color.grey400, fontWeight: 400 },
	':focus': {
		boxShadow: `0 0 0 2px ${vars.color.blue500}, ${vars.shadow.md}`,
	},
});

export const courseList = style({
	display: 'flex',
	flexDirection: 'column',
	gap: 10,
	listStyle: 'none',
});

export const courseItem = style({
	display: 'flex',
	alignItems: 'center',
	gap: 14,
	width: '100%',
	minHeight: 72,
	padding: '16px 18px',
	border: 'none',
	borderRadius: 18,
	fontFamily: 'inherit',
	textAlign: 'left',
	background: vars.color.layeredBackground,
	boxShadow: vars.shadow.sm,
	cursor: 'pointer',
	transition: 'box-shadow 0.15s, background 0.15s, transform 0.1s',
	selectors: {
		'&:active': { transform: 'scale(0.99)' },
		'&[aria-checked="true"]': {
			background: vars.color.blue50,
			boxShadow: `0 0 0 2px ${vars.color.blue500}, ${vars.shadow.md}`,
		},
	},
	'@media': {
		[canHover]: {
			selectors: {
				'&:hover:not([aria-checked="true"])': { boxShadow: vars.shadow.md },
			},
		},
	},
});

export const radio = style({
	flexShrink: 0,
	width: 24,
	height: 24,
	border: `2px solid ${vars.color.grey300}`,
	borderRadius: '50%',
	transition: 'border 0.15s',
	selectors: {
		[`${courseItem}[aria-checked="true"] &`]: {
			border: `7px solid ${vars.color.blue500}`,
		},
	},
});

export const courseTitle = style({
	fontSize: 18,
	fontWeight: 700,
	color: vars.color.grey900,
});

export const courseMeta = style({
	marginTop: 3,
	fontSize: 14,
	color: vars.color.grey500,
});
