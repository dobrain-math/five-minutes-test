import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.css.ts';

/** 색을 반투명으로 섞는다(ReportView.css.ts 와 같은 방식) */
const tint = (color: string, percent: number) =>
	`color-mix(in srgb, ${color} ${percent}%, transparent)`;

/**
 * 두뇌로수학 브랜드 띠(화면 폭 100% 파랑). 리포트 머리 띠와 홈 머리 띠가 함께 쓴다(2026-10-27 홈에도 넣어 통일).
 * 안쪽 여백·글자는 화면마다 따로 준다. 본문(옅은 회색 바탕 + 흰 카드)과 색으로 확실히 나눈다.
 * 단색이면 밋밋해서 대각선 그라데이션 + 옅은 원 장식으로 깊이를 준다.
 * 그림자는 은은하게 16%(원장님 2026-10-27: 60% 는 너무 강함 → 8% 로 줄였다가 16% 로 조정).
 * NOTE: 더 진한 쪽은 blue700 대신 blue500 에 검정을 섞는다 — 다크 팔레트는 50↔900 뒤집기라 blue700 이 밝아진다.
 */
export const brandBand = style({
	position: 'relative',
	overflow: 'hidden',
	color: '#ffffff',
	background: `linear-gradient(135deg, ${vars.color.blue500} 0%, color-mix(in srgb, ${vars.color.blue500} 72%, #000) 100%)`,
	borderRadius: `0 0 ${vars.radius.xl} ${vars.radius.xl}`,
	boxShadow: `0 6px 16px -8px ${tint(vars.color.blue500, 16)}`,
	selectors: {
		'&::before, &::after': {
			content: '""',
			position: 'absolute',
			borderRadius: '50%',
			background: 'rgba(255, 255, 255, 0.08)',
			pointerEvents: 'none',
		},
		'&::before': { width: 260, height: 260, top: -120, right: -60 },
		'&::after': { width: 160, height: 160, bottom: -90, right: 120 },
	},
});
