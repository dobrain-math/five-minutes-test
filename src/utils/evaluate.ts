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

	const lines = [
		`${studentName} 학생은 ${report.courseTitle} ${total}문제 중 ${correct}문제를 맞혀 정답률 ${percent(overall)}를 기록했습니다.`,
	];

	const pace =
		seconds > SLOW_SECONDS
			? overall >= STRONG_LINE
				? '정확도는 높지만 시간이 오래 걸려, 같은 유형을 반복해 계산 속도를 높이면 좋겠습니다.'
				: '서두르기보다 정확하게 푸는 습관을 먼저 들인 뒤 속도를 높여 가길 권합니다.'
			: seconds <= FAST_SECONDS && overall >= STRONG_LINE
				? '빠르고 정확하게 계산하는 힘이 돋보입니다.'
				: '';
	lines.push(`문제당 평균 ${seconds}초가 걸렸습니다.${pace ? ` ${pace}` : ''}`);

	const strong = sections.filter((_, i) => rates[i] >= STRONG_LINE);
	if (best < BASIC_LINE) {
		lines.push(
			'아직 안정적으로 푸는 유형이 없어, 쉬운 유형부터 기초 연산을 다시 다지는 것을 추천드립니다.',
		);
	} else if (strong.length > 0 && strong.length < sections.length) {
		lines.push(`특히 ${joinTitles(strong)} 연산에서 두각을 드러냅니다.`);
	}

	if (worst >= WEAK_LINE) {
		lines.push(
			'모든 유형에서 고른 실력을 보여, 다음 단계 과정으로 넘어가도 좋겠습니다.',
		);
	} else if (best >= BASIC_LINE) {
		const weakest = sections.filter((_, i) => rates[i] === worst);
		lines.push(
			`반면 ${joinTitles(weakest)} 연산은 정답률이 ${percent(worst)}로 낮으므로, 관련 학습을 집중적으로 추천드립니다.`,
		);
	}

	return lines.join(' ');
}
