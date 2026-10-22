import type { Report } from '@/@types/test';
import { cardText } from '@/utils/linkCard.ts';

/**
 * 공유는 카톡 «두 개»로 보낸다(원장님 결정 2026-10-22): 첫째 = 카드와 같은 제목·안내, 둘째 = 링크만.
 * NOTE: 공유 시트 한 번 = 메시지 한 개라서 리포트 화면이 공유 시트를 두 번 띄운다(report/page.tsx).
 * 공유 시트에 text·url 을 함께 넘기면 카톡이 글을 버리고 링크만 보냈다(2026-10-20 휴대폰 확인) — 각각 text 로만 넘긴다.
 */
export function shareParts(report: Report, url: string) {
	const { title, description } = cardText(
		report.studentName,
		report.finishedAt,
	);
	return { message: `${title}\n${description}`, link: url };
}
