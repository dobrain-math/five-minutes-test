import type { Course, Problem, Question, Rng } from '@/@types/test';

export const TOTAL_QUESTIONS = 80;

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

/** 유형마다 같은 개수(유형 안 중복 없음)로 80문제를 만들어 섞는다. */
export function buildTest(course: Course, rng: Rng = Math.random): Question[] {
	const perSection = TOTAL_QUESTIONS / course.sections.length;
	if (!Number.isInteger(perSection)) {
		throw new Error(
			`${course.title}: 유형 ${course.sections.length}개로는 ${TOTAL_QUESTIONS}문제를 같은 비율로 나눌 수 없습니다`,
		);
	}

	const questions = course.sections.flatMap((section) => {
		const seen = new Set<string>();
		const result: Question[] = [];
		for (let attempt = 0; result.length < perSection; attempt++) {
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
		return result;
	});

	return shuffle(questions, rng);
}
