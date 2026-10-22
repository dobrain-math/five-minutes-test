import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import ThemeToggle from '@/components/ThemeToggle.tsx';
import { getCourse } from '@/data/courses.ts';
import { useTestSessionStore } from '@/store/useTestSessionStore.ts';
import * as layout from '@/styles/utility.css.ts';
import { formatDuration } from '@/utils/formatDuration.ts';
import * as s from './page.css.ts';

function useNow(active: boolean) {
	const [now, setNow] = useState(Date.now);
	useEffect(() => {
		if (!active) return;
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, [active]);
	return now;
}

export default function TestPage() {
	const { testId, part: partParam } = useParams();
	const navigate = useNavigate();
	const course = getCourse(testId);
	// 주소 끝 번호(1부터) = 한 유형 풀이, 없으면 전체 풀기
	const urlPart = partParam === undefined ? null : Number(partParam) - 1;
	const validPart =
		urlPart === null ||
		(Number.isInteger(urlPart) && course?.sections[urlPart] !== undefined);
	const {
		studentName,
		courseId,
		part,
		questions,
		answers,
		startedAt,
		finishedAt,
		page,
		pageStartedAt,
		start,
		setAnswer,
		nextPage,
		finish,
	} = useTestSessionStore();
	const [confirming, setConfirming] = useState(false);
	const inputs = useRef<(HTMLInputElement | null)[]>([]);

	// 홈을 거치지 않고 주소로 바로 들어온 경우에만 새로 출제한다.
	// (채점한 테스트는 다시 출제하지 않는다 — 리포트가 그 결과를 읽어야 하므로)
	const needsNewTest =
		course !== undefined &&
		validPart &&
		(courseId !== testId || part !== urlPart || questions.length === 0);
	useEffect(() => {
		if (needsNewTest && testId) start(testId, urlPart);
	}, [needsNewTest, testId, urlPart, start]);

	const now = useNow(startedAt !== null && finishedAt === null);
	const reportPath = `/report/${testId}${partParam ? `/${partParam}` : ''}`;

	if (!course || !validPart || studentName.trim() === '')
		return <Navigate to="/" replace />;
	if (needsNewTest) return null;
	if (finishedAt !== null) return <Navigate to={reportPath} replace />;

	// 전체 풀기는 유형마다 한 페이지. 한 유형 풀이는 한 페이지뿐이다.
	const pageCount = part === null ? course.sections.length : 1;
	const section = course.sections[part ?? page];
	const pageQuestions =
		part === null
			? questions.filter((q) => q.sectionId === section.id)
			: questions;
	const isLastPage = page >= pageCount - 1;

	const answered = pageQuestions.filter((q) => answers[q.id]?.trim()).length;
	const blanks = pageQuestions.length - answered;

	const handleSubmit = () => {
		if (blanks > 0 && !confirming) {
			setConfirming(true);
			return;
		}
		setConfirming(false);
		if (!isLastPage) {
			nextPage();
			window.scrollTo({ top: 0 });
			return;
		}
		finish();
		navigate(reportPath);
	};

	const focusNext = (i: number) => {
		const next = inputs.current[i + 1];
		if (next) next.focus();
		else inputs.current[i]?.blur();
	};

	return (
		<main className={layout.page}>
			<div className={s.topBar}>
				<div className={layout.container.wide}>
					<div className={s.topRow}>
						<span className={s.courseName}>
							{studentName} · {course.title}
						</span>
						<span className={s.topActions}>
							<span className={s.timer} aria-label="이 유형 경과 시간">
								{formatDuration(now - (pageStartedAt ?? now))}
							</span>
							<ThemeToggle />
						</span>
					</div>
					{/* NOTE: 전체 풀기는 「3 / 8」 페이지 번호, 한 유형 풀이는 유형 번호. 타이머는 이 페이지 시간이다. */}
					<div className={s.sectionRow}>
						<span className={s.pageBadge}>
							{part === null ? `${page + 1} / ${pageCount}` : `${part + 1}번`}
						</span>
						<span className={s.sectionTitle}>{section.title}</span>
					</div>
					<div className={s.progressRow}>
						<div className={s.progressTrack}>
							<div
								className={s.progressFill}
								style={{ width: `${(answered / pageQuestions.length) * 100}%` }}
							/>
						</div>
						<span className={s.progressText}>
							{answered} / {pageQuestions.length}
						</span>
					</div>
				</div>
			</div>

			<ol className={`${layout.container.wide} ${s.grid}`}>
				{pageQuestions.map((q, i) => (
					<li
						key={q.id}
						className={s.item}
						data-answered={Boolean(answers[q.id])}
					>
						<span className={s.number}>{i + 1}</span>
						<label htmlFor={q.id} className={s.expression}>
							{q.text} =
						</label>
						<input
							id={q.id}
							ref={(el) => {
								inputs.current[i] = el;
							}}
							className={s.answerInput}
							type="text"
							inputMode="numeric"
							pattern="[0-9]*"
							autoComplete="off"
							enterKeyHint={i === pageQuestions.length - 1 ? 'done' : 'next'}
							maxLength={4}
							value={answers[q.id] ?? ''}
							onChange={(e) => {
								setAnswer(q.id, e.target.value.replace(/\D/g, ''));
								setConfirming(false);
							}}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									focusNext(i);
								}
							}}
						/>
					</li>
				))}
			</ol>

			<div className={layout.bottomBar}>
				<div className={`${layout.container.wide} ${layout.bottomBarInner}`}>
					{confirming && (
						<p className={s.confirm} role="alert">
							아직 안 푼 문제가 {blanks}개 남았습니다. 그래도{' '}
							{isLastPage ? '채점할까요' : '다음 유형으로 넘어갈까요'}?
						</p>
					)}
					<div className={s.buttonRow}>
						{confirming && (
							<button
								type="button"
								className={layout.secondaryButton}
								onClick={() => setConfirming(false)}
							>
								더 풀기
							</button>
						)}
						<button
							type="button"
							className={layout.primaryButton}
							onClick={handleSubmit}
						>
							{isLastPage ? '채점하기' : '다음 유형'}
							{!confirming && ` (${answered}/${pageQuestions.length})`}
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}
