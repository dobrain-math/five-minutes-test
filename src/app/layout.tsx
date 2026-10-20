import { BrowserRouter, Route, Routes } from 'react-router';
import HomePage from '@/app/page.tsx';
import ReportPage from '@/app/report/page.tsx';
import SharePage from '@/app/share/page.tsx';
import TestPage from '@/app/test/page.tsx';

export default function Layout() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/test/:testId" element={<TestPage />} />
				<Route path="/report/:testId" element={<ReportPage />} />
				<Route path="/s/:code" element={<SharePage />} />
				{/* NOTE: 2026-10-20 이전에 보낸 긴 링크(/share?r=코드)도 계속 열린다. */}
				<Route path="/share" element={<SharePage />} />
			</Routes>
		</BrowserRouter>
	);
}
