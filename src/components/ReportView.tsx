import { type ReactNode, useState } from 'react';
import { HandThumbUpIcon, StarIcon } from '@heroicons/react/16/solid';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { Report } from '@/@types/test';
import * as layout from '@/styles/utility.css.ts';
import { evaluate } from '@/utils/evaluate.ts';
import { formatDuration } from '@/utils/formatDuration.ts';
import { highlightSections } from '@/utils/highlightSections.ts';
import * as s from './ReportView.css.ts';
import ThemeToggle from './ThemeToggle.tsx';

type Props = {
	report: Report;
	/** 화면 아래에 붙는 버튼들. 내 결과와 공유받은 결과가 서로 다르다. */
	actions: ReactNode;
};

/** 리포트 본문. 방금 푼 결과(/report)와 공유 링크(/share)가 함께 쓴다. */
export default function ReportView({ report, actions }: Props) {
	const { studentName, studentAge, courseTitle, sections, wrong } = report;
	const marks = highlightSections(sections);
	// 틀린 문제는 길어서 처음엔 접어 두고, 눌렀을 때만 펼친다.
	const [showWrong, setShowWrong] = useState(false);

	return (
		<main className={layout.page}>
			<div className={`${s.container} ${layout.content}`}>
				<header className={s.header}>
					<div className={layout.titleRow}>
						<h1 className={layout.title}>{studentName} 학생 결과</h1>
						<ThemeToggle />
					</div>
					<p className={layout.subtitle}>
						{studentAge ? `${studentAge} · ${courseTitle}` : courseTitle}
					</p>
				</header>

				{/* NOTE: PC 에서도 한 단. 점수 → 평가 → 유형별 → 틀린 문제 순으로 내려 읽는다. */}
				<div className={s.stack}>
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
						<h2 className={s.blockTitle}>선생님 한마디</h2>
						<p className={s.evaluation}>{evaluate(report)}</p>
					</section>

					<section className={`${layout.card} ${s.block}`}>
						<h2 className={s.blockTitle}>유형별로 살펴봐요</h2>
						{/* NOTE: 세로 막대는 유형 8개의 긴 이름이 휴대폰 폭에 안 들어가 한 줄씩 그린다. */}
						<ul className={s.sectionList}>
							{sections.map((sec, i) => {
								const mark = marks[i];
								return (
									<li
										key={sec.title}
										className={s.sectionRow}
										data-mark={mark ?? undefined}
									>
										<div className={s.sectionHead}>
											<span className={s.sectionName}>{sec.title}</span>
											{mark === 'strong' && (
												<span className={s.strengthBadge}>
													<HandThumbUpIcon
														className={s.badgeIcon}
														aria-hidden
													/>
													강점
												</span>
											)}
											{mark === 'weak' && (
												<span className={s.weaknessBadge}>
													<StarIcon className={s.badgeIcon} aria-hidden />
													연습 필요
												</span>
											)}
											<span className={s.sectionScore}>
												<b className={s.sectionCorrect}>{sec.correct}</b> /{' '}
												{sec.total}
											</span>
										</div>
										{/* NOTE: 1문제 = 1칸. 맞힌 칸을 앞에서부터 채운다(출제 순서는 아님). */}
										<div
											className={s.cells}
											role="img"
											aria-label={`${sec.total}문제 중 ${sec.correct}문제 정답`}
										>
											{Array.from({ length: sec.total }, (_, n) => (
												<span
													key={n}
													className={s.cell}
													data-correct={n < sec.correct}
												/>
											))}
										</div>
									</li>
								);
							})}
						</ul>
					</section>

					<section className={`${layout.card} ${s.block}`}>
						{wrong.length === 0 ? (
							<>
								<h2 className={s.blockTitle}>다시 볼 문제 0개</h2>
								<p className={s.allCorrect}>하나도 안 틀렸어요, 정말 멋져요!</p>
							</>
						) : (
							<>
								<h2>
									<button
										type="button"
										className={s.disclosure}
										aria-expanded={showWrong}
										aria-controls="wrong-list"
										onClick={() => setShowWrong((v) => !v)}
									>
										<span className={s.disclosureTitle}>
											다시 볼 문제 {wrong.length}개
										</span>
										<span className={s.disclosureAction}>
											{showWrong ? '접기' : '보기'}
											<ChevronDownIcon
												className={s.chevron}
												strokeWidth={2.25}
												data-open={showWrong}
												aria-hidden
											/>
										</span>
									</button>
								</h2>
								{showWrong && (
									<ul id="wrong-list" className={s.wrongList}>
										{wrong.map((q, i) => (
											<li key={i} className={s.wrongItem}>
												<div>
													<div className={s.wrongExpr}>{q.text}</div>
													<div className={s.wrongSection}>{q.sectionTitle}</div>
												</div>
												<div className={s.wrongAnswers}>
													<span className={s.mine}>{q.mine || '안 씀'}</span>
													<span className={s.correctAnswer}>{q.answer}</span>
												</div>
											</li>
										))}
									</ul>
								)}
							</>
						)}
					</section>
				</div>
			</div>

			<div className={layout.bottomBar}>
				<div className={`${s.container} ${layout.bottomBarInner}`}>
					{actions}
				</div>
			</div>
		</main>
	);
}
