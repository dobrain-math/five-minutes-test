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
	background: vars.color.grey100,
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
			boxShadow: `0 0 0 2px ${vars.color.blue500}, ${vars.shadow.md}`,
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
