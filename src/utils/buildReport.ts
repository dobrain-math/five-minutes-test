import type { Course, Question, Report } from '@/@types/test';
import { gradeBySection } from '@/utils/gradeBySection.ts';

type FinishedSession = {
	studentName: string;
	studentAge: string;
	questions: Question[];
	answers: Record<string, string>;
	startedAt: number;
	finishedAt: number;
};

/** 내 기기에서 푼 테스트를 리포트 화면·공유 링크가 쓰는 모양으로 바꾼다. */
export function buildReport(course: Course, session: FinishedSession): Report {
	const { questions, answers } = session;
	const results = gradeBySection(questions, answers);
	const titleOf = (id: string) =>
		course.sections.find((sec) => sec.id === id)?.title ?? id;

	// 그래프는 목차 순서로 보여준다.
	const sections = course.sections.map((sec) => {
		const r = results.find((x) => x.sectionId === sec.id);
		return { title: sec.title, correct: r?.correct ?? 0, total: r?.total ?? 0 };
	});

	return {
		studentName: session.studentName,
		studentAge: session.studentAge,
		courseTitle: course.title,
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
