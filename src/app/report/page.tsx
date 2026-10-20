import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { ShareIcon } from '@heroicons/react/24/outline';
import * as s from '@/components/ReportView.css.ts';
import ReportView from '@/components/ReportView.tsx';
import { getCourse } from '@/data/courses.ts';
import { useTestSessionStore } from '@/store/useTestSessionStore.ts';
import * as layout from '@/styles/utility.css.ts';
import { buildReport } from '@/utils/buildReport.ts';
import { encodeReport, shareUrl } from '@/utils/shareLink.ts';
import { shareMessage } from '@/utils/shareMessage.ts';

export default function ReportPage() {
	const { testId } = useParams();
	const navigate = useNavigate();
	const course = getCourse(testId);
	const session = useTestSessionStore();
	const [notice, setNotice] = useState('');

	const { courseId, startedAt, finishedAt } = session;
	if (
		!course ||
		courseId !== testId ||
		startedAt === null ||
		finishedAt === null
	) {
		return <Navigate to="/" replace />;
	}

	const report = buildReport(course, { ...session, startedAt, finishedAt });

	// NOTE: 휴대폰은 공유 시트(카카오톡 등)를, 안 되는 PC 브라우저는 «안내 글 + 링크» 복사를 쓴다.
	const handleShare = async () => {
		const url = shareUrl(window.location.origin, encodeReport(report));
		const { title, text } = shareMessage(report);
		if (navigator.share) {
			try {
				await navigator.share({ title, text: `${title}\n${text}`, url });
				return;
			} catch (e) {
				// 사용자가 공유 시트를 닫은 경우는 그대로 끝낸다.
				if (e instanceof DOMException && e.name === 'AbortError') return;
			}
		}
		try {
			await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
			setNotice('결과 링크를 복사했습니다. 메신저에 붙여 넣어 보내 주세요.');
		} catch {
			setNotice('링크를 복사하지 못했습니다. 다시 눌러 주세요.');
		}
		setTimeout(() => setNotice(''), 3000);
	};

	return (
		<ReportView
			report={report}
			actions={
				<>
					{notice && (
						<p className={s.notice} role="status">
							{notice}
						</p>
					)}
					<div className={s.buttonRow}>
						<button
							type="button"
							className={`${layout.primaryButton} ${s.homeButton}`}
							onClick={() => navigate('/')}
						>
							처음으로
						</button>
						<button
							type="button"
							className={`${layout.secondaryButton} ${s.shareButton}`}
							onClick={handleShare}
						>
							<ShareIcon
								className={s.shareIcon}
								strokeWidth={2.25}
								aria-hidden
							/>
							테스트 결과 공유
						</button>
					</div>
				</>
			}
		/>
	);
}
