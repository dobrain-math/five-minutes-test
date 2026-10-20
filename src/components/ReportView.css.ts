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

// ── 유형별 정답률 ─────────────────────────────────────────

export const sectionList = style({
	display: 'grid',
	gridTemplateColumns: '1fr',
	gap: 4,
	listStyle: 'none',
	'@media': {
		[breakpoints.tablet]: {
			gridTemplateColumns: 'repeat(2, 1fr)',
			columnGap: 12,
		},
	},
});

/** 가장 잘한·약한 유형은 줄 전체에 옅은 색을 깐다 */
export const sectionRow = style({
	padding: '12px 12px 14px',
	borderRadius: vars.radius.sm,
	selectors: {
		'&[data-mark="strong"]': { background: vars.color.blue50 },
		'&[data-mark="weak"]': { background: vars.color.orange50 },
	},
});

export const sectionHead = style({
	display: 'flex',
	alignItems: 'center',
	gap: 6,
	marginBottom: 8,
});

export const sectionName = style([
	text.body2,
	{
		minWidth: 0,
		fontWeight: vars.font.weight.semibold,
		color: vars.color.grey800,
		wordBreak: 'keep-all',
	},
]);

const badgeBase = style([
	text.caption2,
	{
		flexShrink: 0,
		padding: '2px 7px',
		borderRadius: vars.radius.xs,
		fontWeight: vars.font.weight.bold,
		color: '#ffffff',
	},
]);

export const strengthBadge = style([
	badgeBase,
	{ background: vars.color.blue500 },
]);

export const weaknessBadge = style([
	badgeBase,
	{ background: vars.color.orange500 },
]);

export const sectionScore = style([
	text.body2,
	text.number,
	{ flexShrink: 0, marginLeft: 'auto', color: vars.color.grey500 },
]);

export const sectionCorrect = style({
	fontWeight: vars.font.weight.bold,
	color: vars.color.grey900,
});

/** 막대 바탕(오답 몫)은 옅은 빨강, 채워진 몫이 정답률 */
export const track = style({
	height: 10,
	borderRadius: vars.radius.full,
	overflow: 'hidden',
	background: vars.color.red100,
});

export const fill = style({
	height: '100%',
	borderRadius: vars.radius.full,
	background: vars.color.green400,
	selectors: {
		[`${sectionRow}[data-mark="strong"] &`]: { background: vars.color.blue500 },
	},
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

// ── 평가문 ────────────────────────────────────────────────

export const evaluation = style([
	text.body1,
	{
		fontWeight: vars.font.weight.regular,
		color: vars.color.grey800,
		wordBreak: 'keep-all',
	},
]);

// ── 아래 버튼 ─────────────────────────────────────────────

export const buttonRow = style({
	display: 'flex',
	gap: 8,
	maxWidth: 560,
	margin: '0 auto',
});

/** 링크 복사 결과를 버튼 위에 잠깐 띄운다 */
export const notice = style([
	text.label,
	{
		maxWidth: 560,
		margin: '0 auto 10px',
		padding: '14px 16px',
		borderRadius: vars.radius.md,
		textAlign: 'center',
		color: vars.color.grey800,
		background: vars.color.layeredBackground,
		boxShadow: vars.shadow.md,
	},
]);
