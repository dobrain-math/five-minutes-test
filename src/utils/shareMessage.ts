import type { Report } from '@/@types/test';
import { formatMonthDay } from '@/utils/formatDate.ts';

/**
 * 문자·카톡 공유 시트에 링크와 함께 보내는 글.
 * NOTE: 받는 학부모가 링크를 열기 전에도 누구의 언제 결과인지 알 수 있게 이름·날짜를 적는다.
 * 화면 문구는 경어 중심이지만, 이 글은 받는 사람이 기분 좋게 열도록 ~요체 + 이모지로 쓴다(원장님 결정 2026-10-20).
 */
export function shareMessage(report: Report) {
	const date =
		report.finishedAt === undefined
			? ''
			: `${formatMonthDay(report.finishedAt)} `;
	return {
		title: '📮 두뇌로수학 테스트 결과 리포트가 도착했어요',
		text:
			`${report.studentName} 학생의 ${date}연산 테스트 결과예요 ✏️\n` +
			'잘한 유형과 조금 더 연습하면 좋을 유형을 정리해 두었어요. 편하게 열어 보세요 😊',
	};
}
