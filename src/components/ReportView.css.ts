import { style } from '@vanilla-extract/css';
import { breakpoints, canHover, vars } from '@/styles/theme.css.ts';
import { text } from '@/styles/typography.css.ts';
import { container as layoutContainer } from '@/styles/utility.css.ts';

export const header = style({ marginBottom: 24 });

/**
 * 모든 화면에서 800px 한 단으로 위에서 아래로 읽는다.
 * NOTE: PC 2단 대시보드는 왼쪽·오른쪽 카드 높이가 달라 줄이 안 맞아 보여서 없앴다(2026-10-20).
 */
export const container = layoutContainer.medium;

export const stack = style({
	display: 'flex',
	flexDirection: 'column',
	gap: 16,
});

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

/**
 * 학습 완료·연습 필요 뱃지만 태블릿 표준 768px 미만에서 아이콘만 남긴다.
 * NOTE: 유형 목록 2열은 공용 breakpoints.tablet(640px)부터 — 768px 은 뱃지에만 쓴다.
 */
const narrow = 'screen and (max-width: 767px)';

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

/**
 * 유형 한 칸. 강조 없는 줄도 아주 연한 회색 1px 실선으로 구분하고,
 * 학습 완료(8개 이상)·연습 필요(3개 이하) 줄은 옅은 색 바탕 + 색 테두리.
 * 안은 «이름 + 학습 완료·연습 필요(sectionHead)» 아래 «10칸 + 맞힌 수(sectionBody)».
 */
export const sectionRow = style({
	display: 'flex',
	flexDirection: 'column',
	padding: '8px 10px 10px',
	border: `1px solid ${vars.color.grey100}`,
	borderRadius: vars.radius.sm,
	selectors: {
		'&[data-mark="strong"]': {
			background: tint(vars.color.blue300, 8),
			borderColor: tint(vars.color.blue500, 35),
		},
		'&[data-mark="weak"]': {
			background: tint(vars.color.orange300, 8),
			borderColor: tint(vars.color.orange500, 40),
		},
	},
});

/** 이름(왼쪽) + 학습 완료·연습 필요 뱃지(오른쪽) 한 줄 */
export const sectionHead = style({
	display: 'flex',
	alignItems: 'flex-start',
	justifyContent: 'space-between',
	gap: 6,
	marginBottom: 6,
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

/** 아이콘 + 글자 알약 뱃지 */
const badgeBase = style([
	text.caption2,
	{
		display: 'inline-flex',
		alignItems: 'center',
		gap: 3,
		flexShrink: 0,
		padding: '2px 8px 2px 6px',
		borderRadius: vars.radius.full,
		fontWeight: vars.font.weight.bold,
		color: '#ffffff',
	},
]);

/**
 * 이름 아래 한 줄: 10칸(왼쪽) · 맞힌 수(오른쪽).
 * 2열일 때 이름이 한 줄·두 줄로 달라도 이 줄이 맨 아래에 붙어 옆 칸과 높이가 맞는다.
 */
export const sectionBody = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: 8,
	marginTop: 'auto',
});

export const badgeIcon = style({ width: 12, height: 12, flexShrink: 0 });

/**
 * 학습 완료·연습 필요 뱃지. 768px 미만에서는 글자를 빼고 아이콘만 남긴 동그라미가 된다
 * (이름 옆에 글자 뱃지까지 두면 휴대폰에서 이름이 두 줄로 꺾여서).
 */
const markBadge = style([
	badgeBase,
	{ '@media': { [narrow]: { padding: 4 } } },
]);

export const badgeLabel = style({
	'@media': { [narrow]: { display: 'none' } },
});

export const strengthBadge = style([
	markBadge,
	{ background: vars.color.blue500 },
]);

export const weaknessBadge = style([
	markBadge,
	{ background: vars.color.orange500 },
]);

/** 맞힌 수 「8 / 10」. 다른 뱃지와 같은 알약 모양에 회색 반투명 바탕(다크에서도 옅게) */
export const scoreBadge = style([
	badgeBase,
	text.number,
	{
		padding: '2px 8px',
		width: 60,
		whiteSpace: 'nowrap',
		justifyContent: 'center',
		color: vars.color.grey600,
		background: tint(vars.color.grey500, 14),
	},
]);

export const sectionCorrect = style({
	fontWeight: vars.font.weight.bold,
	color: vars.color.grey900,
});

/**
 * 1문제 = 1칸. 칸은 최대 16px, 휴대폰처럼 좁으면 뱃지 자리를 남기고 함께 작아진다.
 */
export const cells = style({
	display: 'grid',
	gridAutoFlow: 'column',
	gridAutoColumns: 'minmax(0, 16px)',
	gap: 3,
	flex: '1 1 auto',
	minWidth: 0,
});

/** 맞힌 칸은 꽉 찬 초록(학습 완료 줄은 파랑), 틀린 칸은 반투명 빨강 + 안쪽 1px 테두리 */
export const cell = style({
	width: '100%',
	aspectRatio: '1',
	borderRadius: 4,
	background: tint(vars.color.red400, 12),
	boxShadow: `inset 0 0 0 1px ${tint(vars.color.red400, 20)}`,
	selectors: {
		'&[data-correct="true"]': {
			background: vars.color.green400,
			boxShadow: 'none',
		},
		[`${sectionRow}[data-mark="strong"] &[data-correct="true"]`]: {
			background: vars.color.blue500,
		},
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
			outline: `1px solid ${vars.color.blue500}`,
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
	border: `1px solid ${tint(vars.color.red400, 40)}`,
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
