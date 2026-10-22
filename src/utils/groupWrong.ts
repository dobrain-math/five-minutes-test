import type { SectionScore, WrongAnswer } from '@/@types/test';

export type WrongGroup = {
	/** 유형 번호(1부터). 목차에서 못 찾은 유형(깨진 옛 링크)은 null */
	number: number | null;
	title: string;
	items: WrongAnswer[];
};

/**
 * 틀린 문제를 유형별로 묶는다. 묶음은 유형 목차 순서, 묶음 안은 출제 순서 그대로.
 * 틀린 문제가 없는 유형은 뺀다.
 */
export function groupWrong(
	sections: SectionScore[],
	wrong: WrongAnswer[],
): WrongGroup[] {
	const groups = sections.map((sec, i) => ({
		number: (i + 1) as number | null,
		title: sec.title,
		items: wrong.filter((q) => q.sectionTitle === sec.title),
	}));
	const known = new Set(sections.map((sec) => sec.title));
	for (const q of wrong) {
		if (known.has(q.sectionTitle)) continue;
		let group = groups.find(
			(g) => g.number === null && g.title === q.sectionTitle,
		);
		if (!group) {
			group = { number: null, title: q.sectionTitle, items: [] };
			groups.push(group);
		}
		group.items.push(q);
	}
	return groups.filter((g) => g.items.length > 0);
}
