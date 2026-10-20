import type { SectionScore } from '@/@types/test';

export type Highlight = 'strong' | 'weak' | null;

/** 이 정답률 이상이면 충분히 익힌 유형(10문제 중 8개 이상) */
const STRONG_RATE = 0.8;
/** 이 정답률 이하면 연습이 필요한 유형(10문제 중 3개 이하) */
const WEAK_RATE = 0.3;

/**
 * 유형마다 strong·weak 표시를 정한다. 순서는 받은 순서 그대로.
 * NOTE: 다른 유형과 비교하지 않고 각 유형의 정답률만으로 정한다(2026-10-20 변경).
 * 그래서 여러 유형이 함께 표시될 수도, 하나도 표시되지 않을 수도 있다.
 */
export function highlightSections(sections: SectionScore[]): Highlight[] {
	return sections.map(({ correct, total }) => {
		if (total === 0) return null;
		// NOTE: 0.3 같은 소수 비교 오차를 피하려고 개수 쪽으로 옮겨 비교한다.
		if (correct >= total * STRONG_RATE - 1e-9) return 'strong';
		if (correct <= total * WEAK_RATE + 1e-9) return 'weak';
		return null;
	});
}
