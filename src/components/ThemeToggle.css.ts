import { style } from '@vanilla-extract/css';
import { canHover, vars } from '@/styles/theme.css.ts';

export const button = style({
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	flexShrink: 0,
	width: 32,
	height: 32,
	padding: 0,
	border: 'none',
	borderRadius: vars.radius.full,
	color: vars.color.grey600,
	background: vars.color.layeredBackground,
	boxShadow: vars.shadow.xs,
	cursor: 'pointer',
	transition: 'box-shadow 0.15s, color 0.15s, transform 0.1s',
	selectors: {
		'&:active': { transform: 'scale(0.94)' },
		'&:focus-visible': {
			outline: 'none',
			boxShadow: `0 0 0 1px ${vars.color.blue500}`,
		},
	},
	'@media': {
		[canHover]: {
			selectors: {
				'&:hover': { color: vars.color.grey900, boxShadow: vars.shadow.sm },
			},
		},
	},
});

export const icon = style({ width: 18, height: 18 });
