import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.css.ts';

/** 왼쪽에서 오른쪽으로 옅은 빛이 지나간다. opacity·background-position 만 움직여 가볍다 */
const shimmer = keyframes({
	from: { backgroundPosition: '100% 0' },
	to: { backgroundPosition: '-100% 0' },
});

export const bar = style({
	borderRadius: vars.radius.xs,
	// NOTE: 회색을 반투명으로 섞어 라이트·다크 모두 카드 위에서 옅게 보인다.
	background: `linear-gradient(90deg, color-mix(in srgb, ${vars.color.grey500} 12%, transparent) 25%, color-mix(in srgb, ${vars.color.grey500} 22%, transparent) 50%, color-mix(in srgb, ${vars.color.grey500} 12%, transparent) 75%)`,
	backgroundSize: '200% 100%',
	'@media': {
		'(prefers-reduced-motion: no-preference)': {
			animation: `${shimmer} 1.4s ease-in-out infinite`,
		},
	},
});

/** 파란 머리 띠 위에서는 흰 반투명 */
export const onBlue = style({
	background:
		'linear-gradient(90deg, rgba(255,255,255,0.16) 25%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.16) 75%)',
	backgroundSize: '200% 100%',
});

export const row = style({
	display: 'flex',
	gap: 6,
	marginTop: 20,
});

export const stack = style({
	display: 'flex',
	flexDirection: 'column',
	gap: 16,
});
