import { type ReactNode, useState } from 'react';
import { HandThumbUpIcon, StarIcon } from '@heroicons/react/16/solid';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { Report } from '@/@types/test';
import * as layout from '@/styles/utility.css.ts';
import { evaluate } from '@/utils/evaluate.ts';
import { formatTestDate } from '@/utils/formatDate.ts';
import { formatDuration } from '@/utils/formatDuration.ts';
import { groupWrong } from '@/utils/groupWrong.ts';
import { highlightSections } from '@/utils/highlightSections.ts';
import RadarChart from './RadarChart.tsx';
import * as s from './ReportView.css.ts';
import ThemeToggle from './ThemeToggle.tsx';

const MARK_LABEL = { strong: '강점', weak: '약점' } as const;

type Props = {
	report: Report;
	/** 화면 아래에 붙는 버튼들. 공유받은 결과(/share)는 버튼이 없다. */
	actions?: ReactNode;
};

/** 리포트 본문. 방금 푼 결과(/report)와 공유 링크(/share)가 함께 쓴다. */
export default function ReportView({ report, actions }: Props) {
	const {
		studentName,
		studentAge,
		courseTitle,
		part,
		finishedAt,
		sections,
		wrong,
	} = report;
	const marks = highlightSections(sections);
	// 틀린 문제는 길어서 처음엔 접어 두고, 눌렀을 때만 펼친다.
	const [showWrong, setShowWrong] = useState(false);

	return (
		<main className={layout.page}>
			{/* NOTE: 화면 폭 100% 머리 띠. 들어오자마자 「리포트」로 보이게 본문과 색으로 나눈다. */}
			<header className={s.hero}>
				<div className={`${s.container} ${s.heroInner}`}>
					<div className={layout.titleRow}>
						<h1 className={s.heroTitle}>두뇌로수학 테스트 결과 리포트</h1>
						<ThemeToggle />
					</div>
					<div className={s.heroStudent}>
						<span className={s.heroName}>{studentName}</span>
						{studentAge && <span className={s.heroBadge}>{studentAge}</span>}
						<span className={s.heroBadge}>{courseTitle}</span>
					</div>
					{/* NOTE: 한 유형만 풀었으면 어떤 유형인지 머리 띠에 적는다(2026-10-22). */}
					{part !== undefined && (
						<p className={s.heroPart}>
							{part + 1}번 유형 · {sections[0]?.title}
						</p>
					)}
					{/* NOTE: 날짜를 싣기 전에 만든 옛 공유 링크에는 실시일이 없다. */}
					{finishedAt !== undefined && (
						<p className={s.heroDate}>
							테스트 실시일 {formatTestDate(finishedAt)}
						</p>
					)}
				</div>
			</header>

			<div className={`${s.container} ${s.body}`}>
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
						<h2 className={s.blockTitle}>종합 평가</h2>
						<p className={s.evaluation}>{evaluate(report)}</p>
					</section>

					{/* NOTE: 한 유형만 풀었으면 이 칸은 없다. 전체 풀기만 레이더 + 유형 목록(2026-10-22). */}
					{part === undefined && (
						<section className={`${layout.card} ${s.block}`}>
							<h2 className={s.blockTitle}>풀이 스타일 분석</h2>
							<RadarChart sections={sections} marks={marks} />
							<ul className={s.sectionList}>
								{sections.map((sec, i) => {
									const mark = marks[i];
									return (
										<li
											key={sec.title}
											className={s.sectionRow}
											data-mark={mark ?? undefined}
										>
											{/* NOTE: 번호·이름(왼쪽) + 강점·약점(오른쪽). 태블릿 2열 구간(640~767px)에서만 아이콘만 남는다. */}
											<div className={s.sectionHead}>
												<span className={s.sectionName}>
													<span
														className={s.sectionNumber}
														data-mark={mark ?? undefined}
													>
														{i + 1}
													</span>
													{sec.title}
												</span>
												{mark && (
													<span
														className={
															mark === 'strong'
																? s.strengthBadge
																: s.weaknessBadge
														}
														title={MARK_LABEL[mark]}
														aria-label={MARK_LABEL[mark]}
													>
														{mark === 'strong' ? (
															<HandThumbUpIcon
																className={s.badgeIcon}
																aria-hidden
															/>
														) : (
															<StarIcon className={s.badgeIcon} aria-hidden />
														)}
														<span className={s.badgeLabel} aria-hidden>
															{MARK_LABEL[mark]}
														</span>
													</span>
												)}
											</div>
											{/* NOTE: 이름 줄 아래에 «걸린 시간(왼쪽) · 맞힌 수(오른쪽)». 옛 링크는 시간이 없다. */}
											<div className={s.sectionBody}>
												<span className={s.sectionTime}>
													{sec.durationMs !== undefined &&
														`걸린 시간 ${formatDuration(sec.durationMs)}`}
												</span>
												{/* NOTE: 맞힌 수 뱃지는 폭이 고정이라 줄마다 칸 크기·위치가 같다. */}
												<span className={s.scoreBadge}>
													<b className={s.sectionCorrect}>{sec.correct}</b> /{' '}
													{sec.total}
												</span>
											</div>
										</li>
									);
								})}
							</ul>
						</section>
					)}

					<section className={`${layout.card} ${s.block}`}>
						{wrong.length === 0 ? (
							<>
								<h2 className={s.blockTitle}>틀린 문제 0개</h2>
								<p className={s.allCorrect}>모든 문제를 맞혔습니다!</p>
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
											틀린 문제 {wrong.length}개
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
								{/* NOTE: 유형별로 묶어 보여 준다(2026-10-22). 한 유형 풀이는 묶음이 하나라 제목 줄을 생략한다. */}
								{showWrong && (
									<div id="wrong-list" className={s.wrongGroups}>
										{groupWrong(sections, wrong).map((group) => (
											<div key={group.title}>
												{part === undefined && (
													<h3 className={s.wrongGroupTitle}>
														{group.number !== null && (
															<span
																className={s.sectionNumber}
																data-mark={marks[group.number - 1] ?? undefined}
															>
																{group.number}
															</span>
														)}
														<span className={s.wrongGroupName}>
															{group.title}
														</span>
														<span className={s.wrongGroupCount}>
															{group.items.length}개
														</span>
													</h3>
												)}
												<ul className={s.wrongList}>
													{group.items.map((q, i) => (
														<li key={i} className={s.wrongItem}>
															<div className={s.wrongExpr}>{q.text}</div>
															<div className={s.wrongAnswers}>
																<span className={s.mine}>
																	{q.mine || '빈칸'}
																</span>
																<span className={s.correctAnswer}>
																	{q.answer}
																</span>
															</div>
														</li>
													))}
												</ul>
											</div>
										))}
									</div>
								)}
							</>
						)}
					</section>
				</div>
			</div>

			{actions && (
				<div className={layout.bottomBar}>
					<div className={`${s.container} ${layout.bottomBarInner}`}>
						{actions}
					</div>
				</div>
			)}
		</main>
	);
}
