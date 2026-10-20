/**
 * 날짜는 모두 한국 시각으로 적는다.
 * NOTE: 링크 카드는 Vercel 서버(UTC)에서 만들어져서, 기기 시간대를 따르면 밤 9시 이후 결과가 전날로 찍힌다.
 */
const KST_OFFSET = 9 * 60 * 60 * 1000;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const kst = (ms: number) => new Date(ms + KST_OFFSET);

/** ms → 「2026년 10월 5일」. 리포트 머리 띠의 테스트 실시일 */
export function formatTestDate(ms: number) {
	return `${kst(ms).getUTCFullYear()}년 ${formatMonthDay(ms)}`;
}

/** ms → 「10월 5일」. 공유 멘트처럼 해가 뻔한 곳 */
export function formatMonthDay(ms: number) {
	const d = kst(ms);
	return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`;
}

/** ms → 「10월 5일(월)」. 링크 카드 제목 */
export function formatCardDate(ms: number) {
	return `${formatMonthDay(ms)}(${WEEKDAYS[kst(ms).getUTCDay()]})`;
}
