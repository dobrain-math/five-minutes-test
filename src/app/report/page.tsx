import { useState } from 'react';
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
import { shareParts, shouldUseShareSheet } from '@/utils/shareMessage.ts';

export default function ReportPage() {
	const { testId, part: partParam } = useParams();
	const navigate = useNavigate();
	const course = getCourse(testId);
	const session = useTestSessionStore();
	const [notice, setNotice] = useState('');
	// 안내 글을 보낸 뒤 «링크 보내기» 창을 띄운다. 'share' = 공유 시트, 'copy' = 링크 복사(공유 시트 없는 PC)
	const [linkStep, setLinkStep] = useState<'share' | 'copy' | null>(null);

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

	const parts = () =>
		shareParts(
			report,
			shortUrl ?? shareUrl(window.location.origin, encodeReport(report)),
		);
	const flash = (text: string) => {
		setNotice(text);
		setTimeout(() => setNotice(''), 3000);
	};

	/**
	 * 공유는 카톡 두 개: ① 안내 글 → ② 링크(원장님 결정 2026-10-22).
	 * NOTE: 공유 시트 한 번에 메시지 한 개만 간다. 그리고 공유 시트는 «누른 직후»에만 열린다(아이폰 사파리) —
	 * 그래서 ① 을 보낸 뒤 창을 띄워 «링크 보내기»를 한 번 더 누르게 한다.
	 * 휴대폰은 공유 시트(카카오톡 등), PC 는 공유 시트가 있어도 복사로 같은 두 단계를 밟는다(shouldUseShareSheet).
	 */
	const sheetAvailable = () =>
		shouldUseShareSheet(
			typeof navigator.share === 'function',
			window.matchMedia('(pointer: coarse)').matches,
		);
	const handleShare = async () => {
		const { message } = parts();
		if (sheetAvailable()) {
			try {
				await navigator.share({ text: message });
				setLinkStep('share');
				return;
			} catch (e) {
				// 사용자가 공유 시트를 닫은 경우는 그대로 끝낸다.
				if (e instanceof DOMException && e.name === 'AbortError') return;
			}
		}
		try {
			await navigator.clipboard.writeText(message);
			setLinkStep('copy');
		} catch {
			flash('안내 글을 복사하지 못했습니다. 다시 눌러 주세요.');
		}
	};

	const handleLink = async () => {
		const { link } = parts();
		setLinkStep(null);
		if (linkStep === 'share' && sheetAvailable()) {
			try {
				// NOTE: url 칸이 아니라 text 로 넘긴다(카톡이 url 칸을 따로 다룬 적이 있어 ① 과 같은 방식으로)
				await navigator.share({ text: link });
				return;
			} catch (e) {
				if (e instanceof DOMException && e.name === 'AbortError') return;
			}
		}
		try {
			await navigator.clipboard.writeText(link);
			flash('결과 링크를 복사했습니다. 메신저에 붙여 넣어 보내 주세요.');
		} catch {
			flash('링크를 복사하지 못했습니다. 다시 눌러 주세요.');
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
					<Modal
						open={linkStep !== null}
						onClose={() => setLinkStep(null)}
						title={linkStep === 'copy' ? '링크 복사' : '링크 보내기'}
						description={
							linkStep === 'copy'
								? '안내 글을 복사했습니다. 메신저에 붙여 넣어 보낸 뒤, 결과 링크도 복사해 따로 보내 주세요.'
								: '안내 글을 보냈습니다. 이어서 결과 링크를 같은 대화방에 한 번 더 보내 주세요.'
						}
					>
						<button
							type="button"
							className={`${layout.secondaryButton} ${modal.modalSecondary}`}
							onClick={() => setLinkStep(null)}
						>
							닫기
						</button>
						<button
							type="button"
							className={layout.primaryButton}
							data-autofocus
							onClick={handleLink}
						>
							{linkStep === 'copy' ? '링크 복사' : '링크 보내기'}
						</button>
					</Modal>
				</>
			}
		/>
	);
}
