import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router';
import HomePage from '@/app/page.tsx';
import ReportPage from '@/app/report/page.tsx';
import SharePage from '@/app/share/page.tsx';
import TestPage from '@/app/test/page.tsx';

/**
 * 화면(주소)이 바뀌면 맨 위로 올린다.
 * NOTE: 홈에서 유형 목록을 내려 고른 위치가 시험 화면에 그대로 남아 7번 문제부터 보였다(2026-10-22).
 */
function ScrollToTop() {
	const { pathname } = useLocation();
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);
	return null;
}

export default function Layout() {
	return (
		<BrowserRouter>
			<ScrollToTop />
			<Routes>
				<Route path="/" element={<HomePage />} />
				{/* NOTE: 끝의 :part = 유형 번호(1부터). 없으면 전체 풀기(2026-10-22). */}
				<Route path="/test/:testId/:part?" element={<TestPage />} />
				<Route path="/report/:testId/:part?" element={<ReportPage />} />
				<Route path="/r/:id" element={<SharePage />} />
				<Route path="/s/:code" element={<SharePage />} />
				{/* NOTE: 2026-10-20 이전에 보낸 긴 링크(/share?r=코드)도 계속 열린다. */}
				<Route path="/share" element={<SharePage />} />
			</Routes>
		</BrowserRouter>
	);
}
