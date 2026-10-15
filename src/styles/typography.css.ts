import { styleVariants } from '@vanilla-extract/css';
import { breakpoints, vars } from '@/styles/theme.css.ts';

const { size, weight, lineHeight, letterSpacing } = vars.font;

/**
 * 글자 스타일 묶음. 컴포넌트에서는 style([text.title2, {...}]) 처럼 조합해서 쓴다.
 * 숫자가 세로로 줄 맞춰야 하는 곳(식·답·시간)은 number 를 함께 쓴다.
 */
export const text = styleVariants({
	/** 화면 제목 */
	title1: {
		fontSize: size.t2,
		fontWeight: weight.bold,
		lineHeight: lineHeight.tight,
		letterSpacing: letterSpacing.tight,
		'@media': { [breakpoints.tablet]: { fontSize: size.t1 } },
	},
	/** 큰 숫자(점수·시간) */
	display: {
		fontSize: size.t1,
		fontWeight: weight.bold,
		lineHeight: lineHeight.tight,
		letterSpacing: letterSpacing.tight,
	},
	/** 문제 식 */
	expression: {
		fontSize: size.t3,
		fontWeight: weight.semibold,
		lineHeight: lineHeight.tight,
	},
	/** 카드·섹션 제목 */
	title2: {
		fontSize: size.t5,
		fontWeight: weight.bold,
		lineHeight: lineHeight.tight,
	},
	/** 본문 강조 */
	body1: {
		fontSize: size.t5,
		fontWeight: weight.semibold,
		lineHeight: lineHeight.normal,
	},
	/** 본문 */
	body2: {
		fontSize: size.t6,
		fontWeight: weight.regular,
		lineHeight: lineHeight.normal,
	},
	/** 라벨 */
	label: {
		fontSize: size.t6,
		fontWeight: weight.semibold,
		lineHeight: lineHeight.normal,
	},
	/** 보조 설명 */
	caption: {
		fontSize: size.t7,
		fontWeight: weight.medium,
		lineHeight: lineHeight.normal,
	},
	/** 아주 작은 보조 설명 */
	caption2: {
		fontSize: size.t8,
		fontWeight: weight.regular,
		lineHeight: lineHeight.normal,
	},
	number: { fontVariantNumeric: 'tabular-nums' },
});
