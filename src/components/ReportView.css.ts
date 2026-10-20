import { globalStyle, keyframes, style } from '@vanilla-extract/css';
import { breakpoints, canHover, vars } from '@/styles/theme.css.ts';
import { text } from '@/styles/typography.css.ts';
import { container as layoutContainer } from '@/styles/utility.css.ts';

/**
 * 색을 반투명으로 섞는다. 바탕 카드 색이 비쳐 라이트·다크 모두에서 옅게 보인다.
 * NOTE: 다크 팔레트가 50↔900 뒤집기라 red50·orange50 을 그대로 깔면 다크에서 진한 색이 된다.
 */
const tint = (color: string, percent: number) =>
	`color-mix(in srgb, ${color} ${percent}%, transparent)`;

export const header = style({ marginBottom: 24 });

// ── 머리 띠(화면 폭 100%) ─────────────────────────────────

/**
 * 아래에서 살짝 떠오르며 나타난다. transform·opacity 만 움직여 휴대폰에서도 가볍다.
 * NOTE: 움직임 줄이기 설정을 켠 기기에서는 애니메이션을 끈다.
 */
const riseIn = keyframes({
	from: { opacity: 0, transform: 'translateY(12px)' },
	to: { opacity: 1, transform: 'none' },
});

const riseAnimation = (delayMs: number) =>
	`${riseIn} 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) ${delayMs}ms both`;

const rise = (delayMs: number) => ({
	animation: riseAnimation(delayMs),
	'@media': {
		'(prefers-reduced-motion: reduce)': { animation: 'none' },
	},
});

/**
 * 대제목·학생 정보 띠. 본문(옅은 회색 바탕 + 흰 카드)과 색으로 확실히 나눈다.
 * 단색이면 밋밋해서 대각선 그라데이션 + 옅은 원 장식 + 아래로 번지는 파란 그림자로 깊이를 준다.
 * NOTE: 더 진한 쪽은 blue700 대신 blue500 에 검정을 섞는다 — 다크 팔레트는 50↔900 뒤집기라 blue700 이 밝아진다.
 */
export const hero = style({
	position: 'relative',
	overflow: 'hidden',
	color: '#ffffff',
	background: `linear-gradient(135deg, ${vars.color.blue500} 0%, color-mix(in srgb, ${vars.color.blue500} 72%, #000) 100%)`,
	borderRadius: `0 0 ${vars.radius.xl} ${vars.radius.xl}`,
	boxShadow: `0 10px 30px -12px ${tint(vars.color.blue500, 60)}`,
	selectors: {
		'&::before, &::after': {
			content: '""',
			position: 'absolute',
			borderRadius: '50%',
			background: 'rgba(255, 255, 255, 0.08)',
			pointerEvents: 'none',
		},
		'&::before': { width: 260, height: 260, top: -120, right: -60 },
		'&::after': { width: 160, height: 160, bottom: -90, right: 120 },
	},
});

export const heroInner = style({
	position: 'relative',
	paddingTop: 36,
	paddingBottom: 40,
	'@media': {
		[breakpoints.tablet]: { paddingTop: 56, paddingBottom: 60 },
	},
});

export const heroTitle = style([
	text.title1,
	{ color: '#ffffff', wordBreak: 'keep-all', ...rise(0) },
]);

export const heroStudent = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: 6,
	marginTop: 20,
	...rise(100),
	'@media': {
		'(prefers-reduced-motion: reduce)': { animation: 'none' },
		[breakpoints.tablet]: { marginTop: 24 },
	},
});

export const heroName = style([
	text.title2,
	{ marginRight: 4, color: '#ffffff' },
]);

/** 이름 줄 아래 「테스트 실시일 2026년 10월 20일」 */
export const heroDate = style([
	text.label,
	{
		marginTop: 12,
		fontWeight: vars.font.weight.medium,
		color: 'rgba(255, 255, 255, 0.8)',
		...rise(140),
	},
]);

/** 나이·종목 뱃지: 흰 반투명 알약 */
export const heroBadge = style([
	text.label,
	{
		padding: '4px 10px',
		borderRadius: vars.radius.full,
		fontWeight: vars.font.weight.semibold,
		color: '#ffffff',
		background: 'rgba(255, 255, 255, 0.2)',
	},
]);

/** 머리 띠 아래 본문 */
export const body = style({
	flex: 1,
	paddingTop: 20,
	paddingBottom: 32,
	'@media': {
		[breakpoints.tablet]: { paddingTop: 28 },
	},
});

/**
 * 모든 화면에서 800px 한 단으로 위에서 아래로 읽는다.
 * NOTE: PC 2단 대시보드는 왼쪽·오른쪽 카드 높이가 달라 줄이 안 맞아 보여서 없앴다(2026-10-20).
 */
export const container = layoutContainer.medium;

/** 카드들이 위에서부터 차례로 떠오른다(머리 띠 다음, 0.07초 간격) */
export const stack = style({
	display: 'flex',
	flexDirection: 'column',
	gap: 16,
});

for (const n of [1, 2, 3, 4]) {
	globalStyle(`${stack} > :nth-child(${n})`, {
		'@media': {
			'(prefers-reduced-motion: no-preference)': {
				animation: riseAnimation(160 + (n - 1) * 70),
			},
		},
	});
}

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
 * 강함·취약 뱃지는 태블릿 2열 구간(640~767px)에서만 아이콘만 남긴다.
 * 휴대폰(1열)과 768px 이상은 글자까지 보인다(원장님 결정 2026-10-20).
 * NOTE: 유형 목록 2열은 공용 breakpoints.tablet(640px)부터.
 */
const narrow = 'screen and (min-width: 640px) and (max-width: 767px)';

export const sectionList = style({
	display: 'grid',
	gridTemplateColumns: '1fr',
	gap: 8,
	listStyle: 'none',
	'@media': {
		[breakpoints.tablet]: {
			gridTemplateColumns: 'repeat(2, 1fr)',
			columnGap: 12,
		},
	},
});

/**
 * 유형 한 칸. 강조 없는 줄도 아주 연한 회색 1px 실선으로 구분하고,
 * 강함(8개 이상)·취약(3개 이하) 줄은 옅은 색 바탕 + 색 테두리.
 * 안은 «이름 + 강함·취약(sectionHead)» 아래 «10칸 + 맞힌 수(sectionBody)».
 */
export const sectionRow = style({
	display: 'flex',
	flexDirection: 'column',
	padding: '8px 10px 10px',
	// NOTE: grey100 은 다크에서 카드 바탕과 같아져 안 보여서, 회색을 반투명으로 섞는다(라이트·다크 모두 연하게).
	border: `1px solid ${tint(vars.color.grey500, 16)}`,
	borderRadius: vars.radius.sm,
	selectors: {
		'&[data-mark="strong"]': {
			background: tint(vars.color.blue300, 8),
			borderColor: tint(vars.color.blue500, 35),
		},
		'&[data-mark="weak"]': {
			background: tint(vars.color.red300, 8),
			borderColor: tint(vars.color.red500, 40),
		},
	},
});

/** 이름(왼쪽) + 강함·취약 뱃지(오른쪽) 한 줄 */
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
 * 강함·취약 뱃지. 태블릿 2열 구간(640~767px)에서는 글자를 빼고 아이콘만 남긴 동그라미가 된다
 * (2열 한 칸이 좁아 글자 뱃지까지 두면 이름이 두 줄로 꺾여서).
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
	{ background: vars.color.red500 },
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

/** 맞힌 칸은 꽉 찬 초록(강함 줄은 파랑), 틀린 칸은 반투명 빨강 + 안쪽 1px 테두리 */
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
	// NOTE: 「보기」를 누르면 목록이 살짝 떠오르며 펼쳐진다.
	animation: riseAnimation(0),
	'@media': {
		'(prefers-reduced-motion: reduce)': { animation: 'none' },
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

/** 아래 버튼 줄. 본문(800px)과 같은 폭으로 둬야 태블릿 이상에서 버튼만 좁아 보이지 않는다. */
export const buttonRow = style({
	display: 'flex',
	gap: 8,
});

/** 「처음으로」: 주 버튼(강조), 남은 폭 */
export const homeButton = style({ flex: 1 });

/** 「테스트 결과 공유」: 보조 버튼(강조 안 함), 글자 폭만 + 아이콘 */
export const shareButton = style({
	flex: '0 0 auto',
	// NOTE: 공용 버튼의 width 100% 를 풀어야 글자 폭만큼만 차지한다.
	width: 'auto',
	paddingInline: 18,
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: 6,
});

export const shareIcon = style({ width: 20, height: 20, flexShrink: 0 });

/** 링크 복사 결과를 버튼 위에 잠깐 띄운다 */
export const notice = style([
	text.label,
	{
		margin: '0 0 10px',
		padding: '14px 16px',
		borderRadius: vars.radius.md,
		textAlign: 'center',
		color: vars.color.grey800,
		background: vars.color.layeredBackground,
		boxShadow: vars.shadow.md,
	},
]);
