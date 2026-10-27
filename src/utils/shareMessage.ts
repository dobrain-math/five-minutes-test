import type { Report } from '@/@types/test';
import { formatCardDate } from '@/utils/formatDate.ts';

/**
 * 카톡으로 보내는 공유 글(원장님 문구 2026-10-27). 안내 글과 링크를 «한 덩어리»로 보낸다 —
 * 카톡은 글 안의 링크를 알아보고 그 아래 링크 카드를 붙인다(2026-10-22 의 «두 개로 보내기»는 폐기).
 * 리포트 화면의 공유 창에서 이 글을 고친 뒤 복사한다(report/page.tsx).
 */
export function shareMessage(report: Report, url: string) {
	const date =
		report.finishedAt === undefined
			? ''
			: `${formatCardDate(report.finishedAt)} `;
	return [
		`🍀 ${date}연산 테스트 리포트`,
		'',
		`${report.studentName} 학생의 두뇌로수학 테스트 결과를 보내드립니다.`,
		'클릭해 자세한 내용을 확인해 보세요.',
		'',
		url,
	].join('\n');
}
