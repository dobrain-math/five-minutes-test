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
			boxShadow: `0 0 0 1px ${vars.color.blue700}, ${vars.shadow.md}`,
		},
		selectors: {
			'&[aria-invalid="true"], &[aria-invalid="true"]:focus': {
				boxShadow: `0 0 0 1px ${vars.color.red500}, ${vars.shadow.sm}`,
			},
		},
	},
]);

/** 학생명 제목 줄(ageLabelRow 와 함께) — 오류 문구를 겹쳐 놓을 기준 */
export const nameLabelRow = style({ position: 'relative' });

/**
 * 학생명 형식 위반 문구. 제목 줄 오른쪽에 한 줄로 붙인다(사용자 «한 줄로»).
 * 줄 높이를 늘리지 않게 absolute — 문구가 생기고 사라져도 아래 칸이 움직이지 않는다(2026-11-10).
 */
export const nameError = style([
	text.caption2,
	{
		position: 'absolute',
		right: 0,
		top: '50%',
		transform: 'translateY(-50%)',
		whiteSpace: 'nowrap',
		color: vars.color.red500,
		selectors: {
			// 챌린지 코드 확인됨(«김민준 학생 챌린지»)은 파랑
			'&[data-ok="true"]': { color: vars.color.blue700 },
		},
	},
]);

export const courseList = style({
	display: 'flex',
	flexDirection: 'column',
	gap: 10,
	listStyle: 'none',
});

/**
 * 권·유형 카드. 라디오 동그라미 없이 카드 전체가 선택 표시(파랑 옅은 바탕 + 1px 파랑 테두리)를 맡는다
 * (원장님 «라디오 버튼이 부담스럽다» 2026-10-27, 실험 exp/no-radio).
 */
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
			boxShadow: `0 0 0 1px ${vars.color.blue700}, ${vars.shadow.md}`,
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

export const courseTitle = style([text.title2, { color: vars.color.grey900 }]);

export const courseMeta = style([
	text.caption,
	{ marginTop: 3, color: vars.color.grey500 },
]);

// ── 실험 C: 권 카드 연산 기호 + 예시 문제 ──────────────────

export const courseBody = style({ flex: 1, minWidth: 0 });

export const courseOps = style({ display: 'flex', gap: 4, flexShrink: 0 });

const opColor = {
	'+': vars.color.blue700,
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

// ── 칸 제목 줄(로그인 이름·코드) ─────────────────────────────

export const ageLabelRow = style({
	display: 'flex',
	alignItems: 'center',
	minHeight: 26, // 고른 값(17px × 1.5)이 커져도 아래 카드가 밀리지 않게
	justifyContent: 'space-between',
	gap: 12,
	marginBottom: 10,
});

// 공용 sectionLabel 의 아래 여백(10px)은 ageLabelRow 가 대신 준다. && 로 우선순위를 올려 덮어쓴다
export const ageLabelText = style({ selectors: { '&&': { marginBottom: 0 } } });

// ── 유형(권을 고르면 펼쳐짐) ─────────────────────────────────

// NOTE: 53-1권이 20유형이 되며 한 줄씩이면 스크롤이 너무 길어 휴대폰부터 2열로(원장님 2026-10-29)
export const partList = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
	gap: 8,
	listStyle: 'none',
});

// courseItem 과 함께 쓴다 — 칸이 많아 높이·여백·둥글기를 줄인다
export const partItem = style({
	gap: 8,
	height: '100%',
	minHeight: 48,
	padding: '10px 12px',
	borderRadius: vars.radius.md,
});

export const partNumber = style([
	text.caption,
	{
		flexShrink: 0,
		display: 'grid',
		placeItems: 'center',
		width: 22,
		height: 22,
		borderRadius: vars.radius.full,
		fontWeight: vars.font.weight.bold,
		color: vars.color.grey600,
		background: vars.color.grey100,
		selectors: {
			[`${courseItem}[aria-checked="true"] &`]: {
				color: '#ffffff',
				background: vars.color.blue700,
			},
		},
	},
]);

export const partTitle = style([
	text.body2,
	{
		fontWeight: vars.font.weight.semibold,
		color: vars.color.grey900,
		// 좁은 2열에서 긴 이름(셋둘뺄셈 (받아내림 두 번))이 낱말 중간에서 끊기지 않게
		wordBreak: 'keep-all',
	},
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
			background: vars.color.blue700,
			boxShadow: vars.shadow.md,
		},
		'&:focus-visible': {
			outline: 'none',
			boxShadow: `0 0 0 1px ${vars.color.blue700}, ${vars.shadow.md}`,
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

/**
 * 권을 처음 고르면 «테스트 유형» 칸이 위에서부터 펼쳐지듯 나타난다(원장님 2026-10-29).
 * NOTE: 위쪽 끝을 고정하고 아래로 잘라 둔 부분(clip-path)을 넓힌다. 카드 그림자가 잘리지 않게 양옆·아래는 8px 바깥까지.
 */
const unfold = keyframes({
	from: {
		opacity: 0,
		transform: 'translateY(-6px)',
		clipPath: 'inset(-8px -8px 100% -8px)',
	},
	to: {
		opacity: 1,
		transform: 'none',
		clipPath: 'inset(-8px -8px -8px -8px)',
	},
});

// 유형별을 눌러 이 칸으로 스크롤할 때 위에 살짝 여백을 남긴다
export const modeField = style({
	scrollMarginTop: 16,
	'@media': {
		'(prefers-reduced-motion: no-preference)': {
			animation: `${unfold} 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)`,
		},
	},
});

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
				background: vars.color.blue700,
			},
		},
	},
]);

export const stepCheck = style({ width: 14, height: 14 });

// ── 로그인(2026-11-17) · 로그인 뒤 머리 띠 ─────────────────────

/** 로그인 칸들을 담는 흰 카드 */
export const loginCard = style({
	display: 'flex',
	flexDirection: 'column',
	gap: 20,
	padding: 20,
	borderRadius: vars.radius.lg,
	background: vars.color.layeredBackground,
	boxShadow: vars.shadow.sm,
	'@media': {
		[breakpoints.tablet]: { padding: 28 },
	},
});

export const remember = style([
	text.body2,
	{
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		color: vars.color.grey700,
		cursor: 'pointer',
	},
]);

export const rememberBox = style({
	width: 18,
	height: 18,
	accentColor: vars.color.blue700,
	cursor: 'pointer',
});

export const loginError = style([
	text.body2,
	{ color: vars.color.red500, wordBreak: 'keep-all' },
]);

/** 「챌린지 코드를 잃어버렸다면 학원으로 문의해 주세요.」 */
export const loginNote = style([
	text.caption,
	{
		marginTop: 14,
		textAlign: 'center',
		color: 'rgba(255, 255, 255, 0.85)',
		wordBreak: 'keep-all',
	},
]);

/** 로그인 뒤 머리 띠: 나이 뱃지 + 챌린지 참여 문구 */
export const heroMeta = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: 8,
	marginTop: 10,
});

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

export const heroStreak = style([
	text.body2,
	{
		fontWeight: vars.font.weight.semibold,
		color: '#ffffff',
		wordBreak: 'keep-all',
	},
]);

/** 머리 띠 오른쪽 «로그아웃» — 테마 버튼 옆 작은 글자 버튼 */
export const logoutButton = style([
	text.caption,
	{
		padding: '6px 10px',
		borderRadius: vars.radius.full,
		fontWeight: vars.font.weight.semibold,
		color: '#ffffff',
		border: 'none',
		background: 'rgba(255, 255, 255, 0.16)',
		cursor: 'pointer',
	},
]);

export const heroActions = style({
	display: 'flex',
	alignItems: 'center',
	gap: 8,
});

/** 로그인 화면 바탕: 파랑 단색, 카드를 화면 정중앙에(2026-11-17) */
export const loginPage = style({
	display: 'grid',
	placeItems: 'center',
	minHeight: '100dvh',
	padding: '24px 16px',
	background: vars.color.blue700,
});

export const loginInner = style({ width: '100%', maxWidth: 440 });

/** 카드 위 흰 로고(assets/logo-w.svg, 가로 642 : 세로 200) */
export const loginLogo = style({
	display: 'block',
	width: 150,
	height: 'auto',
	margin: '0 auto 20px',
	'@media': { [breakpoints.tablet]: { width: 180, marginBottom: 24 } },
});
