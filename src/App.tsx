import { BrowserRouter, Route, Routes } from 'react-router';
import HomePage from '@/pages/HomePage.tsx';
import ReportPage from '@/pages/ReportPage.tsx';
import TestPage from '@/pages/TestPage.tsx';

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/test/:testId" element={<TestPage />} />
				<Route path="/report/:testId" element={<ReportPage />} />
			</Routes>
		</BrowserRouter>
	);
}
