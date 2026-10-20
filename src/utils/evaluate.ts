import type { Report, SectionScore } from '@/@types/test';
import { joinTitles } from '@/utils/summarize.ts';

/** 이 정답률 이상인 유형을 「두각」으로 본다 */
const STRONG_LINE = 0.9;
/** 이 정답률 미만인 유형을 집중 학습 대상으로 본다 */
const WEAK_LINE = 0.9;
/** 가장 잘한 유형도 이보다 낮으면 기초부터 권한다 */
const BASIC_LINE = 0.5;
/** 문제당 이 시간(초)을 넘으면 속도 연습을 권한다 */
const SLOW_SECONDS = 15;
const FAST_SECONDS = 6;

const rate = (s: SectionScore) => (s.total === 0 ? 0 : s.correct / s.total);
const percent = (r: number) => `${Math.round(r * 100)}%`;

/**
 * 「두두덧셈 연산」처럼 뒤에 「연산」을 붙인다.
 * NOTE: 새 유형 이름은 「…한자리 연산」으로 끝나서 그대로 둔다. 예전 공유 링크는 옛 이름이 그대로 온다.
 */
const asOperation = (scores: SectionScore[]) => {
	const titles = joinTitles(scores);
	return titles.endsWith('연산') ? titles : `${titles} 연산`;
};

/**
 * 리포트를 학부모가 읽을 300자 안팎의 평가문으로 쓴다.
 * NOTE: 지금은 규칙으로 문장을 고른다. 다른 학생 평균·지난 기록과의 비교는 DB 가 생긴 뒤에 붙인다.
 */
export function evaluate(report: Report) {
	const { studentName, correct, total, durationMs, sections } = report;
	const overall = total === 0 ? 0 : correct / total;
	const seconds = total === 0 ? 0 : Math.round(durationMs / 1000 / total);
	const rates = sections.map(rate);
	const best = Math.max(...rates);
	const worst = Math.min(...rates);

	// NOTE: 아이와 학부모가 함께 읽으므로 딱딱한 「~습니다」 대신 부드러운 해요체로 쓴다.
	const lines = [
		`${studentName} 학생은 ${report.courseTitle} ${total}문제 중 ${correct}문제를 맞혔어요. 정답률은 ${percent(overall)}예요.`,
	];

	const pace =
		seconds > SLOW_SECONDS
			? overall >= STRONG_LINE
				? '정확하게 잘 풀고 있어요. 같은 유형을 반복해서 풀다 보면 속도도 점점 붙을 거예요.'
				: '서두르지 않아도 괜찮아요. 정확하게 푸는 습관을 먼저 들이고, 속도는 천천히 올려 가요.'
			: seconds <= FAST_SECONDS && overall >= STRONG_LINE
				? '빠르고 정확하게 계산하는 모습이 정말 멋져요.'
				: '';
	lines.push(
		`한 문제에 평균 ${seconds}초가 걸렸어요.${pace ? ` ${pace}` : ''}`,
	);

	const strong = sections.filter((_, i) => rates[i] >= STRONG_LINE);
	if (best < BASIC_LINE) {
		lines.push(
			'아직 손에 익은 유형이 없어요. 쉬운 유형부터 차근차근 기초를 다져 가면 금방 좋아질 거예요.',
		);
	} else if (strong.length > 0 && strong.length < sections.length) {
		lines.push(`특히 ${asOperation(strong)}에서 실력이 빛나요.`);
	}

	if (worst >= WEAK_LINE) {
		lines.push(
			'모든 유형을 고르게 잘 풀었어요. 다음 단계에 도전해 봐도 좋겠어요.',
		);
	} else if (best >= BASIC_LINE) {
		const weakest = sections.filter((_, i) => rates[i] === worst);
		lines.push(
			`${asOperation(weakest)}은 정답률이 ${percent(worst)}로 아직 어려워하고 있어서, 조금 더 연습해 보면 좋겠어요.`,
		);
	}

	return lines.join(' ');
}
