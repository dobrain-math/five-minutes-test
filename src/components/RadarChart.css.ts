import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.css.ts';

const tint = (color: string, percent: number) =>
	`color-mix(in srgb, ${color} ${percent}%, transparent)`;

export const chart = style({
	display: 'block',
	width: '100%',
	maxWidth: 320,
	margin: '0 auto 8px',
	overflow: 'visible',
});

export const ring = style({
	fill: 'none',
	stroke: tint(vars.color.grey500, 22),
	strokeWidth: 1,
});

export const axis = style({
	stroke: tint(vars.color.grey500, 16),
	strokeWidth: 1,
});

export const ringLabel = style({
	fill: vars.color.grey400,
	fontSize: 10,
	fontFamily: vars.font.family,
});

/** 중심에서 살짝 커지며 나타난다. 움직임 줄이기 설정이면 끈다 */
const grow = keyframes({
	from: { opacity: 0, transform: 'scale(0.6)' },
	to: { opacity: 1, transform: 'none' },
});

export const data = style({
	transformOrigin: '150px 150px',
	'@media': {
		'(prefers-reduced-motion: no-preference)': {
			animation: `${grow} 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.35s both`,
		},
	},
});

export const area = style({
	fill: tint(vars.color.blue500, 18),
	stroke: vars.color.blue500,
	strokeWidth: 2,
	strokeLinejoin: 'round',
});

export const dot = style({
	fill: vars.color.blue500,
	stroke: vars.color.layeredBackground,
	strokeWidth: 2,
	selectors: {
		'&[data-mark="weak"]': { fill: vars.color.red500 },
	},
});

export const vertex = style({});

/** 꼭짓점 번호: 기본은 옅은 회색, 강점은 파랑·약점은 빨강 */
export const vertexCircle = style({
	fill: tint(vars.color.grey500, 14),
	selectors: {
		[`${vertex}[data-mark="strong"] &`]: { fill: vars.color.blue500 },
		[`${vertex}[data-mark="weak"] &`]: { fill: vars.color.red500 },
	},
});

export const vertexText = style({
	fill: vars.color.grey700,
	fontSize: 10,
	fontWeight: 700,
	fontFamily: vars.font.family,
	textAnchor: 'middle',
	dominantBaseline: 'central',
	selectors: {
		[`${vertex}[data-mark] &`]: { fill: '#ffffff' },
	},
});
