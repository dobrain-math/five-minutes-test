import type { ReactNode } from 'react';
import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts';
import type { Report } from '@/@types/test';
import { vars } from '@/styles/theme.css.ts';
import * as layout from '@/styles/utility.css.ts';
import { evaluate } from '@/utils/evaluate.ts';
import { formatDuration } from '@/utils/formatDuration.ts';
import { summarize } from '@/utils/summarize.ts';
import * as s from './ReportView.css.ts';

const BAR_HEIGHT = 44;

// recharts 는 SVG 속성으로 받으므로 토큰 문자열을 그대로 넘긴다.
const TICK_STYLE = {
	fontSize: vars.font.size.t8,
	fontFamily: vars.font.family,
};

const hideZero = (v: unknown) => (Number(v) > 0 ? String(v) : '');

type Props = {
	report: Report;
	/** 화면 아래에 붙는 버튼들. 내 결과와 공유받은 결과가 서로 다르다. */
	actions: ReactNode;
};

/** 리포트 본문. 방금 푼 결과(/report)와 공유 링크(/share)가 함께 쓴다. */
export default function ReportView({ report, actions }: Props) {
	const { studentName, studentAge, courseTitle, sections, wrong } = report;

	const chartData = sections.map((sec) => ({
		name: sec.title,
		correct: sec.correct,
		wrong: sec.total - sec.correct,
	}));
	// 유형마다 문제 수가 같으므로 눈금은 0 · 절반 · 전체 세 개면 충분하다(좁은 화면에서 겹침 방지).
	const perSection = Math.max(...sections.map((sec) => sec.total));
	const ticks = [0, Math.round(perSection / 2), perSection];

	const { strength, weakness } = summarize(sections);

	return (
		<main className={layout.page}>
			<div className={`${layout.container.medium} ${layout.content}`}>
				<header className={s.header}>
					<h1 className={layout.title}>{studentName} 학생 결과</h1>
					<p className={layout.subtitle}>
						{studentAge ? `${studentAge} · ${courseTitle}` : courseTitle}
					</p>
				</header>

				<div className={s.stats}>
					<div className={layout.card}>
						<div className={s.statLabel}>맞힌 문제</div>
						<div className={s.statValue}>
							{report.correct}
							<span className={s.statUnit}>/ {report.total}</span>
						</div>
					</div>
					<div className={layout.card}>
						<div className={s.statLabel}>걸린 시간</div>
						<div className={s.statValue}>
							{formatDuration(report.durationMs)}
						</div>
					</div>
				</div>

				<section className={`${layout.card} ${s.block}`}>
					<h2 className={s.blockTitle}>한 줄 평</h2>
					<ul className={s.verdictList}>
						<li className={s.verdict}>
							<span className={s.strengthBadge}>강점</span>
							<p className={s.verdictText}>{strength}</p>
						</li>
						<li className={s.verdict}>
							<span className={s.weaknessBadge}>취약점</span>
							<p className={s.verdictText}>{weakness}</p>
						</li>
					</ul>
				</section>

				<section className={`${layout.card} ${s.block}`}>
					<h2 className={s.blockTitle}>종합 평가</h2>
					<p className={s.evaluation}>{evaluate(report)}</p>
				</section>

				<section className={`${layout.card} ${s.block}`}>
					<h2 className={s.blockTitle}>유형별 정답·오답</h2>
					<div className={s.legend}>
						<span>
							<i
								className={s.legendDot}
								style={{ background: vars.color.green400 }}
							/>
							정답
						</span>
						<span>
							<i
								className={s.legendDot}
								style={{ background: vars.color.red400 }}
							/>
							오답
						</span>
					</div>
					<ResponsiveContainer
						width="100%"
						height={chartData.length * BAR_HEIGHT + 32}
					>
						<BarChart
							data={chartData}
							layout="vertical"
							margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
							barCategoryGap={8}
						>
							<CartesianGrid horizontal={false} stroke={vars.color.grey100} />
							<XAxis
								type="number"
								allowDecimals={false}
								domain={[0, perSection]}
								ticks={ticks}
								tick={{ ...TICK_STYLE, fill: vars.color.grey500 }}
								axisLine={false}
								tickLine={false}
							/>
							<YAxis
								type="category"
								dataKey="name"
								width={128}
								tick={{
									...TICK_STYLE,
									fontSize: vars.font.size.t7,
									fill: vars.color.grey700,
								}}
								axisLine={false}
								tickLine={false}
							/>
							<Bar
								dataKey="correct"
								stackId="a"
								fill={vars.color.green400}
								isAnimationActive={false}
							>
								<LabelList
									dataKey="correct"
									position="center"
									fill="#ffffff"
									fontSize={vars.font.size.t8}
									formatter={hideZero}
								/>
							</Bar>
							<Bar
								dataKey="wrong"
								stackId="a"
								fill={vars.color.red400}
								radius={[0, 4, 4, 0]}
								isAnimationActive={false}
							>
								<LabelList
									dataKey="wrong"
									position="center"
									fill="#ffffff"
									fontSize={vars.font.size.t8}
									formatter={hideZero}
								/>
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</section>

				<section className={`${layout.card} ${s.block}`}>
					<h2 className={s.blockTitle}>틀린 문제 {wrong.length}개</h2>
					{wrong.length === 0 ? (
						<p className={s.allCorrect}>모두 맞혔어요!</p>
					) : (
						<ul className={s.wrongList}>
							{wrong.map((q, i) => (
								<li key={i} className={s.wrongItem}>
									<div>
										<div className={s.wrongExpr}>{q.text}</div>
										<div className={s.wrongSection}>{q.sectionTitle}</div>
									</div>
									<div className={s.wrongAnswers}>
										<span className={s.mine}>{q.mine || '빈칸'}</span>
										<span className={s.correctAnswer}>{q.answer}</span>
									</div>
								</li>
							))}
						</ul>
					)}
				</section>
			</div>

			<div className={layout.bottomBar}>
				<div className={`${layout.container.medium} ${layout.bottomBarInner}`}>
					{actions}
				</div>
			</div>
		</main>
	);
}
