export interface SectionScore {
	title: string;
	correct: number;
	total: number;
}

const NO_WEAKNESS = '뚜렷한 취약점 없이 고르게 잘 풀었어요';
/** 이 정답률 이상이면 취약점으로 보지 않는다 */
const WEAK_LINE = 0.9;
/** 가장 잘한 유형이 이보다 낮으면 강점이 없다고 본다 */
const STRONG_LINE = 0.5;

const rate = (s: SectionScore) => (s.total === 0 ? 0 : s.correct / s.total);
const percent = (r: number) => `${Math.round(r * 100)}%`;

/**
 * 「가, 나 외 1개」처럼 두 개까지만 이름을 적는다.
 * 유형 이름에 +·−·O·X 같은 기호가 들어가므로 가운뎃점 대신 쉼표로 나눈다.
 */
const names = (scores: SectionScore[]) => {
	const titles = scores.map((s) => s.title);
	const head = titles.slice(0, 2).join(', ');
	return titles.length > 2 ? `${head} 외 ${titles.length - 2}개` : head;
};

/** 유형별 정답률로 강점·취약점 한 줄 평을 만든다. */
export function summarize(scores: SectionScore[]) {
	const rates = scores.map(rate);
	const best = Math.max(...rates);
	const worst = Math.min(...rates);

	if (best === worst) {
		return best === 1
			? { strength: '모든 유형을 다 맞혔어요', weakness: NO_WEAKNESS }
			: {
					strength: `모든 유형의 정답률이 ${percent(best)}로 비슷해요`,
					weakness:
						worst >= WEAK_LINE ? NO_WEAKNESS : '모든 유형을 골고루 더 연습해요',
				};
	}

	const top = scores.filter((_, i) => rates[i] === best);
	const bottom = scores.filter((_, i) => rates[i] === worst);

	const strength =
		best === 1
			? `${names(top)} 유형은 모두 맞혔어요`
			: best >= STRONG_LINE
				? `${names(top)} 유형을 가장 잘 풀었어요 (정답률 ${percent(best)})`
				: '아직 자신 있는 유형이 없어요. 쉬운 유형부터 다시 연습해요';

	const weakness =
		worst >= WEAK_LINE
			? NO_WEAKNESS
			: `${names(bottom)} 유형에서 가장 많이 틀렸어요 (정답률 ${percent(worst)})`;

	return { strength, weakness };
}
