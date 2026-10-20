import { style } from '@vanilla-extract/css';
import { canHover, vars } from '@/styles/theme.css.ts';
import { text } from '@/styles/typography.css.ts';

export const header = style({ marginBottom: 28 });

export const field = style({ marginBottom: 28 });

export const nameInput = style([
	text.body1,
	{
		width: '100%',
		height: 56,
		padding: '0 18px',
		border: 'none',
		borderRadius: vars.radius.md,
		color: vars.color.grey900,
		background: vars.color.layeredBackground,
		boxShadow: vars.shadow.sm,
		outline: 'none',
		transition: 'box-shadow 0.15s',
		'::placeholder': {
			color: vars.color.grey400,
			fontWeight: vars.font.weight.regular,
		},
		':focus': {
			boxShadow: `0 0 0 1px ${vars.color.blue500}, ${vars.shadow.md}`,
		},
	},
]);

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
	borderRadius: vars.radius.lg,
	textAlign: 'left',
	background: vars.color.layeredBackground,
	boxShadow: vars.shadow.sm,
	cursor: 'pointer',
	transition: 'box-shadow 0.15s, background 0.15s, transform 0.1s',
	selectors: {
		'&:active': { transform: 'scale(0.99)' },
		'&[aria-checked="true"]': {
			background: vars.color.blue50,
			boxShadow: `0 0 0 1px ${vars.color.blue500}, ${vars.shadow.md}`,
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
	border: `1px solid ${vars.color.grey300}`,
	borderRadius: vars.radius.full,
	transition: 'border 0.15s',
	selectors: {
		[`${courseItem}[aria-checked="true"] &`]: {
			border: `7px solid ${vars.color.blue500}`,
		},
	},
});

export const courseTitle = style([text.title2, { color: vars.color.grey900 }]);

export const courseMeta = style([
	text.caption,
	{ marginTop: 3, color: vars.color.grey500 },
]);

// ── 나이·학년 ─────────────────────────────────────────────

export const ageGrid = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(5, 1fr)',
	gap: 8,
	listStyle: 'none',
});

export const ageChip = style([
	text.label,
	{
		width: '100%',
		height: 48,
		border: 'none',
		borderRadius: vars.radius.md,
		color: vars.color.grey700,
		background: vars.color.layeredBackground,
		boxShadow: vars.shadow.sm,
		cursor: 'pointer',
		transition: 'box-shadow 0.15s, background 0.15s, transform 0.1s',
		selectors: {
			'&:active': { transform: 'scale(0.97)' },
			'&[aria-checked="true"]': {
				color: vars.color.blue600,
				fontWeight: vars.font.weight.bold,
				background: vars.color.blue50,
				boxShadow: `0 0 0 1px ${vars.color.blue500}, ${vars.shadow.md}`,
			},
		},
		'@media': {
			[canHover]: {
				selectors: {
					'&:hover:not([aria-checked="true"])': { boxShadow: vars.shadow.md },
				},
			},
		},
	},
]);
