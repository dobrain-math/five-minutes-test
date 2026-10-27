import { type CSSProperties, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import ThemeToggle from '@/components/ThemeToggle.tsx';
import { AGES } from '@/data/ages.ts';
import { courses } from '@/data/courses.ts';
import { useTestSessionStore } from '@/store/useTestSessionStore.ts';
import * as brand from '@/styles/brand.css.ts';
import * as layout from '@/styles/utility.css.ts';
import { PER_SECTION } from '@/utils/buildTest.ts';
import * as s from './page.css.ts';

export default function HomePage() {
	const navigate = useNavigate();
	const studentName = useTestSessionStore((st) => st.studentName);
	const setStudentName = useTestSessionStore((st) => st.setStudentName);
	const studentAge = useTestSessionStore((st) => st.studentAge);
	const setStudentAge = useTestSessionStore((st) => st.setStudentAge);
	const start = useTestSessionStore((st) => st.start);
	const [courseId, setCourseId] = useState<string | null>(null);

	const ageIndex = Math.max(
		0,
		AGES.indexOf(studentAge as (typeof AGES)[number]),
	);
	const agePicked = studentAge !== '';
	const pickAge = (i: number) => setStudentAge(AGES[i]);

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
	const course = courses.find((c) => c.id === courseId);
	const pickCourse = (id: string) => {
		if (id !== courseId) {
			setMode(null);
			setPart(null);
		}
		setCourseId(id);
	};

	const canStart =
		studentName.trim() !== '' &&
		studentAge !== '' &&
		courseId !== null &&
		(mode === 'all' || (mode === 'each' && part !== null));

	const handleStart = () => {
		if (!canStart) return;
		setStudentName(studentName.trim());
		const solo = mode === 'each' ? part : null;
		start(courseId, solo);
		navigate(
			solo === null ? `/test/${courseId}` : `/test/${courseId}/${solo + 1}`,
		);
	};

	return (
		<main className={layout.page}>
			{/* 리포트와 같은 파랑 머리 띠(brandBand) — 홈에도 브랜드가 보이게(2026-10-27) */}
			<header className={brand.brandBand}>
				<div className={`${layout.container.narrow} ${s.heroInner}`}>
					<div className={layout.titleRow}>
						<h1 className={s.heroTitle}>두뇌로수학 연산 테스트</h1>
						<ThemeToggle />
					</div>
					<p className={s.heroSubtitle}>
						이름과 나이를 입력하고 테스트 권과 유형을 골라 주세요.
					</p>
				</div>
			</header>

			<div className={`${layout.container.narrow} ${layout.content}`}>
				<div className={s.field}>
					<label htmlFor="student-name" className={layout.sectionLabel}>
						학생명
					</label>
					<input
						id="student-name"
						className={s.nameInput}
						value={studentName}
						onChange={(e) => setStudentName(e.target.value)}
						placeholder="이름을 적어 주세요"
						autoComplete="off"
						enterKeyHint="done"
						maxLength={20}
					/>
				</div>

				<div className={s.field}>
					<div className={s.ageLabelRow}>
						<label
							htmlFor="student-age"
							className={`${layout.sectionLabel} ${s.ageLabelText}`}
						>
							나이(학년)
						</label>
						<span className={s.ageValue} data-picked={agePicked}>
							{agePicked ? studentAge : '막대를 끌어 골라 주세요'}
						</span>
					</div>
					<div className={s.ageCard}>
						<input
							id="student-age"
							type="range"
							min={0}
							max={AGES.length - 1}
							step={1}
							value={ageIndex}
							aria-valuetext={agePicked ? studentAge : '선택 안 함'}
							className={s.ageSlider}
							data-picked={agePicked}
							// 막대 칠하기 비율(0~1). page.css.ts 의 ageSlider 가 읽는다
							style={
								{ '--age-fill': ageIndex / (AGES.length - 1) } as CSSProperties
							}
							onChange={(e) => pickAge(Number(e.target.value))}
							// 손잡이를 움직이지 않고 누르기만 해도(맨 왼쪽 5세 그대로) 고른 것으로 친다
							onClick={(e) => pickAge(Number(e.currentTarget.value))}
						/>
						<div className={s.ageTicks} aria-hidden>
							{AGES.map((age, i) => (
								<span
									key={age}
									className={s.ageTick}
									data-active={agePicked && i === ageIndex}
									style={{ left: `${(i / (AGES.length - 1)) * 100}%` }}
									onClick={() => pickAge(i)}
								>
									{age}
								</span>
							))}
						</div>
					</div>
				</div>

				<div className={s.field}>
					<span id="course-label" className={layout.sectionLabel}>
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
									<span className={s.radio} aria-hidden />
									<span>
										<div className={s.courseTitle}>{course.title}</div>
										<div className={s.courseMeta}>
											{course.sections.length}개 유형 · 유형마다 {PER_SECTION}
											문제
										</div>
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
						<span id="mode-label" className={layout.sectionLabel}>
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
								onClick={() => setMode('all')}
							>
								<span className={s.modeTitle}>전체 풀기</span>
								<span className={s.modeMeta}>
									{course.sections.length * PER_SECTION}문제 · 강약점 분석 포함
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
									{course.sections.length}개 중 하나 · {PER_SECTION}문제
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
												<span className={s.radio} aria-hidden />
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
		</main>
	);
}
