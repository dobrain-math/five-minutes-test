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
				<Route path="/share" element={<SharePage />} />
			</Routes>
		</BrowserRouter>
	);
}
