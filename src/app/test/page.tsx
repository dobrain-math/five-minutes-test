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
	const { testId } = useParams();
	const navigate = useNavigate();
	const course = getCourse(testId);
	const {
		studentName,
		courseId,
		questions,
		answers,
		startedAt,
		finishedAt,
		start,
		setAnswer,
		finish,
	} = useTestSessionStore();
	const [confirming, setConfirming] = useState(false);
	const inputs = useRef<(HTMLInputElement | null)[]>([]);

	// 홈을 거치지 않고 주소로 바로 들어온 경우에만 새로 출제한다.
	// (채점한 테스트는 다시 출제하지 않는다 — 리포트가 그 결과를 읽어야 하므로)
	const needsNewTest =
		course !== undefined && (courseId !== testId || questions.length === 0);
	useEffect(() => {
		if (needsNewTest && testId) start(testId);
	}, [needsNewTest, testId, start]);

	const now = useNow(startedAt !== null && finishedAt === null);

	if (!course || studentName.trim() === '') return <Navigate to="/" replace />;
	if (needsNewTest) return null;
	if (finishedAt !== null) return <Navigate to={`/report/${testId}`} replace />;

	const answered = questions.filter((q) => answers[q.id]?.trim()).length;
	const blanks = questions.length - answered;

	const handleSubmit = () => {
		if (blanks > 0 && !confirming) {
			setConfirming(true);
			return;
		}
		finish();
		navigate(`/report/${testId}`);
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
							<span className={s.timer} aria-label="경과 시간">
								{formatDuration(now - (startedAt ?? now))}
							</span>
							<ThemeToggle />
						</span>
					</div>
					<div className={s.progressRow}>
						<div className={s.progressTrack}>
							<div
								className={s.progressFill}
								style={{ width: `${(answered / questions.length) * 100}%` }}
							/>
						</div>
						<span className={s.progressText}>
							{answered} / {questions.length}
						</span>
					</div>
				</div>
			</div>

			<ol className={`${layout.container.wide} ${s.grid}`}>
				{questions.map((q, i) => (
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
							enterKeyHint={i === questions.length - 1 ? 'done' : 'next'}
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
							아직 안 푼 문제가 {blanks}개 남았어요. 이대로 채점해 볼까요?
						</p>
					)}
					<div className={s.buttonRow}>
						{confirming && (
							<button
								type="button"
								className={layout.secondaryButton}
								onClick={() => setConfirming(false)}
							>
								조금 더 풀래요
							</button>
						)}
						<button
							type="button"
							className={layout.primaryButton}
							onClick={handleSubmit}
						>
							{confirming
								? '다 풀었어요'
								: `다 풀었어요 (${answered}/${questions.length})`}
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}
