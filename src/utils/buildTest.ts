import type { Course, Problem, Question, Rng, SectionDef } from '@/@types/test';

/** 유형 하나에서 내는 문제 수. 전체 풀기는 유형마다 이만큼씩 한 페이지가 된다. */
export const PER_SECTION = 24;

const SYMBOL = { '+': '+', '-': '−', '×': '×' } as const;

const solve = ({ left, op, right }: Problem) =>
	op === '+' ? left + right : op === '-' ? left - right : left * right;

const shuffle = <T>(items: T[], rng: Rng) => {
	for (let i = items.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[items[i], items[j]] = [items[j], items[i]];
	}
	return items;
};

/** 한 유형에서 서로 다른 문제 PER_SECTION 개를 만들어 그 안에서만 섞는다. */
function buildSection(section: SectionDef, rng: Rng): Question[] {
	const seen = new Set<string>();
	const result: Question[] = [];
	for (let attempt = 0; result.length < PER_SECTION; attempt++) {
		if (attempt > 10_000) {
			throw new Error(
				`${section.title}: 서로 다른 문제를 충분히 만들 수 없습니다`,
			);
		}
		const problem = section.generate(rng, result.length);
		const text = `${problem.left} ${SYMBOL[problem.op]} ${problem.right}`;
		if (seen.has(text)) continue;
		seen.add(text);
		result.push({
			id: `${section.id}#${result.length}`,
			sectionId: section.id,
			text,
			answer: String(solve(problem)),
		});
	}
	return shuffle(result, rng);
}

/**
 * part = 유형 번호(0부터)면 그 유형만, null 이면 전체(유형 목차 순서대로 PER_SECTION 개씩).
 * NOTE: 전체 풀기는 유형마다 한 페이지라 유형끼리는 섞지 않는다(2026-10-22).
 */
export function buildTest(
	course: Course,
	part: number | null = null,
	rng: Rng = Math.random,
): Question[] {
	if (part === null) {
		return course.sections.flatMap((section) => buildSection(section, rng));
	}
	const section = course.sections[part];
	if (!section)
		throw new Error(`${course.title}: ${part + 1}번 유형이 없습니다`);
	return buildSection(section, rng);
}
