import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { ShareIcon } from '@heroicons/react/24/outline';
import ChallengeHistory from '@/components/ChallengeHistory.tsx';
import * as modal from '@/components/Modal.css.ts';
import Modal from '@/components/Modal.tsx';
import * as s from '@/components/ReportView.css.ts';
import ReportView from '@/components/ReportView.tsx';
import { getCourse } from '@/data/courses.ts';
import { useShortShareUrl } from '@/hooks/useShortShareUrl.ts';
import { useTestSessionStore } from '@/store/useTestSessionStore.ts';
import * as layout from '@/styles/utility.css.ts';
import { buildReport } from '@/utils/buildReport.ts';
import {
	type ChallengeDay,
	type ChallengeLogin,
	challengeRecord,
	login as fetchLogin,
	sendChallenge,
} from '@/utils/challenge.ts';
import { encodeReport, shareUrl } from '@/utils/shareLink.ts';
import { shareMessage } from '@/utils/shareMessage.ts';

const SHARE_HINT =
	"'복사하기'를 눌러 내용을 복사한 뒤 공유할 곳에 붙여넣어 주세요.";

export default function ReportPage() {
	const { testId, part: partParam } = useParams();
	const navigate = useNavigate();
	const course = getCourse(testId);
	const session = useTestSessionStore();
	// 공유 창에서 고치는 글. null = 창 닫힘
	const [draft, setDraft] = useState<string | null>(null);
	const [hint, setHint] = useState(SHARE_HINT);
	const draftRef = useRef<HTMLTextAreaElement>(null);
	// 복사한 뒤 창은 그대로 두고 잠깐 띄우는 «복사 완료!» 토스트
	const [copied, setCopied] = useState(false);
	const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

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

	// 챌린지: 채점 결과를 기록 시트로 한 번만 보내고, 돌려받은 누적 기록을 리포트 아래에 보여 준다(2026-11-17)
	const [challengeNote, setChallengeNote] = useState<string | null>(null);
	const [history, setHistory] = useState<ChallengeDay[]>([]);
	const { login } = session;
	useEffect(() => {
		if (!ready || !login) return;
		// NOTE: 화면 값(session)은 옛 값일 수 있다 — 효과가 두 번 돌면(개발 StrictMode) 두 번 보냈다. 저장소에서 바로 읽는다
		const latest = useTestSessionStore.getState();
		// 홈으로 돌아가면 다시 풀기 확인 창이 뜨도록 로그인 값(doneToday·기록)도 새로 바꿔 둔다
		const apply = (fresh: ChallengeLogin) => {
			useTestSessionStore.getState().setLogin(fresh);
			setHistory(fresh.history);
		};
		const reload = () =>
			fetchLogin(login.name, login.code).then((r) => r.ok && apply(r.login));
		if (latest.challengeSentFor === finishedAt) {
			void reload();
			return;
		}
		latest.markChallengeSent(finishedAt);
		setChallengeNote('챌린지 기록 저장 중…');
		const report = buildReport(course, { ...session, startedAt, finishedAt });
		sendChallenge(challengeRecord(report, login))
			.then((r) => {
				if (r.ok) {
					apply(r.login);
					setChallengeNote('오늘 챌린지 기록을 저장했습니다.');
				} else setChallengeNote('챌린지 기록을 저장하지 못했습니다.');
			})
			.catch(() => setChallengeNote('챌린지 기록을 보내지 못했습니다.'));
		// eslint-disable-next-line react-hooks/exhaustive-deps -- 세션이 끝난 순간(finishedAt)마다 한 번
	}, [ready, finishedAt]);

	if (!ready) {
		return <Navigate to="/" replace />;
	}

	const report = buildReport(course, { ...session, startedAt, finishedAt });

	/**
	 * 공유: 안내 글 + 링크 한 덩어리를 창에서 보여 주고, 고친 뒤 «복사하기»(원장님 결정 2026-10-27).
	 * 카톡에 붙여 넣으면 글 아래 링크 카드가 붙는다. 휴대폰·PC 모두 같은 창 —
	 * NOTE: 윈도 크롬·엣지의 공유 창에는 PC 카카오톡도 «복사»도 없어서 공유 시트(navigator.share)는 쓰지 않는다.
	 */
	const closeShare = () => {
		clearTimeout(copiedTimer.current);
		setCopied(false);
		setDraft(null);
	};

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
			// 창은 닫지 않는다(원장님 결정 2026-10-27) — 다시 고쳐 복사하거나 «닫기»로 닫는다
			clearTimeout(copiedTimer.current);
			setCopied(true);
			copiedTimer.current = setTimeout(() => setCopied(false), 1800);
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
					<ChallengeHistory history={history} />
					{challengeNote && (
						<p className={s.challengeNote} role="status">
							{challengeNote}
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
						onClose={closeShare}
						title="테스트 결과 공유"
						description={hint}
						content={
							<>
								<textarea
									ref={draftRef}
									className={modal.modalTextarea}
									aria-label="보낼 글"
									value={draft ?? ''}
									onChange={(e) => setDraft(e.target.value)}
								/>
								{/* NOTE: 창(<dialog>)이 화면 맨 위 층이라 토스트도 창 «안»에 둬야 보인다 */}
								<p className={modal.modalToast} role="status" hidden={!copied}>
									복사 완료!
								</p>
							</>
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
							onClick={closeShare}
						>
							닫기
						</button>
					</Modal>
				</>
			}
		/>
	);
}
