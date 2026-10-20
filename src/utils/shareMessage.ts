import type { Report } from '@/@types/test';

/**
 * 문자·카톡 공유 시트에 링크와 함께 보내는 글.
 * NOTE: 받는 학부모가 링크를 열기 전에도 누구의 언제 결과인지 알 수 있게 이름·날짜를 적는다.
 */
export function shareMessage(report: Report) {
	const date =
		report.finishedAt === undefined
			? ''
			: (() => {
					const d = new Date(report.finishedAt);
					return `${d.getMonth() + 1}월 ${d.getDate()}일 `;
				})();
	return {
		title: '두뇌로수학 테스트 결과 리포트 도착',
		text: `${report.studentName} 학생의 ${date}연산 테스트 결과입니다.`,
	};
}
