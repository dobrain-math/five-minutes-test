/** ms → 「2026년 10월 5일」. 리포트 머리 띠의 테스트 실시일 */
export function formatTestDate(ms: number) {
	const d = new Date(ms);
	return `${d.getFullYear()}년 ${formatMonthDay(ms)}`;
}

/** ms → 「10월 5일」. 공유 멘트처럼 해가 뻔한 곳 */
export function formatMonthDay(ms: number) {
	const d = new Date(ms);
	return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}
