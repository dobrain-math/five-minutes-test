import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// 화면에 쓰인 글자만 내려받는 Pretendard 가변 글꼴(프로젝트에 포함, 외부 CDN 불필요)
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import Layout from '@/app/layout.tsx';
import './main.css.ts';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Layout />
	</StrictMode>,
);
