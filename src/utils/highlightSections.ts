import type { SectionScore } from '@/@types/test';

export type Highlight = 'strong' | 'weak' | null;

/**
 * 유형마다 가장 잘한(strong)·가장 약한(weak) 표시를 정한다. 순서는 받은 순서 그대로.
 * NOTE: 맞힌 개수가 아니라 정답률로 비교한다. 모두 같으면 눈에 띄는 유형이 없으므로 표시하지 않는다.
 */
export function highlightSections(sections: SectionScore[]): Highlight[] {
	const rates = sections.map((s) =>
		s.total === 0 ? null : s.correct / s.total,
	);
	const valid = rates.filter((r): r is number => r !== null);
	const best = Math.max(...valid);
	const worst = Math.min(...valid);
	if (valid.length === 0 || best === worst) return sections.map(() => null);

	return rates.map((r) =>
		r === best ? 'strong' : r === worst ? 'weak' : null,
	);
}
