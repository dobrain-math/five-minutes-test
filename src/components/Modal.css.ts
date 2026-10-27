import { globalStyle, keyframes, style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.css.ts';
import { text } from '@/styles/typography.css.ts';

// 화면 가운데 확인 창(<dialog> showModal). 시험 화면 «처음으로»·리포트 «링크 보내기»가 함께 쓴다(2026-10-22)
const modalIn = keyframes({
	from: { opacity: 0, transform: 'translateY(12px) scale(0.97)' },
	to: { opacity: 1, transform: 'none' },
});
const backdropIn = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });

export const modal = style({
	// NOTE: 전체 초기화(margin 0)가 <dialog> 의 가운데 정렬을 지워서 다시 준다
	margin: 'auto',
	width: 'calc(100% - 32px)',
	maxWidth: 400,
	padding: 0,
	border: 'none',
	borderRadius: vars.radius.xl,
	color: vars.color.grey900,
	background: vars.color.floatedBackground,
	boxShadow: vars.shadow.lg,
	selectors: {
		'&[open]': { animation: `${modalIn} 0.22s ease-out` },
		'&::backdrop': {
			background: 'rgba(0, 0, 0, 0.45)',
			animation: `${backdropIn} 0.22s ease-out`,
		},
	},
	'@media': {
		'(prefers-reduced-motion: reduce)': {
			selectors: {
				'&[open]': { animation: 'none' },
				'&::backdrop': { animation: 'none' },
			},
		},
	},
});

export const modalBody = style({ padding: '28px 20px 20px' });

export const modalTitle = style([
	text.title2,
	{ margin: 0, textAlign: 'center', color: vars.color.grey900 },
]);

export const modalText = style([
	text.body2,
	{
		margin: '10px 0 24px',
		textAlign: 'center',
		color: vars.color.grey600,
		wordBreak: 'keep-all',
	},
]);

export const modalButtons = style({ display: 'flex', gap: 8 });

/** 창 안 글 고치는 칸(리포트 공유 글). 창 바탕이 흰색이라 회색 바탕으로 구분한다 */
export const modalTextarea = style([
	text.body2,
	{
		display: 'block',
		width: '100%',
		minHeight: 196,
		margin: '-8px 0 20px',
		padding: '14px 16px',
		border: 'none',
		borderRadius: vars.radius.md,
		color: vars.color.grey900,
		background: vars.color.grey100,
		resize: 'vertical',
		outline: 'none',
		':focus': { boxShadow: `0 0 0 1px ${vars.color.blue500}` },
	},
]);

/** 창 바탕이 흰색이라 보조 버튼은 회색 바탕으로 구분한다 */
export const modalSecondary = style({
	background: vars.color.grey100,
	boxShadow: 'none',
});

// 포커스 링도 1px(색 테두리·포커스 링은 모두 1px 규칙). 브라우저 기본 굵은 검정 링 대신
globalStyle(`${modal} button:focus-visible`, {
	outline: `1px solid ${vars.color.blue500}`,
	outlineOffset: 2,
});
