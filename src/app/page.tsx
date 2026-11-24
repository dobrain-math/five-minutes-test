import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckIcon } from '@heroicons/react/16/solid';
import type { Course, Operator } from '@/@types/test';
import * as modal from '@/components/Modal.css.ts';
import Modal from '@/components/Modal.tsx';
import { courses } from '@/data/courses.ts';
import {
	autoLogin,
	loginFromSnapshot,
	useTestSessionStore,
} from '@/store/useTestSessionStore.ts';
import * as brand from '@/styles/brand.css.ts';
import * as layout from '@/styles/utility.css.ts';
import { FULL_PER_SECTION, PER_SECTION } from '@/utils/buildTest.ts';
import { challengeDays, login as fetchLogin } from '@/utils/challenge.ts';
import LoginForm from './LoginForm.tsx';
import * as s from './page.css.ts';

const OP_SYMBOL: Record<Operator, string> = { '+': '+', '-': '−', '×': '×' };

/** 권 카드 오른쪽 연산 기호 — 그 권에 나오는 + − × (예시 문제 줄은 원장님 요청으로 뺌 2026-10-27) */
const COURSE_PREVIEW: Record<string, { ops: Operator[] }> = Object.fromEntries(
	courses.map((course) => {
		const problems = course.sections.map((sec) => sec.generate(Math.random, 0));
		const ops = (['+', '-', '×'] as const).filter((op) =>
			problems.some((p) => p.op === op),
		);
		return [course.id, { ops }];
	}),
);

/** 유형별 풀기 문제 수 — 유형마다 다르면 「24~30」(기본연습 한한덧셈 받아올림O 만 30, 2026-11-10) */
const countRange = (course: Course) => {
	const counts = course.sections.map((sec) => sec.count ?? PER_SECTION);
	const lo = Math.min(...counts);
	const hi = Math.max(...counts);
	return lo === hi ? `${lo}` : `${lo}~${hi}`;
};

/** 단계 번호 동그라미. 그 단계를 다 고르면 파랑 체크로 바뀐다(실험 B) */
function Step({ n, done }: { n: number; done: boolean }) {
	return (
		<span className={s.step} data-done={done} aria-hidden>
			{done ? <CheckIcon className={s.stepCheck} /> : n}
		</span>
	);
}

/** 로그인 전에는 로그인 화면만, 로그인하면 권 고르기(2026-11-17) */
export default function HomePage() {
	const login = useTestSessionStore((st) => st.login);
	return login ? <CoursePicker /> : <LoginForm />;
}

function CoursePicker() {
	const navigate = useNavigate();
	const login = useTestSessionStore((st) => st.login);
	const setLogin = useTestSessionStore((st) => st.setLogin);
	const start = useTestSessionStore((st) => st.start);
	const [courseId, setCourseId] = useState<string | null>(null);
	const days = login ? challengeDays(login.history) : 0;
	// 하루 한 번 제한은 없앴다(2026-11-24) — 오늘 이미 풀었으면 시작할 때 확인 창으로 한 번만 묻는다
	const doneToday = login?.doneToday ?? false;
	const [confirmRetry, setConfirmRetry] = useState(false);
	const logout = () => {
		autoLogin.set(null);
		setLogin(null);
	};
	// 저장해 둔 로그인으로 바로 들어왔으면 뒤에서 시트에 한 번 다시 물어 최신(기록·오늘 완료)으로 바꾼다.
	// 코드가 바뀌었으면(틀림) 로그아웃. 연결 실패는 그대로 둔다
	useEffect(() => {
		if (!login || !loginFromSnapshot.pending) return;
		loginFromSnapshot.pending = false;
		void fetchLogin(login.name, login.code).then((r) => {
			if (r.ok) setLogin(r.login);
			else if (r.error === 'wrong') logout();
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps -- 처음 열 때 한 번
	}, []);

	// 풀이 방식: 'all' = 전체 풀기, 'each' = 유형별(아래 목록에서 유형 하나 고름). 권을 바꾸면 다시 고른다.
	const [mode, setMode] = useState<'all' | 'each' | null>(null);
	const [part, setPart] = useState<number | null>(null);
	const modeField = useRef<HTMLDivElement>(null);
	// 유형별을 누르면 펼쳐지는 목록이 화면 아래로 숨지 않게 «테스트 유형» 칸을 위로 끌어올린다.
	// NOTE: 펼치는 중에는 페이지가 아직 짧아 내려갈 자리가 없다 → 펼치기가 끝난 뒤(onTransitionEnd) 내려간다.
	const scrollPending = useRef(false);
	const scrollToModeField = () =>
		modeField.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	const openEach = () => {
		// 이미 펼쳐져 있으면 움직임이 없어 onTransitionEnd 도 안 온다 — 그대로 둔다
		if (mode === 'each') return;
		setMode('each');
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			// 애니메이션이 없으면 바로 다 펼쳐진다
			requestAnimationFrame(() =>
				modeField.current?.scrollIntoView({ block: 'start' }),
			);
		} else scrollPending.current = true;
	};
	// 전체 범위 테스트로 바꾸면 유형별에서 골라 둔 유형은 버린다 — 다시 유형별로 와도 새로 고르게(원장님 2026-10-29)
	const pickAll = () => {
		setMode('all');
		setPart(null);
	};
	const course = courses.find((c) => c.id === courseId);
	const pickCourse = (id: string) => {
		if (id !== courseId) {
			setMode(null);
			setPart(null);
		}
		setCourseId(id);
	};

	const canStart =
		courseId !== null && (mode === 'all' || (mode === 'each' && part !== null));

	const startTest = () => {
		if (!canStart) return;
		const solo = mode === 'each' ? part : null;
		start(courseId, solo);
		navigate(
			solo === null ? `/test/${courseId}` : `/test/${courseId}/${solo + 1}`,
		);
	};

	const handleStart = () => {
		if (!canStart) return;
		if (doneToday) setConfirmRetry(true);
		else startTest();
	};

	return (
		<main className={layout.page}>
			{/* 리포트와 같은 파랑 머리 띠(brandBand) — 홈에도 브랜드가 보이게(2026-10-27) */}
			<header className={brand.brandBand}>
				<div className={`${layout.container.narrow} ${s.heroInner}`}>
					<div className={layout.titleRow}>
						<h1 className={s.heroTitle}>{login?.name} 학생</h1>
						<div className={s.heroActions}>
							<button type="button" className={s.logoutButton} onClick={logout}>
								로그아웃
							</button>
						</div>
					</div>
					<div className={s.heroMeta}>
						{login?.age && <span className={s.heroBadge}>{login.age}</span>}
						<span className={s.heroStreak}>
							{days > 0
								? `챌린지 ${days}일째 참여 중!`
								: '오늘부터 챌린지를 시작해 보세요!'}
						</span>
					</div>
				</div>
			</header>

			<div className={`${layout.container.narrow} ${layout.content}`}>
				<>
					<div className={s.field}>
						<span
							id="course-label"
							className={`${layout.sectionLabel} ${s.stepLabel}`}
						>
							<Step n={1} done={courseId !== null} />
							테스트 권
						</span>
						<ul
							role="radiogroup"
							aria-labelledby="course-label"
							className={s.courseList}
						>
							{courses.map((course) => (
								<li key={course.id}>
									<button
										type="button"
										role="radio"
										aria-checked={courseId === course.id}
										className={s.courseItem}
										onClick={() => pickCourse(course.id)}
									>
										<span className={s.courseBody}>
											<div className={s.courseTitle}>{course.title}</div>
											<div className={s.courseMeta}>
												{course.sections.length}개 유형
											</div>
										</span>
										<span className={s.courseOps} aria-hidden>
											{COURSE_PREVIEW[course.id].ops.map((op) => (
												<span key={op} className={s.courseOp} data-op={op}>
													{OP_SYMBOL[op]}
												</span>
											))}
										</span>
									</button>
								</li>
							))}
						</ul>
					</div>

					{/*
					 * NOTE: 권을 고르면 «전체 풀기 / 유형별 풀기» 둘만 나온다.
					 * 유형별을 눌러야 아래로 유형 목록이 펼쳐진다(원장님 결정 2026-10-22).
					 */}
					{course && (
						<div ref={modeField} className={`${s.field} ${s.modeField}`}>
							<span
								id="mode-label"
								className={`${layout.sectionLabel} ${s.stepLabel}`}
							>
								<Step
									n={2}
									done={mode === 'all' || (mode === 'each' && part !== null)}
								/>
								테스트 유형
							</span>
							<div
								role="radiogroup"
								aria-labelledby="mode-label"
								className={s.modeGrid}
							>
								<button
									type="button"
									role="radio"
									aria-checked={mode === 'all'}
									className={s.modeButton}
									onClick={pickAll}
								>
									<span className={s.modeTitle}>전체 범위 테스트</span>
									<span className={s.modeMeta}>
										유형당 {FULL_PER_SECTION}문제 · 총{' '}
										{course.sections.length * FULL_PER_SECTION}문제
										<br />
										강약점 분석 포함
									</span>
								</button>
								<button
									type="button"
									role="radio"
									aria-checked={mode === 'each'}
									aria-expanded={mode === 'each'}
									aria-controls="part-list"
									className={s.modeButton}
									onClick={openEach}
								>
									<span className={s.modeTitle}>유형별 풀기</span>
									<span className={s.modeMeta}>
										{course.sections.length}개 중 하나 · {countRange(course)}
										문제
									</span>
								</button>
							</div>

							{/* NOTE: 접혀 있을 때도 그려 두고 높이만 0 → 펼칠 때·접을 때 모두 부드럽게 움직인다. inert 로 접힌 목록에는 손·키보드가 닿지 않는다. */}
							<div
								id="part-list"
								className={s.partReveal}
								data-open={mode === 'each'}
								inert={mode !== 'each'}
								onTransitionEnd={(e) => {
									if (
										e.target === e.currentTarget &&
										e.propertyName === 'grid-template-rows' &&
										scrollPending.current
									) {
										scrollPending.current = false;
										scrollToModeField();
									}
								}}
							>
								<div className={s.partRevealInner}>
									<ul
										role="radiogroup"
										aria-label="풀 유형"
										className={s.partList}
									>
										{course.sections.map((section, i) => (
											<li key={section.id}>
												<button
													type="button"
													role="radio"
													aria-checked={part === i}
													className={`${s.courseItem} ${s.partItem}`}
													onClick={() => setPart(i)}
												>
													<span className={s.partNumber}>{i + 1}</span>
													<span>
														<div className={s.partTitle}>{section.title}</div>
													</span>
												</button>
											</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					)}
				</>
			</div>

			<div className={layout.bottomBar}>
				<div className={`${layout.container.narrow} ${layout.bottomBarInner}`}>
					<button
						type="button"
						className={layout.primaryButton}
						disabled={!canStart}
						onClick={handleStart}
					>
						테스트 시작
					</button>
				</div>
			</div>

			{/* 오늘 이미 푼 학생 — 막지 않고 한 번만 묻는다. 다시 풀면 시트에 기록이 한 줄 더 쌓인다(2026-11-24) */}
			<Modal
				open={confirmRetry}
				onClose={() => setConfirmRetry(false)}
				title="오늘 이미 푼 챌린지"
				description="오늘 챌린지를 이미 풀었습니다. 한 번 더 풀까요? 다시 풀면 기록이 하나 더 저장됩니다."
			>
				<button
					type="button"
					className={`${layout.secondaryButton} ${modal.modalSecondary}`}
					data-autofocus
					onClick={() => setConfirmRetry(false)}
				>
					취소
				</button>
				<button
					type="button"
					className={layout.primaryButton}
					onClick={startTest}
				>
					다시 풀기
				</button>
			</Modal>
		</main>
	);
}
