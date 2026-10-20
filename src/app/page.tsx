import { useState } from 'react';
import { useNavigate } from 'react-router';
import ThemeToggle from '@/components/ThemeToggle.tsx';
import { AGES } from '@/data/ages.ts';
import { courses } from '@/data/courses.ts';
import { useTestSessionStore } from '@/store/useTestSessionStore.ts';
import * as layout from '@/styles/utility.css.ts';
import { TOTAL_QUESTIONS } from '@/utils/buildTest.ts';
import * as s from './page.css.ts';

export default function HomePage() {
	const navigate = useNavigate();
	const studentName = useTestSessionStore((st) => st.studentName);
	const setStudentName = useTestSessionStore((st) => st.setStudentName);
	const studentAge = useTestSessionStore((st) => st.studentAge);
	const setStudentAge = useTestSessionStore((st) => st.setStudentAge);
	const start = useTestSessionStore((st) => st.start);
	const [courseId, setCourseId] = useState<string | null>(null);

	const canStart =
		studentName.trim() !== '' && studentAge !== '' && courseId !== null;

	const handleStart = () => {
		if (!canStart) return;
		setStudentName(studentName.trim());
		start(courseId);
		navigate(`/test/${courseId}`);
	};

	return (
		<main className={layout.page}>
			<div className={`${layout.container.narrow} ${layout.content}`}>
				<header className={s.header}>
					<div className={layout.titleRow}>
						<h1 className={layout.title}>두뇌로수학 연산 테스트</h1>
						<ThemeToggle />
					</div>
					<p className={layout.subtitle}>
						이름과 나이를 입력하고 테스트 유형을 골라 주세요.
					</p>
				</header>

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
					<span id="age-label" className={layout.sectionLabel}>
						나이(학년)
					</span>
					<ul
						role="radiogroup"
						aria-labelledby="age-label"
						className={s.ageGrid}
					>
						{AGES.map((age) => (
							<li key={age}>
								<button
									type="button"
									role="radio"
									aria-checked={studentAge === age}
									className={s.ageChip}
									onClick={() => setStudentAge(age)}
								>
									{age}
								</button>
							</li>
						))}
					</ul>
				</div>

				<div className={s.field}>
					<span id="course-label" className={layout.sectionLabel}>
						테스트 유형
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
									onClick={() => setCourseId(course.id)}
								>
									<span className={s.radio} aria-hidden />
									<span>
										<div className={s.courseTitle}>{course.title}</div>
										<div className={s.courseMeta}>
											{course.sections.length}개 유형 · {TOTAL_QUESTIONS}문제
										</div>
									</span>
								</button>
							</li>
						))}
					</ul>
				</div>
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
