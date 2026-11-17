import * as layout from '@/styles/utility.css.ts';
import type { ChallengeDay } from '@/utils/challenge.ts';
import * as s from './ReportView.css.ts';

/** '2026-11-17' → '11월 17일' */
const monthDay = (date: string) => {
	const [, m, d] = date.split('-').map(Number);
	return `${m}월 ${d}일`;
};

/** 리포트 아래 «챌린지 기록» — 시트에 쌓인 그 학생 기록(최근 것부터, 2026-11-17) */
export default function ChallengeHistory({
	history,
}: {
	history: ChallengeDay[];
}) {
	if (history.length === 0) return null;
	return (
		<section className={`${layout.card} ${s.historyCard}`}>
			<h2 className={s.blockTitle}>챌린지 기록 {history.length}일</h2>
			<ol className={s.historyList}>
				{[...history].reverse().map((day) => (
					<li key={day.date} className={s.historyRow}>
						<span className={s.historyDate}>{monthDay(day.date)}</span>
						<span className={s.historyScope}>
							{day.course} · {day.scope}
						</span>
						<span className={s.historyScore}>
							{day.correct} / {day.total}
						</span>
					</li>
				))}
			</ol>
		</section>
	);
}
