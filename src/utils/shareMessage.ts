import type { Report } from '@/@types/test';
import { cardText } from '@/utils/linkCard.ts';

/**
 * 공유 시트·링크 복사로 보내는 «한 덩어리 글»: 카드와 같은 제목·안내 + 마지막 줄 링크.
 * NOTE: 공유 시트에 url 을 따로 넘기면 카톡이 글(text)을 버리고 링크만 보낸다(2026-10-20 휴대폰 확인).
 * 그래서 링크를 글 안에 넣는다. 카톡·문자는 글 속 링크로도 미리보기 카드를 만든다.
 */
export function shareMessage(report: Report, url: string) {
	const { title, description } = cardText(
		report.studentName,
		report.finishedAt,
	);
	return `${title}\n${description}\n${url}`;
}
