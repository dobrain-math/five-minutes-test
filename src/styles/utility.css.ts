import { style, styleVariants } from '@vanilla-extract/css';
import { breakpoints, canHover, vars } from '@/styles/theme.css.ts';
import { text } from '@/styles/typography.css.ts';

/** 페이지 바탕: 아주 옅은 회색(grey50) 위에 흰 카드를 올린다 */
const pageBackground = vars.color.grey50;

export const page = style({
	display: 'flex',
	flexDirection: 'column',
	minHeight: '100dvh',
	background: pageBackground,
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
	borderRadius: vars.radius.xl,
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
	background: `linear-gradient(to bottom, transparent, ${pageBackground} 20px)`,
	pointerEvents: 'none',
});

export const bottomBarInner = style({ pointerEvents: 'auto' });

export const primaryButton = style([
	text.body1,
	{
		width: '100%',
		height: 56,
		border: 'none',
		borderRadius: vars.radius.md,
		fontWeight: vars.font.weight.bold,
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
	},
]);

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

export const title = style([text.title1, { color: vars.color.grey900 }]);

export const subtitle = style([
	text.body2,
	{ marginTop: 8, fontSize: vars.font.size.t5, color: vars.color.grey600 },
]);

export const sectionLabel = style([
	text.label,
	{ display: 'block', marginBottom: 10, color: vars.color.grey600 },
]);

/** 제목 줄 오른쪽 끝에 작은 버튼(테마 토글 등)을 붙인다 */
export const titleRow = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: 12,
});
