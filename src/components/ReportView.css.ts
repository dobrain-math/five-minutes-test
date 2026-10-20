import { style } from '@vanilla-extract/css';
import { breakpoints, canHover, vars } from '@/styles/theme.css.ts';
import { text } from '@/styles/typography.css.ts';
import { container as layoutContainer } from '@/styles/utility.css.ts';

export const header = style({ marginBottom: 24 });

/** 휴대폰·태블릿은 800px 한 단, PC 는 1200px 대시보드 */
export const container = style([
	layoutContainer.medium,
	{
		'@media': {
			[breakpoints.laptop]: { maxWidth: 1200 },
		},
	},
]);

// ── 대시보드 배치 ─────────────────────────────────────────

export const dashboard = style({
	display: 'grid',
	gridTemplateColumns: 'minmax(0, 1fr)',
	gap: 16,
	alignItems: 'start',
	'@media': {
		[breakpoints.laptop]: {
			gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 7fr)',
			gap: 20,
		},
	},
});

/** 왼쪽 단: 점수·시간 + 종합 평가 */
export const column = style({
	display: 'flex',
	flexDirection: 'column',
	gap: 16,
	'@media': {
		[breakpoints.laptop]: { gap: 20 },
	},
});

/** PC 에서 두 단을 가로질러 아래에 놓는다 */
export const fullRow = style({ gridColumn: '1 / -1' });

export const stats = style({
	display: 'grid',
	gridTemplateColumns: '1fr 1fr',
	gap: 10,
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

// NOTE: 카드 사이 간격은 dashboard·column 의 gap 이 맡는다.
export const block = style({});

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

/**
 * 색을 반투명으로 섞는다. 바탕 카드 색이 비쳐 라이트·다크 모두에서 옅게 보인다.
 * NOTE: 다크 팔레트가 50↔900 뒤집기라 red50·orange50 을 그대로 깔면 다크에서 진한 색이 된다.
 */
const tint = (color: string, percent: number) =>
	`color-mix(in srgb, ${color} ${percent}%, transparent)`;

/** 가장 잘한·약한 유형은 줄 전체에 옅은 색 + 2px 테두리 */
export const sectionRow = style({
	padding: '10px 10px 12px',
	border: '2px solid transparent',
	borderRadius: vars.radius.sm,
	selectors: {
		'&[data-mark="strong"]': {
			background: tint(vars.color.blue500, 8),
			borderColor: tint(vars.color.blue500, 35),
		},
		'&[data-mark="weak"]': {
			background: tint(vars.color.orange500, 8),
			borderColor: tint(vars.color.orange500, 40),
		},
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

/**
 * 막대 바탕(오답 몫)은 반투명 빨강 + 안쪽 2px 테두리, 채워진 몫이 정답률.
 * 정답 막대가 위에 덮이므로 테두리는 오답 몫에만 보인다.
 */
export const track = style({
	height: 12,
	borderRadius: vars.radius.full,
	overflow: 'hidden',
	background: tint(vars.color.red400, 12),
	boxShadow: `inset 0 0 0 2px ${tint(vars.color.red400, 45)}`,
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
	marginTop: 14,
	listStyle: 'none',
	'@media': {
		[breakpoints.tablet]: { gridTemplateColumns: 'repeat(2, 1fr)' },
		[breakpoints.laptop]: { gridTemplateColumns: 'repeat(3, 1fr)' },
	},
});

/** 「틀린 문제 N개 · 보기」 줄 전체가 펼침 버튼 */
export const disclosure = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: 12,
	width: '100%',
	margin: '-6px 0',
	padding: '6px 0',
	border: 'none',
	background: 'none',
	textAlign: 'left',
	cursor: 'pointer',
	selectors: {
		'&:focus-visible': {
			outline: `2px solid ${vars.color.blue500}`,
			outlineOffset: 4,
			borderRadius: vars.radius.xs,
		},
	},
});

export const disclosureTitle = style([
	text.title2,
	{ color: vars.color.grey900 },
]);

export const disclosureAction = style([
	text.label,
	{
		display: 'inline-flex',
		alignItems: 'center',
		gap: 4,
		flexShrink: 0,
		color: vars.color.grey500,
		transition: 'color 0.15s',
		'@media': {
			[canHover]: {
				selectors: { [`${disclosure}:hover &`]: { color: vars.color.grey800 } },
			},
		},
	},
]);

export const chevron = style({
	width: 16,
	height: 16,
	transition: 'transform 0.2s',
	selectors: { '&[data-open="true"]': { transform: 'rotate(180deg)' } },
});

export const wrongItem = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: 12,
	padding: '10px 14px',
	border: `2px solid ${tint(vars.color.red400, 35)}`,
	borderRadius: vars.radius.sm,
	background: tint(vars.color.red400, 7),
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
