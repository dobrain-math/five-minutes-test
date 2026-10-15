import { useState } from 'react';
import { useNavigate } from 'react-router';
import { courses } from '@/data/courses.ts';
import { useTestSession } from '@/stores/testSession.ts';
import * as layout from '@/styles/layout.css.ts';
import { TOTAL_QUESTIONS } from '@/utils/buildTest.ts';
import * as s from './HomePage.css.ts';

export default function HomePage() {
	const navigate = useNavigate();
	const studentName = useTestSession((st) => st.studentName);
	const setStudentName = useTestSession((st) => st.setStudentName);
	const start = useTestSession((st) => st.start);
	const [courseId, setCourseId] = useState<string | null>(null);

	const canStart = studentName.trim() !== '' && courseId !== null;

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
					<h1 className={layout.title}>연산 테스트</h1>
					<p className={layout.subtitle}>
						이름을 적고 테스트 볼 종목을 골라 주세요.
					</p>
				</header>

				<div className={s.field}>
					<label htmlFor="student-name" className={layout.sectionLabel}>
						학생 이름
					</label>
					<input
						id="student-name"
						className={s.nameInput}
						value={studentName}
						onChange={(e) => setStudentName(e.target.value)}
						placeholder="이름을 입력하세요"
						autoComplete="off"
						enterKeyHint="done"
						maxLength={20}
					/>
				</div>

				<div className={s.field}>
					<span id="course-label" className={layout.sectionLabel}>
						테스트 종목
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
