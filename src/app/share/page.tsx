import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import ReportView from '@/components/ReportView.tsx';
import * as layout from '@/styles/utility.css.ts';
import { decodeReport } from '@/utils/shareLink.ts';
import { fetchSharedCode } from '@/utils/shortLink.ts';
import * as s from './page.css.ts';

/**
 * 공유 링크로 받은 결과. 이 기기에 테스트 기록이 없어도 링크만으로 그린다.
 * 짧은 링크 /r/6글자(서버에 맡긴 코드를 받아 옴) · /s/코드 · 예전 /share?r=코드.
 * NOTE: 받는 사람(학부모)이 볼 화면이라 아래 버튼은 두지 않는다(원장님 결정 2026-10-20).
 */
export default function SharePage() {
	const { code, id } = useParams();
	const [params] = useSearchParams();
	// 짧은 링크: undefined = 받아 오는 중, null = 없음·실패
	const [fetched, setFetched] = useState<string | null | undefined>(undefined);

	useEffect(() => {
		if (!id) return;
		let alive = true;
		fetchSharedCode(id).then((c) => alive && setFetched(c));
		return () => {
			alive = false;
		};
	}, [id]);

	if (id && fetched === undefined)
		return <main className={`${layout.page} ${s.brokenPage}`} aria-busy />;

	const report = decodeReport((id ? fetched : (code ?? params.get('r'))) ?? '');

	if (!report) {
		return (
			<main className={`${layout.page} ${s.brokenPage}`}>
				<div className={s.brokenText}>
					<h1 className={layout.title}>결과를 열 수 없습니다</h1>
					<p className={layout.subtitle}>
						링크가 잘렸거나 잘못 복사된 것 같습니다. 받은 링크 전체를 다시 열어
						주세요.
					</p>
				</div>
			</main>
		);
	}

	return <ReportView report={report} />;
}
