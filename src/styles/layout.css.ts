import { style, styleVariants } from '@vanilla-extract/css';
import { breakpoints, canHover, vars } from '@/styles/theme.css.ts';

export const page = style({
	display: 'flex',
	flexDirection: 'column',
	minHeight: '100dvh',
	background: vars.color.greyBackground,
});

const containerBase = style({
	width: '100%',
	margin: '0 auto',
	padding: '0 20px',
	'@media': {
		[breakpoints.tablet]: { padding: '0 32px' },
	},
});

/** 모바일은 꽉 차게, 넓은 화면에서는 화면 종류별 최대 폭으로 가운데 정렬 */
export const container = styleVariants({
	narrow: [containerBase, { maxWidth: 560 }],
	medium: [containerBase, { maxWidth: 800 }],
	wide: [containerBase, { maxWidth: 1280 }],
});

export const content = style({
	flex: 1,
	paddingTop: 28,
	paddingBottom: 32,
	'@media': {
		[breakpoints.tablet]: { paddingTop: 48 },
	},
});

export const card = style({
	padding: 20,
	borderRadius: 20,
	background: vars.color.layeredBackground,
	boxShadow: vars.shadow.sm,
});

/** 화면 아래에 붙는 주 버튼 영역. 위쪽은 바탕색으로 서서히 사라지게 한다. */
export const bottomBar = style({
	position: 'sticky',
	bottom: 0,
	zIndex: 2,
	paddingTop: 20,
	paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
	background: `linear-gradient(to bottom, transparent, ${vars.color.greyBackground} 20px)`,
	pointerEvents: 'none',
});

export const bottomBarInner = style({ pointerEvents: 'auto' });

export const primaryButton = style({
	width: '100%',
	height: 56,
	border: 'none',
	borderRadius: 16,
	fontSize: 17,
	fontWeight: 700,
	fontFamily: 'inherit',
	color: '#ffffff',
	background: vars.color.blue500,
	boxShadow: vars.shadow.sm,
	cursor: 'pointer',
	transition: 'background 0.15s, transform 0.1s, box-shadow 0.15s',
	selectors: {
		'&:active:not(:disabled)': {
			background: vars.color.blue600,
			transform: 'scale(0.98)',
		},
		'&:disabled': {
			color: vars.color.grey400,
			background: vars.color.grey200,
			boxShadow: 'none',
			cursor: 'not-allowed',
		},
	},
	'@media': {
		[canHover]: {
			selectors: {
				'&:hover:not(:disabled)': {
					background: vars.color.blue600,
					boxShadow: vars.shadow.md,
				},
			},
		},
	},
});

export const secondaryButton = style([
	primaryButton,
	{
		color: vars.color.grey700,
		background: vars.color.layeredBackground,
		selectors: {
			'&:active:not(:disabled)': { background: vars.color.grey100 },
		},
		'@media': {
			[canHover]: {
				selectors: {
					'&:hover:not(:disabled)': { background: vars.color.grey50 },
				},
			},
		},
	},
]);

export const title = style({
	fontSize: 26,
	fontWeight: 700,
	lineHeight: 1.35,
	letterSpacing: '-0.02em',
	color: vars.color.grey900,
	'@media': {
		[breakpoints.tablet]: { fontSize: 30 },
	},
});

export const subtitle = style({
	marginTop: 8,
	fontSize: 16,
	lineHeight: 1.5,
	color: vars.color.grey600,
});

export const sectionLabel = style({
	display: 'block',
	marginBottom: 10,
	fontSize: 15,
	fontWeight: 600,
	color: vars.color.grey600,
});
