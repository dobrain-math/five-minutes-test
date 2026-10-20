import type { Report, SectionScore } from '@/@types/test';
import { highlightSections } from '@/utils/highlightSections.ts';
import { joinTitles } from '@/utils/summarize.ts';

/** 전체 정답률이 이 이상이어야 속도 칭찬·속도 연습 문장을 쓴다(유형별 기준과는 별개) */
const STRONG_LINE = 0.9;
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

	// NOTE: 학부모가 읽으므로 경어(~니다) 중심으로 쓰되, 마지막 격려 한 문장만 ~요로 부드럽게 맺는다.
	// 「기초부터」 문장과 「조금 더 연습」 문장은 함께 나오지 않으므로 ~요는 많아야 하나다.
	const lines = [
		`${studentName} 학생은 ${report.courseTitle} ${total}문제 중 ${correct}문제를 맞혀 정답률 ${percent(overall)}를 기록했습니다.`,
	];

	const pace =
		seconds > SLOW_SECONDS
			? overall >= STRONG_LINE
				? '정확하게 잘 풀고 있으니, 같은 유형을 반복해 풀다 보면 속도도 자연스럽게 붙을 것입니다.'
				: '서두르지 않아도 괜찮습니다. 정확하게 푸는 습관을 먼저 들이고 속도는 천천히 올려 가면 됩니다.'
			: seconds <= FAST_SECONDS && overall >= STRONG_LINE
				? '빠르고 정확하게 계산하는 모습이 정말 훌륭합니다.'
				: '';
	lines.push(
		`한 문제에 평균 ${seconds}초가 걸렸습니다.${pace ? ` ${pace}` : ''}`,
	);

	// NOTE: 칭찬·연습 권유는 리포트 뱃지(학습 완료 8개↑ / 연습 필요 3개↓)와 같은 기준을 쓴다.
	const marks = highlightSections(sections);
	const strong = sections.filter((_, i) => marks[i] === 'strong');
	const weak = sections.filter((_, i) => marks[i] === 'weak');

	if (best < BASIC_LINE) {
		lines.push(
			'아직 손에 익은 유형이 없습니다. 쉬운 유형부터 차근차근 기초를 다져 가면 금방 좋아질 거예요.',
		);
	} else if (strong.length === sections.length) {
		lines.push(
			'모든 유형을 고르게 잘 풀었습니다. 다음 단계에 도전해 보아도 좋겠습니다.',
		);
	} else {
		if (strong.length > 0) {
			lines.push(`특히 ${asOperation(strong)}에서 실력이 돋보입니다.`);
		}
		if (weak.length > 0) {
			// 하나면 정답률을 함께 알려 주고, 여럿이면 이름만 잇는다.
			const rateText =
				weak.length === 1 ? `정답률이 ${percent(rate(weak[0]))}로 ` : '';
			lines.push(
				`${asOperation(weak)}은 ${rateText}아직 어려워하는 편이라, 조금 더 연습해 보면 좋겠어요.`,
			);
		}
	}

	return lines.join(' ');
}
