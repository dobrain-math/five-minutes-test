import { globalStyle, keyframes, style } from '@vanilla-extract/css';
import { brandBand } from '@/styles/brand.css.ts';
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

/** 대제목·학생 정보 띠. 모양은 홈 머리 띠와 같은 brandBand */
export const hero = brandBand;

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

/** 한 유형만 풀었을 때 「3번 유형 · 유형 이름」 */
export const heroPart = style([
	text.body2,
	{
		marginTop: 14,
		fontWeight: vars.font.weight.semibold,
		color: '#ffffff',
		wordBreak: 'keep-all',
		...rise(120),
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

// ── 강 · 약점분석(유형별 정답률, 옛 이름 풀이 스타일 분석) ─────────────────────────────────────────

/**
 * 유형이 19개로 늘고 유형마다 3문제가 되며(2026-10-29) 가로로 긴 줄 대신 정사각형에 가까운 칸을 여러 열로 깐다.
 * 휴대폰 3열 → 640px 4열 → 768px 5열(본문 800px 한 단에서 칸 한 변 130px 안팎).
 */
export const sectionList = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
	gap: 8,
	listStyle: 'none',
	'@media': {
		[breakpoints.tablet]: { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
		'screen and (min-width: 768px)': {
			gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
		},
	},
});

/**
 * 유형 한 칸. 강조 없는 줄도 아주 연한 회색 1px 실선으로 구분하고,
 * 강점(80%↑, 24문제 중 20개↑)·약점(30%↓, 7개↓) 줄은 옅은 색 바탕 + 색 테두리.
 * 안은 위 «번호·강약 아이콘 + 맞힌 수(sectionHead)», 아래 이름(옛 링크는 그 아래 걸린 시간).
 * NOTE: 2026-10-29 «공간 더 절약» — 세 단(번호 / 이름 / 맞힌 수, 최소 104px)을 두 단으로 줄였다.
 */
export const sectionRow = style({
	display: 'flex',
	flexDirection: 'column',
	gap: 4,
	padding: '7px 8px 8px',
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

/** 번호 + 강점·약점 아이콘(왼쪽) · 맞힌 수(오른쪽, scoreBadge marginLeft auto) 한 줄 */
export const sectionHead = style({
	display: 'flex',
	alignItems: 'center',
	gap: 4,
});

export const sectionName = style([
	text.caption,
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

export const badgeIcon = style({ width: 12, height: 12, flexShrink: 0 });

/** 강점·약점은 글자 없이 아이콘 동그라미만(글자는 title·aria-label). 칸 바탕색·번호 색이 함께 알려 준다 */
const markBadge = style([
	badgeBase,
	{ justifyContent: 'center', width: 18, height: 18, padding: 0 },
]);

export const strengthBadge = style([
	markBadge,
	{ background: vars.color.blue500 },
]);

export const weaknessBadge = style([
	markBadge,
	{ background: vars.color.red500 },
]);

/** 맞힌 수 「20 / 24」. 다른 뱃지와 같은 알약 모양에 회색 반투명 바탕(다크에서도 옅게) */
export const scoreBadge = style([
	badgeBase,
	text.number,
	{
		padding: '2px 8px',
		marginLeft: 'auto',
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

/** 유형 번호 동그라미 — 레이더 꼭짓점 번호와 같은 색(강점 파랑·약점 빨강) */
export const sectionNumber = style([
	text.caption2,
	text.number,
	{
		display: 'inline-grid',
		placeItems: 'center',
		width: 18,
		height: 18,
		borderRadius: vars.radius.full,
		fontWeight: vars.font.weight.bold,
		color: vars.color.grey700,
		background: tint(vars.color.grey500, 14),
		selectors: {
			'&[data-mark="strong"]': {
				color: '#ffffff',
				background: vars.color.blue500,
			},
			'&[data-mark="weak"]': {
				color: '#ffffff',
				background: vars.color.red500,
			},
		},
	},
]);

/** 이 유형(전체 풀기의 한 페이지)에 걸린 시간 */
export const sectionTime = style([
	text.caption,
	text.number,
	{ color: vars.color.grey500 },
]);

// ── 틀린 문제 ─────────────────────────────────────────────

/** 유형별 묶음들. 「보기」를 누르면 살짝 떠오르며 펼쳐진다 */
export const wrongGroups = style({
	display: 'flex',
	flexDirection: 'column',
	gap: 18,
	marginTop: 14,
	animation: riseAnimation(0),
	'@media': {
		'(prefers-reduced-motion: reduce)': { animation: 'none' },
	},
});

/** 묶음 제목: 번호 동그라미 + 유형 이름 + 틀린 개수 */
export const wrongGroupTitle = style([
	text.body2,
	{
		display: 'flex',
		alignItems: 'center',
		gap: 0,
		marginBottom: 8,
		fontWeight: vars.font.weight.semibold,
		color: vars.color.grey800,
	},
]);

export const wrongGroupName = style({ minWidth: 0, wordBreak: 'keep-all' });

export const wrongGroupCount = style([
	text.caption,
	{
		flexShrink: 0,
		marginLeft: 6,
		fontWeight: vars.font.weight.bold,
		color: vars.color.red500,
	},
]);

export const wrongList = style({
	display: 'grid',
	gridTemplateColumns: '1fr',
	gap: 8,
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
