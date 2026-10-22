import type { Course, Question, Report } from '@/@types/test';
import { gradeBySection } from '@/utils/gradeBySection.ts';

type FinishedSession = {
	studentName: string;
	studentAge: string;
	questions: Question[];
	answers: Record<string, string>;
	startedAt: number;
	finishedAt: number;
	/** 푼 유형 번호(0부터). null·없음 = 전체 풀기 */
	part?: number | null;
	/** 페이지(= 유형)마다 걸린 시간 ms. 한 유형 풀이는 하나 */
	pageTimes?: number[];
};

/** 내 기기에서 푼 테스트를 리포트 화면·공유 링크가 쓰는 모양으로 바꾼다. */
export function buildReport(course: Course, session: FinishedSession): Report {
	const { questions, answers, part = null, pageTimes } = session;
	const results = gradeBySection(questions, answers);
	const titleOf = (id: string) =>
		course.sections.find((sec) => sec.id === id)?.title ?? id;

	// 그래프는 목차 순서로 보여준다. 한 유형만 풀었으면 그 유형 하나.
	const solved =
		part === null ? course.sections : course.sections.slice(part, part + 1);
	const sections = solved.map((sec, i) => {
		const r = results.find((x) => x.sectionId === sec.id);
		return {
			title: sec.title,
			correct: r?.correct ?? 0,
			total: r?.total ?? 0,
			...(pageTimes?.[i] !== undefined && { durationMs: pageTimes[i] }),
		};
	});

	return {
		studentName: session.studentName,
		studentAge: session.studentAge,
		courseId: course.id,
		courseTitle: course.title,
		...(part !== null && { part }),
		correct: sections.reduce((sum, sec) => sum + sec.correct, 0),
		total: questions.length,
		durationMs: session.finishedAt - session.startedAt,
		finishedAt: session.finishedAt,
		sections,
		wrong: questions
			.filter((q) => answers[q.id]?.trim() !== q.answer)
			.map((q) => ({
				text: q.text,
				mine: answers[q.id]?.trim() ?? '',
				answer: q.answer,
				sectionTitle: titleOf(q.sectionId),
			})),
	};
}
