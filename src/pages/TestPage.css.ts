import { style } from '@vanilla-extract/css';
import { breakpoints, vars } from '@/styles/theme.css.ts';

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

export const courseName = style({
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	fontSize: 16,
	fontWeight: 700,
	color: vars.color.grey800,
});

export const timer = style({
	flexShrink: 0,
	padding: '4px 12px',
	borderRadius: 999,
	fontSize: 17,
	fontWeight: 700,
	fontVariantNumeric: 'tabular-nums',
	color: vars.color.blue600,
	background: vars.color.blue50,
});

export const progressRow = style({
	display: 'flex',
	alignItems: 'center',
	gap: 10,
});

export const progressTrack = style({
	flex: 1,
	height: 6,
	borderRadius: 3,
	background: vars.color.grey100,
	overflow: 'hidden',
});

export const progressFill = style({
	height: '100%',
	borderRadius: 3,
	background: vars.color.blue500,
	transition: 'width 0.2s',
});

export const progressText = style({
	flexShrink: 0,
	fontSize: 13,
	fontWeight: 600,
	color: vars.color.grey500,
	fontVariantNumeric: 'tabular-nums',
});

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
	borderRadius: 18,
	background: vars.color.layeredBackground,
	boxShadow: vars.shadow.sm,
	transition: 'box-shadow 0.15s',
	selectors: {
		'&:focus-within': {
			boxShadow: `0 0 0 2px ${vars.color.blue500}, ${vars.shadow.md}`,
		},
	},
});

export const number = style({
	flexShrink: 0,
	display: 'grid',
	placeItems: 'center',
	width: 28,
	height: 28,
	borderRadius: 9,
	fontSize: 13,
	fontWeight: 600,
	color: vars.color.grey500,
	background: vars.color.grey100,
	fontVariantNumeric: 'tabular-nums',
	transition: 'color 0.15s, background 0.15s',
	selectors: {
		[`${item}[data-answered="true"] &`]: {
			color: vars.color.blue600,
			background: vars.color.blue50,
		},
	},
});

export const expression = style({
	flex: 1,
	minWidth: 0,
	fontSize: 22,
	fontWeight: 600,
	color: vars.color.grey900,
	fontVariantNumeric: 'tabular-nums',
	whiteSpace: 'nowrap',
});

export const answerInput = style({
	flexShrink: 0,
	width: 84,
	height: 50,
	border: 'none',
	borderRadius: 12,
	fontSize: 22,
	fontWeight: 700,
	fontFamily: 'inherit',
	textAlign: 'center',
	color: vars.color.grey900,
	background: vars.color.grey100,
	outline: 'none',
	fontVariantNumeric: 'tabular-nums',
	transition: 'background 0.15s',
	':focus': { background: vars.color.blue50 },
});

export const confirm = style({
	maxWidth: 560,
	margin: '0 auto 10px',
	padding: '14px 16px',
	borderRadius: 16,
	fontSize: 15,
	fontWeight: 600,
	textAlign: 'center',
	color: vars.color.orange800,
	background: vars.color.layeredBackground,
	boxShadow: vars.shadow.md,
});

export const buttonRow = style({
	display: 'flex',
	gap: 8,
	maxWidth: 560,
	margin: '0 auto',
});
