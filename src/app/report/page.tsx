import { useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { ShareIcon } from '@heroicons/react/24/outline';
import * as modal from '@/components/Modal.css.ts';
import Modal from '@/components/Modal.tsx';
import * as s from '@/components/ReportView.css.ts';
import ReportView from '@/components/ReportView.tsx';
import { getCourse } from '@/data/courses.ts';
import { useShortShareUrl } from '@/hooks/useShortShareUrl.ts';
import { useTestSessionStore } from '@/store/useTestSessionStore.ts';
import * as layout from '@/styles/utility.css.ts';
import { buildReport } from '@/utils/buildReport.ts';
import { encodeReport, shareUrl } from '@/utils/shareLink.ts';
import { shareMessage } from '@/utils/shareMessage.ts';

const SHARE_HINT =
	"'복사하기'를 눌러 내용을 복사한 뒤 공유할 곳에 붙여넣어 주세요.";

export default function ReportPage() {
	const { testId, part: partParam } = useParams();
	const navigate = useNavigate();
	const course = getCourse(testId);
	const session = useTestSessionStore();
	const [notice, setNotice] = useState('');
	// 공유 창에서 고치는 글. null = 창 닫힘
	const [draft, setDraft] = useState<string | null>(null);
	const [hint, setHint] = useState(SHARE_HINT);
	const draftRef = useRef<HTMLTextAreaElement>(null);

	const { courseId, part, startedAt, finishedAt } = session;
	// 주소 끝 번호(1부터) = 한 유형 풀이. 지금 세션과 다르면 홈으로
	const urlPart = partParam === undefined ? null : Number(partParam) - 1;
	const ready =
		course &&
		courseId === testId &&
		part === urlPart &&
		startedAt !== null &&
		finishedAt !== null;
	const code = ready
		? encodeReport(buildReport(course, { ...session, startedAt, finishedAt }))
		: null;
	// 짧은 링크(/r/6글자)는 미리 만들어 둔다. 준비 전·실패면 긴 링크(/s/코드)로 보낸다.
	const shortUrl = useShortShareUrl(code);

	if (!ready) {
		return <Navigate to="/" replace />;
	}

	const report = buildReport(course, { ...session, startedAt, finishedAt });

	const flash = (text: string) => {
		setNotice(text);
		setTimeout(() => setNotice(''), 3000);
	};

	/**
	 * 공유: 안내 글 + 링크 한 덩어리를 창에서 보여 주고, 고친 뒤 «복사하기»(원장님 결정 2026-10-27).
	 * 카톡에 붙여 넣으면 글 아래 링크 카드가 붙는다. 휴대폰·PC 모두 같은 창 —
	 * NOTE: 윈도 크롬·엣지의 공유 창에는 PC 카카오톡도 «복사»도 없어서 공유 시트(navigator.share)는 쓰지 않는다.
	 */
	const openShare = () => {
		setHint(SHARE_HINT);
		setDraft(
			shareMessage(
				report,
				shortUrl ?? shareUrl(window.location.origin, encodeReport(report)),
			),
		);
		// 지난번에 내려 둔 스크롤이 남지 않게, 열 때마다 글 맨 위(제목)부터 보여 준다
		requestAnimationFrame(() => draftRef.current?.scrollTo(0, 0));
	};

	const handleCopy = async () => {
		if (draft === null) return;
		try {
			await navigator.clipboard.writeText(draft);
			setDraft(null);
			flash('공유 글을 복사했습니다. 카카오톡 대화방에 붙여 넣어 보내 주세요.');
		} catch {
			// 복사가 막힌 브라우저: 글을 골라 두고 직접 복사하게 한다
			draftRef.current?.select();
			setHint('자동 복사가 되지 않았습니다. 고른 글을 직접 복사해 주세요.');
		}
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
							onClick={openShare}
						>
							<ShareIcon
								className={s.shareIcon}
								strokeWidth={2.25}
								aria-hidden
							/>
							테스트 결과 공유
						</button>
					</div>
					<Modal
						open={draft !== null}
						onClose={() => setDraft(null)}
						title="테스트 결과 공유"
						description={hint}
						content={
							<textarea
								ref={draftRef}
								className={modal.modalTextarea}
								aria-label="보낼 글"
								value={draft ?? ''}
								onChange={(e) => setDraft(e.target.value)}
							/>
						}
					>
						<button
							type="button"
							className={layout.primaryButton}
							data-autofocus
							onClick={handleCopy}
						>
							복사하기
						</button>
						<button
							type="button"
							className={`${layout.secondaryButton} ${modal.modalSecondary}`}
							onClick={() => setDraft(null)}
						>
							취소
						</button>
					</Modal>
				</>
			}
		/>
	);
}
