import { useNavigate, useSearchParams } from 'react-router';
import * as s from '@/components/ReportView.css.ts';
import ReportView from '@/components/ReportView.tsx';
import * as layout from '@/styles/utility.css.ts';
import { decodeReport } from '@/utils/shareLink.ts';

/** 공유 링크(/share?r=코드)로 받은 결과. 이 기기에 테스트 기록이 없어도 링크만으로 그린다. */
export default function SharePage() {
	const [params] = useSearchParams();
	const navigate = useNavigate();
	const report = decodeReport(params.get('r') ?? '');

	const homeButton = (
		<div className={s.buttonRow}>
			<button
				type="button"
				className={layout.primaryButton}
				onClick={() => navigate('/')}
			>
				나도 연산 테스트 풀어 보기
			</button>
		</div>
	);

	if (!report) {
		return (
			<main className={layout.page}>
				<div className={`${layout.container.narrow} ${layout.content}`}>
					<header className={s.header}>
						<h1 className={layout.title}>결과를 열 수 없어요</h1>
						<p className={layout.subtitle}>
							링크가 잘렸거나 잘못 복사된 것 같아요. 받은 링크 전체를 다시 열어
							주세요.
						</p>
					</header>
				</div>
				<div className={layout.bottomBar}>
					<div
						className={`${layout.container.narrow} ${layout.bottomBarInner}`}
					>
						{homeButton}
					</div>
				</div>
			</main>
		);
	}

	return <ReportView report={report} actions={homeButton} />;
}
