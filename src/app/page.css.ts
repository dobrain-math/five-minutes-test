import { globalStyle, keyframes, style } from '@vanilla-extract/css';
import { breakpoints, canHover, vars } from '@/styles/theme.css.ts';
import { text } from '@/styles/typography.css.ts';

/**
 * 머리 띠 안쪽. 리포트(36/40, 태블릿 56/60)보다 낮게 — 홈은 입력이 주인공이라 띠는 브랜드만 보여 준다(원장님 «너무 과하지 않게» 2026-10-27).
 * 띠 바탕은 styles/brand.css.ts brandBand.
 */
export const heroInner = style({
	position: 'relative',
	paddingTop: 28,
	paddingBottom: 30,
	'@media': {
		[breakpoints.tablet]: { paddingTop: 40, paddingBottom: 44 },
	},
});

export const heroTitle = style([
	text.title1,
	{ color: '#ffffff', wordBreak: 'keep-all' },
]);

export const heroSubtitle = style([
	text.body2,
	{
		marginTop: 8,
		fontSize: vars.font.size.t5,
		color: 'rgba(255, 255, 255, 0.82)',
		wordBreak: 'keep-all',
	},
]);

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

// ── 실험 C: 권 카드 연산 기호 + 예시 문제 ──────────────────

export const courseBody = style({ flex: 1, minWidth: 0 });

export const courseOps = style({ display: 'flex', gap: 4, flexShrink: 0 });

const opColor = {
	'+': vars.color.blue500,
	'-': vars.color.green500,
	'×': vars.color.purple500,
};

/** 연산 기호 칩. 색은 반투명 바탕 + 같은 색 글자(라이트·다크 모두 옅게) */
export const courseOp = style([
	text.body1,
	{
		display: 'grid',
		placeItems: 'center',
		width: 28,
		height: 28,
		borderRadius: vars.radius.sm,
		fontWeight: vars.font.weight.bold,
		lineHeight: 1,
		selectors: Object.fromEntries(
			Object.entries(opColor).map(([op, color]) => [
				`&[data-op="${op}"]`,
				{
					color,
					background: `color-mix(in srgb, ${color} 12%, transparent)`,
				},
			]),
		),
	},
]);

// ── 나이·학년 막대 ─────────────────────────────────────────

const THUMB = 28; // 손잡이 지름. 눈금 글자도 이 반만큼 안쪽에서 시작해야 손잡이 가운데와 맞는다
const TRACK = 6;

export const ageLabelRow = style({
	display: 'flex',
	alignItems: 'center',
	minHeight: 26, // 고른 값(17px × 1.5)이 커져도 아래 카드가 밀리지 않게
	justifyContent: 'space-between',
	gap: 12,
	marginBottom: 10,
});

export const ageValue = style([
	text.caption,
	{
		color: vars.color.grey400,
		selectors: {
			'&[data-picked="true"]': {
				fontSize: vars.font.size.t5,
				fontWeight: vars.font.weight.bold,
				color: vars.color.blue500,
			},
		},
	},
]);

export const ageCard = style({
	padding: '6px 18px 14px',
	borderRadius: vars.radius.lg,
	background: vars.color.layeredBackground,
	boxShadow: vars.shadow.sm,
});

const thumb = {
	width: THUMB,
	height: THUMB,
	border: `1px solid ${vars.color.grey300}`,
	borderRadius: vars.radius.full,
	background: '#ffffff',
	boxShadow: vars.shadow.md,
	cursor: 'grab',
	transition: 'border-color 0.15s, transform 0.1s',
} as const;

// 막대: 손잡이 가운데까지 파랑, 나머지 회색. --age-fill(0~1)은 page.tsx 가 넣는다
const trackFill = `linear-gradient(to right, ${vars.color.blue500} calc(${THUMB / 2}px + (100% - ${THUMB}px) * var(--age-fill, 0)), ${vars.color.grey200} 0)`;

export const ageSlider = style({
	display: 'block',
	width: '100%',
	height: 44, // 손가락으로 잡기 쉬운 높이
	margin: 0,
	background: 'transparent',
	appearance: 'none',
	WebkitAppearance: 'none',
	cursor: 'pointer',
	outline: 'none',
	touchAction: 'pan-y',
	selectors: {
		'&::-webkit-slider-runnable-track': {
			height: TRACK,
			borderRadius: vars.radius.full,
			background: vars.color.grey200,
		},
		'&[data-picked="true"]::-webkit-slider-runnable-track': {
			background: trackFill,
		},
		'&::-moz-range-track': {
			height: TRACK,
			borderRadius: vars.radius.full,
			background: vars.color.grey200,
		},
		'&[data-picked="true"]::-moz-range-track': { background: trackFill },
		'&::-webkit-slider-thumb': {
			...thumb,
			WebkitAppearance: 'none',
			marginTop: (TRACK - THUMB) / 2,
		},
		'&::-moz-range-thumb': thumb,
		'&[data-picked="true"]::-webkit-slider-thumb': {
			borderColor: vars.color.blue500,
		},
		'&[data-picked="true"]::-moz-range-thumb': {
			borderColor: vars.color.blue500,
		},
		'&:active::-webkit-slider-thumb': {
			cursor: 'grabbing',
			transform: 'scale(1.08)',
		},
		'&:active::-moz-range-thumb': {
			cursor: 'grabbing',
			transform: 'scale(1.08)',
		},
		'&:focus-visible::-webkit-slider-thumb': {
			boxShadow: `0 0 0 1px ${vars.color.blue500}, 0 0 0 4px ${vars.color.blue100}`,
		},
		'&:focus-visible::-moz-range-thumb': {
			boxShadow: `0 0 0 1px ${vars.color.blue500}, 0 0 0 4px ${vars.color.blue100}`,
		},
	},
});

// 눈금 글자: 손잡이가 다니는 구간(양 끝에서 손잡이 반지름만큼 안쪽)에 맞춰 놓는다
export const ageTicks = style({
	position: 'relative',
	height: 18,
	margin: `2px ${THUMB / 2}px 0`,
});

export const ageTick = style([
	text.caption2,
	{
		position: 'absolute',
		top: 0,
		transform: 'translateX(-50%)',
		whiteSpace: 'nowrap',
		color: vars.color.grey500,
		cursor: 'pointer',
		userSelect: 'none',
		selectors: {
			'&[data-active="true"]': {
				color: vars.color.blue500,
				fontWeight: vars.font.weight.bold,
			},
		},
	},
]);

// 공용 sectionLabel 의 아래 여백(10px)은 ageLabelRow 가 대신 준다. && 로 우선순위를 올려 덮어쓴다
export const ageLabelText = style({ selectors: { '&&': { marginBottom: 0 } } });

// ── 유형(권을 고르면 펼쳐짐) ─────────────────────────────────

export const partList = style({
	display: 'flex',
	flexDirection: 'column',
	gap: 8,
	listStyle: 'none',
});

// courseItem 과 함께 쓴다 — 줄이 많아 높이·둥글기만 줄인다
export const partItem = style({
	gap: 10,
	minHeight: 52,
	padding: '12px 16px',
	borderRadius: vars.radius.md,
});

export const partNumber = style([
	text.caption,
	{
		flexShrink: 0,
		display: 'grid',
		placeItems: 'center',
		width: 24,
		height: 24,
		borderRadius: vars.radius.full,
		fontWeight: vars.font.weight.bold,
		color: vars.color.grey600,
		background: vars.color.grey100,
		selectors: {
			[`${courseItem}[aria-checked="true"] &`]: {
				color: '#ffffff',
				background: vars.color.blue500,
			},
		},
	},
]);

export const partTitle = style([
	text.body2,
	{ fontWeight: vars.font.weight.semibold, color: vars.color.grey900 },
]);

// ── 전체 풀기 / 유형별 풀기 ─────────────────────────────────

export const modeGrid = style({
	display: 'grid',
	gridTemplateColumns: '1fr 1fr',
	gap: 8,
});

/**
 * 전체 풀기 / 유형별 풀기: 라디오 동그라미 없는 버튼 모양(원장님 결정 2026-10-22).
 * 고르면 파랑으로 채워지고 글자가 흰색이 된다.
 */
export const modeButton = style({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	gap: 4,
	minHeight: 72,
	padding: '12px 10px',
	border: 'none',
	borderRadius: vars.radius.md,
	textAlign: 'center',
	wordBreak: 'keep-all',
	color: vars.color.grey900,
	background: vars.color.layeredBackground,
	boxShadow: vars.shadow.sm,
	cursor: 'pointer',
	transition: 'background 0.15s, color 0.15s, box-shadow 0.15s, transform 0.1s',
	selectors: {
		'&:active': { transform: 'scale(0.98)' },
		'&[aria-checked="true"]': {
			color: '#ffffff',
			background: vars.color.blue500,
			boxShadow: vars.shadow.md,
		},
		'&:focus-visible': {
			outline: 'none',
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

export const modeTitle = style([
	text.body1,
	{ fontWeight: vars.font.weight.bold },
]);

export const modeMeta = style([
	text.caption,
	{
		color: vars.color.grey500,
		selectors: {
			[`${modeButton}[aria-checked="true"] &`]: {
				color: 'rgba(255, 255, 255, 0.85)',
			},
		},
	},
]);

/**
 * 유형 목록 펼치기: 높이 0fr → 1fr 로 늘린다(높이를 몰라도 부드럽게 열리고 닫힌다).
 * NOTE: 움직임 줄이기 설정이면 바로 열고 닫는다.
 */
export const partReveal = style({
	display: 'grid',
	gridTemplateRows: '0fr',
	opacity: 0,
	transition:
		'grid-template-rows 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.25s',
	selectors: {
		'&[data-open="true"]': { gridTemplateRows: '1fr', opacity: 1 },
	},
	'@media': {
		'(prefers-reduced-motion: reduce)': { transition: 'none' },
	},
});

// NOTE: overflow hidden 이 카드 그림자를 자르지 않게 양옆을 조금 넓혀 두고 목록 안쪽 여백으로 되돌린다.
export const partRevealInner = style({
	minHeight: 0,
	overflow: 'hidden',
	margin: '0 -8px',
});

globalStyle(`${partRevealInner} > ul`, { padding: '10px 8px 8px' });

/** 펼칠 때 줄들이 위에서 차례로 내려온다 */
const dropIn = keyframes({
	from: { opacity: 0, transform: 'translateY(-8px)' },
	to: { opacity: 1, transform: 'none' },
});

for (let n = 1; n <= 20; n++) {
	globalStyle(`${partReveal}[data-open="true"] li:nth-child(${n})`, {
		'@media': {
			'(prefers-reduced-motion: no-preference)': {
				animation: `${dropIn} 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) ${60 + (n - 1) * 30}ms both`,
			},
		},
	});
}

// 유형별을 눌러 이 칸으로 스크롤할 때 위에 살짝 여백을 남긴다
export const modeField = style({ scrollMarginTop: 16 });

// ── 실험 B: 단계 번호 ─────────────────────────────────────

/** 칸 이름 앞에 ① ② ③ ④ — 어디까지 골랐는지 한눈에 */
export const stepLabel = style({
	display: 'flex',
	alignItems: 'center',
	gap: 8,
});

export const step = style([
	text.caption2,
	text.number,
	{
		display: 'inline-grid',
		placeItems: 'center',
		flexShrink: 0,
		width: 20,
		height: 20,
		borderRadius: vars.radius.full,
		fontWeight: vars.font.weight.bold,
		color: vars.color.grey600,
		background: `color-mix(in srgb, ${vars.color.grey500} 16%, transparent)`,
		transition: 'background 0.2s, color 0.2s',
		selectors: {
			'&[data-done="true"]': {
				color: '#ffffff',
				background: vars.color.blue500,
			},
		},
	},
]);

export const stepCheck = style({ width: 14, height: 14 });
