import type { Question, SectionResult } from '@/types/test.ts';

export function gradeBySection(
	questions: Question[],
	answers: Record<string, string>,
): SectionResult[] {
	const results = new Map<string, SectionResult>();
	for (const q of questions) {
		const r = results.get(q.sectionId) ?? {
			sectionId: q.sectionId,
			correct: 0,
			total: 0,
		};
		r.total += 1;
		if (answers[q.id]?.trim() === q.answer) r.correct += 1;
		results.set(q.sectionId, r);
	}
	return [...results.values()];
}
