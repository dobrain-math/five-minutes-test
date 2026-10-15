import { Navigate, useNavigate, useParams } from 'react-router';
import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts';
import { getCourse } from '@/data/courses.ts';
import { useTestSession } from '@/stores/testSession.ts';
import * as layout from '@/styles/layout.css.ts';
import { vars } from '@/styles/theme.css.ts';
import { formatDuration } from '@/utils/formatDuration.ts';
import { gradeBySection } from '@/utils/gradeBySection.ts';
import * as s from './ReportPage.css.ts';

const BAR_HEIGHT = 44;

const hideZero = (v: unknown) => (Number(v) > 0 ? String(v) : '');

export default function ReportPage() {
	const { testId } = useParams();
	const navigate = useNavigate();
	const course = getCourse(testId);
	const { studentName, courseId, questions, answers, startedAt, finishedAt } =
		useTestSession();

	if (
		!course ||
		courseId !== testId ||
		startedAt === null ||
		finishedAt === null
	) {
		return <Navigate to="/" replace />;
	}

	const results = gradeBySection(questions, answers);
	const correct = results.reduce((sum, r) => sum + r.correct, 0);
	const titleOf = (id: string) =>
		course.sections.find((sec) => sec.id === id)?.title ?? id;

	// 그래프는 목차 순서로 보여준다.
	const chartData = course.sections.map((sec) => {
		const r = results.find((x) => x.sectionId === sec.id);
		const ok = r?.correct ?? 0;
		return { name: sec.title, correct: ok, wrong: (r?.total ?? 0) - ok };
	});
	// 유형마다 문제 수가 같으므로 눈금은 0 · 절반 · 전체 세 개면 충분하다(좁은 화면에서 겹침 방지).
	const perSection = Math.max(...chartData.map((d) => d.correct + d.wrong));
	const ticks = [0, Math.round(perSection / 2), perSection];

	const wrong = questions.filter((q) => answers[q.id]?.trim() !== q.answer);

	return (
		<main className={layout.page}>
			<div className={`${layout.container.medium} ${layout.content}`}>
				<header className={s.header}>
					<h1 className={layout.title}>{studentName} 학생 결과</h1>
					<p className={layout.subtitle}>{course.title}</p>
				</header>

				<div className={s.stats}>
					<div className={layout.card}>
						<div className={s.statLabel}>맞힌 문제</div>
						<div className={s.statValue}>
							{correct}
							<span className={s.statUnit}>/ {questions.length}</span>
						</div>
					</div>
					<div className={layout.card}>
						<div className={s.statLabel}>걸린 시간</div>
						<div className={s.statValue}>
							{formatDuration(finishedAt - startedAt)}
						</div>
					</div>
				</div>

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
								tick={{ fontSize: 12, fill: vars.color.grey500 }}
								axisLine={false}
								tickLine={false}
							/>
							<YAxis
								type="category"
								dataKey="name"
								width={104}
								tick={{ fontSize: 13, fill: vars.color.grey700 }}
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
									fontSize={12}
									formatter={hideZero}
								/>
							</Bar>
							<Bar
								dataKey="wrong"
								stackId="a"
								fill={vars.color.red400}
								radius={[0, 6, 6, 0]}
								isAnimationActive={false}
							>
								<LabelList
									dataKey="wrong"
									position="center"
									fill="#ffffff"
									fontSize={12}
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
							{wrong.map((q) => (
								<li key={q.id} className={s.wrongItem}>
									<div>
										<div className={s.wrongExpr}>{q.text}</div>
										<div className={s.wrongSection}>{titleOf(q.sectionId)}</div>
									</div>
									<div className={s.wrongAnswers}>
										<span className={s.mine}>
											{answers[q.id]?.trim() || '빈칸'}
										</span>
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
					<div className={s.bottomButton}>
						<button
							type="button"
							className={layout.primaryButton}
							onClick={() => navigate('/')}
						>
							처음으로
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}
