import { style } from '@vanilla-extract/css';
import { breakpoints, vars } from '@/styles/theme.css.ts';
import { text } from '@/styles/typography.css.ts';

export const topBar = style({
	position: 'sticky',
	top: 0,
	zIndex: 2,
	paddingTop: 'calc(12px + env(safe-area-inset-top))',
	paddingBottom: 12,
	background: vars.color.layeredBackground,
	boxShadow: vars.shadow.xs,
});

export const topRow = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: 12,
	marginBottom: 10,
});

export const courseName = style([
	text.title2,
	{
		flex: 1,
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		color: vars.color.grey800,
	},
]);

export const timer = style([
	text.title2,
	text.number,
	{
		flexShrink: 0,
		padding: '4px 12px',
		borderRadius: vars.radius.full,
		color: vars.color.blue600,
		background: vars.color.blue50,
	},
]);

export const progressRow = style({
	display: 'flex',
	alignItems: 'center',
	gap: 10,
});

export const progressTrack = style({
	flex: 1,
	height: 6,
	borderRadius: vars.radius.full,
	// NOTE: 다크에서 grey100 은 상단 바 바탕(layeredBackground)과 같은 색이라 막대가 사라졌다 → 반투명 tint(2026-10-22)
	background: `color-mix(in srgb, ${vars.color.grey500} 22%, transparent)`,
	overflow: 'hidden',
});

export const progressFill = style({
	height: '100%',
	borderRadius: vars.radius.full,
	background: vars.color.blue500,
	transition: 'width 0.2s',
});

export const progressText = style([
	text.caption,
	text.number,
	{
		flexShrink: 0,
		fontWeight: vars.font.weight.semibold,
		color: vars.color.grey500,
	},
]);

// 모바일 1열 → 태블릿 2열 → 노트북 3열 → 데스크톱 4열
/**
 * 시험 화면 폭. 넓은 화면에서 카드가 늘어나 식(n + m =)과 답 칸이 멀어지지 않게
 * 카드 한 칸이 300px 안팎이 되도록 열 수(1·2·3·4)에 맞춰 최대 폭을 둔다(원장님 2026-10-27).
 * 위 막대·문제 그리드·아래 버튼 줄이 같은 폭을 써서 좌우 끝이 맞는다.
 */
export const shell = style({
	width: '100%',
	maxWidth: 480,
	margin: '0 auto',
	paddingInline: 20,
	'@media': {
		// 2열: 300 × 2 + 간격 12 + 좌우 여백 64
		[breakpoints.tablet]: { maxWidth: 676, paddingInline: 32 },
		// 3열: 300 × 3 + 12 × 2 + 64
		[breakpoints.laptop]: { maxWidth: 988 },
		// 4열: 300 × 4 + 12 × 3 + 64
		[breakpoints.desktop]: { maxWidth: 1300 },
	},
});

export const grid = style({
	display: 'grid',
	gridTemplateColumns: '1fr',
	gap: 10,
	listStyle: 'none',
	paddingTop: 16,
	paddingBottom: 8,
	'@media': {
		[breakpoints.tablet]: {
			gridTemplateColumns: 'repeat(2, 1fr)',
			gap: 12,
			paddingTop: 24,
		},
		[breakpoints.laptop]: { gridTemplateColumns: 'repeat(3, 1fr)' },
		[breakpoints.desktop]: { gridTemplateColumns: 'repeat(4, 1fr)' },
	},
});

export const item = style({
	display: 'flex',
	alignItems: 'center',
	gap: 10,
	minHeight: 76,
	padding: '12px 12px 12px 14px',
	borderRadius: vars.radius.lg,
	background: vars.color.layeredBackground,
	boxShadow: vars.shadow.sm,
	transition: 'box-shadow 0.15s',
	selectors: {
		'&:focus-within': {
			boxShadow: `0 0 0 1px ${vars.color.blue500}, ${vars.shadow.md}`,
		},
	},
});

export const number = style([
	text.caption,
	text.number,
	{
		flexShrink: 0,
		display: 'grid',
		placeItems: 'center',
		width: 28,
		height: 28,
		borderRadius: vars.radius.xs,
		fontWeight: vars.font.weight.semibold,
		color: vars.color.grey500,
		background: vars.color.grey100,
		transition: 'color 0.15s, background 0.15s',
		selectors: {
			[`${item}[data-answered="true"] &`]: {
				color: vars.color.blue600,
				background: vars.color.blue50,
			},
		},
	},
]);

export const expression = style([
	text.expression,
	text.number,
	{
		flex: 1,
		minWidth: 0,
		color: vars.color.grey900,
		whiteSpace: 'nowrap',
	},
]);

// 답 칸은 바탕과 같은 아주 옅은 회색(grey50)으로, 카드 위에서 살짝만 구분되게 한다.
export const answerInput = style([
	text.expression,
	text.number,
	{
		flexShrink: 0,
		width: 84,
		height: 50,
		border: 'none',
		borderRadius: vars.radius.sm,
		fontWeight: vars.font.weight.bold,
		textAlign: 'center',
		color: vars.color.grey900,
		background: vars.color.grey50,
		boxShadow: `inset 0 0 0 1px ${vars.color.greyOpacity100}`,
		outline: 'none',
		transition: 'background 0.15s, box-shadow 0.15s',
		':focus': {
			background: vars.color.blue50,
			boxShadow: 'none',
		},
	},
]);

export const confirm = style([
	text.label,
	{
		maxWidth: 560,
		margin: '0 auto 10px',
		padding: '14px 16px',
		borderRadius: vars.radius.md,
		textAlign: 'center',
		color: vars.color.orange800,
		background: vars.color.layeredBackground,
		boxShadow: vars.shadow.md,
	},
]);

export const buttonRow = style({
	display: 'flex',
	gap: 8,
	maxWidth: 560,
	margin: '0 auto',
});

export const topActions = style({
	display: 'flex',
	alignItems: 'center',
	flexShrink: 0,
	gap: 8,
});

// 유형 줄: 「3 / 8」 뱃지 + 지금 유형 이름
export const sectionRow = style({
	display: 'flex',
	alignItems: 'center',
	gap: 8,
	marginBottom: 10,
});

export const pageBadge = style([
	text.caption,
	text.number,
	{
		flexShrink: 0,
		padding: '2px 8px',
		borderRadius: vars.radius.full,
		fontWeight: vars.font.weight.bold,
		color: vars.color.grey700,
		background: vars.color.grey100,
	},
]);

export const sectionTitle = style([
	text.body2,
	{
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		fontWeight: vars.font.weight.semibold,
		color: vars.color.grey700,
	},
]);

/**
 * 시험 화면 아래 버튼 줄. 터치 기기에서 답 칸에 커서가 있으면(자판이 떠 있으면) 아래로 내려 숨긴다.
 * NOTE: PC 는 키보드로 칸을 옮겨 다녀도 버튼이 늘 보여야 하므로 (pointer: coarse) 에서만 숨긴다.
 */
export const bottomBarAuto = style({
	transition: 'transform 0.2s ease-out, opacity 0.2s ease-out, visibility 0.2s',
	'@media': {
		'(pointer: coarse)': {
			selectors: {
				'&[data-typing="true"]': {
					transform: 'translateY(100%)',
					opacity: 0,
					visibility: 'hidden',
					pointerEvents: 'none',
				},
			},
		},
		'(prefers-reduced-motion: reduce)': { transition: 'none' },
	},
});
