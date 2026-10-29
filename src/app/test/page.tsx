import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { HomeIcon } from '@heroicons/react/24/outline';
import * as modal from '@/components/Modal.css.ts';
import Modal from '@/components/Modal.tsx';
import * as themeButton from '@/components/ThemeToggle.css.ts';
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
		pageStartedAt,
		start,
		setAnswer,
		finish,
	} = useTestSessionStore();
	const [confirming, setConfirming] = useState(false);
	const [leaving, setLeaving] = useState(false);
	const inputs = useRef<(HTMLInputElement | null)[]>([]);
	// 답 칸에 커서가 있는 동안(= 휴대폰 자판이 떠 있는 동안) 아래 버튼 줄을 숨긴다(원장님 결정 2026-10-22).
	// NOTE: 자판 바로 위로 올라온 버튼 줄이 지금 풀 문제를 가렸다. 숨기는 건 터치 기기만(page.css.ts bottomBarAuto).
	const [typing, setTyping] = useState(false);
	const blurTimer = useRef<number | undefined>(undefined);
	const handleFocus = () => {
		window.clearTimeout(blurTimer.current);
		setTyping(true);
	};
	// 다음 칸으로 옮겨 갈 때 잠깐 생기는 blur 로 버튼이 깜빡이지 않게 조금 기다렸다가 판단한다
	const handleBlur = () => {
		window.clearTimeout(blurTimer.current);
		blurTimer.current = window.setTimeout(() => {
			if (!inputs.current.includes(document.activeElement as HTMLInputElement))
				setTyping(false);
		}, 120);
	};
	useEffect(() => () => window.clearTimeout(blurTimer.current), []);
	// 안드로이드 «뒤로»로 자판만 내리면 커서가 칸에 남는다 → 화면 높이가 다시 커지면(자판이 내려가면) 버튼 줄을 다시 보인다
	useEffect(() => {
		const vv = window.visualViewport;
		if (!vv) return;
		let tallest = vv.height;
		const onResize = () => {
			tallest = Math.max(tallest, vv.height);
			if (vv.height > tallest - 120) setTyping(false);
		};
		vv.addEventListener('resize', onResize);
		return () => vv.removeEventListener('resize', onResize);
	}, []);

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

	// NOTE: 전체 풀기도 2026-10-29 부터 한 페이지(유형마다 FULL_PER_SECTION 문제, 원장님 «문제가 너무 많다»).
	const section = part === null ? null : course.sections[part];
	const pageQuestions = questions;

	const answered = pageQuestions.filter((q) => answers[q.id]?.trim()).length;
	const blanks = pageQuestions.length - answered;

	const handleSubmit = () => {
		if (blanks > 0 && !confirming) {
			setConfirming(true);
			return;
		}
		setConfirming(false);
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
				<div className={s.shell}>
					<div className={s.topRow}>
						<button
							type="button"
							className={themeButton.button}
							aria-label="처음 화면으로"
							title="처음 화면으로"
							onClick={() => {
								setConfirming(false);
								setLeaving(true);
							}}
						>
							<HomeIcon
								className={themeButton.icon}
								strokeWidth={2.25}
								aria-hidden
							/>
						</button>
						<span className={s.courseName}>
							{studentName} · {course.title}
						</span>
						<span className={s.topActions}>
							<span className={s.timer} aria-label="경과 시간">
								{formatDuration(now - (pageStartedAt ?? now))}
							</span>
							<ThemeToggle />
						</span>
					</div>
					{/* NOTE: 전체 풀기는 「전체 범위 테스트」(원장님 이름 2026-10-29), 한 유형 풀이는 유형 번호 + 이름. */}
					<div className={s.sectionRow}>
						<span className={s.pageBadge}>
							{section ? `${(part ?? 0) + 1}번` : '전체 범위 테스트'}
						</span>
						{section && <span className={s.sectionTitle}>{section.title}</span>}
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

			<ol className={`${s.shell} ${s.grid}`}>
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
							onFocus={handleFocus}
							// 자판을 «뒤로»로 내린 뒤 같은 칸을 다시 누르면 focus 가 다시 안 온다 — 눌러도 숨긴다
							onClick={handleFocus}
							onBlur={handleBlur}
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

			<div
				className={`${layout.bottomBar} ${s.bottomBarAuto}`}
				data-typing={typing}
			>
				<div className={`${s.shell} ${layout.bottomBarInner}`}>
					{confirming && (
						<p className={s.confirm} role="alert">
							아직 안 푼 문제가 {blanks}개 남았습니다. 그래도 채점할까요?
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
							채점하기
							{!confirming && ` (${answered}/${pageQuestions.length})`}
						</button>
					</div>
				</div>
			</div>

			{/* NOTE: 처음으로 가면 푼 답이 사라지므로 화면 가운데 확인 창으로 한 번 묻는다(원장님 결정 2026-10-22). */}
			<Modal
				open={leaving}
				onClose={() => setLeaving(false)}
				title="처음 화면으로 이동"
				description="지금까지 적은 답은 저장되지 않습니다. 처음 화면으로 돌아갈까요?"
			>
				<button
					type="button"
					className={`${layout.secondaryButton} ${modal.modalSecondary}`}
					data-autofocus
					onClick={() => setLeaving(false)}
				>
					계속 풀기
				</button>
				<button
					type="button"
					className={layout.primaryButton}
					onClick={() => navigate('/')}
				>
					처음으로
				</button>
			</Modal>
		</main>
	);
}
