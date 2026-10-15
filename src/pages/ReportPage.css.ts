import { style } from '@vanilla-extract/css';
import { breakpoints, vars } from '@/styles/theme.css.ts';
import { text } from '@/styles/typography.css.ts';

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

export const statLabel = style([
	text.caption,
	{ fontWeight: vars.font.weight.semibold, color: vars.color.grey500 },
]);

export const statValue = style([
	text.display,
	text.number,
	{ marginTop: 6, color: vars.color.grey900 },
]);

export const statUnit = style([
	text.body1,
	{ marginLeft: 4, color: vars.color.grey400 },
]);

export const block = style({ marginBottom: 16 });

export const blockTitle = style([
	text.title2,
	{ marginBottom: 14, color: vars.color.grey900 },
]);

// ── 한 줄 평 ───────────────────────────────────────────────

export const verdictList = style({
	display: 'flex',
	flexDirection: 'column',
	gap: 12,
	listStyle: 'none',
});

export const verdict = style({
	display: 'flex',
	alignItems: 'flex-start',
	gap: 10,
});

const badgeBase = style([
	text.caption,
	{
		flexShrink: 0,
		padding: '2px 8px',
		borderRadius: vars.radius.xs,
		fontWeight: vars.font.weight.bold,
	},
]);

export const strengthBadge = style([
	badgeBase,
	{ color: vars.color.blue600, background: vars.color.blue50 },
]);

export const weaknessBadge = style([
	badgeBase,
	{ color: vars.color.orange800, background: vars.color.orange50 },
]);

export const verdictText = style([
	text.body2,
	{ fontWeight: vars.font.weight.medium, color: vars.color.grey800 },
]);

// ── 그래프 ────────────────────────────────────────────────

export const legend = style([
	text.caption,
	{
		display: 'flex',
		gap: 16,
		marginBottom: 10,
		color: vars.color.grey600,
	},
]);

export const legendDot = style({
	display: 'inline-block',
	width: 10,
	height: 10,
	marginRight: 6,
	borderRadius: 3,
	verticalAlign: 'middle',
});

// ── 틀린 문제 ─────────────────────────────────────────────

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
	borderRadius: vars.radius.sm,
	background: vars.color.red50,
});

export const wrongExpr = style([
	text.expression,
	text.number,
	{ fontSize: vars.font.size.t4, color: vars.color.grey900 },
]);

export const wrongSection = style([
	text.caption2,
	{ marginTop: 2, color: vars.color.grey500 },
]);

export const wrongAnswers = style([
	text.body2,
	text.number,
	{ flexShrink: 0, textAlign: 'right', color: vars.color.grey600 },
]);

export const mine = style({
	color: vars.color.red500,
	fontWeight: vars.font.weight.bold,
	textDecoration: 'line-through',
});

export const correctAnswer = style({
	marginLeft: 8,
	color: vars.color.green600,
	fontWeight: vars.font.weight.bold,
});

export const allCorrect = style([
	text.body1,
	{
		padding: 20,
		borderRadius: vars.radius.sm,
		textAlign: 'center',
		color: vars.color.green700,
		background: vars.color.green50,
	},
]);

export const bottomButton = style({
	maxWidth: 560,
	margin: '0 auto',
});
