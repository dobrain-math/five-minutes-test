/**
 * Vercel 라우팅 미들웨어: 공유 링크(/s/코드)를 열 때만 끼어들어
 * index.html 의 링크 카드 문구를 «이 학생·이 날짜»로 바꿔 돌려준다.
 * NOTE: 카톡·문자의 미리보기는 자바스크립트를 실행하지 않고 HTML 의 og 메타만 읽는다.
 * 그래서 화면(React)이 아니라 여기서 바꿔야 한다. 이름·날짜는 코드 안에 있어 DB 가 필요 없다.
 * NOTE: 로컬 개발 서버(vite)에서는 돌지 않는다 — 배포 뒤에만 동작.
 */
import { injectCard, linkCard } from './src/utils/linkCard.ts';

// 짧은 주소 /s/코드 + 예전 긴 주소 /share?r=코드
export const config = { matcher: ['/s/:path*', '/share'] };

export default async function middleware(request: Request) {
	const url = new URL(request.url);
	// NOTE: 코드는 base64url 글자뿐이라 주소 디코딩이 필요 없다(잘못된 % 로 터지지도 않게).
	const code = url.pathname.startsWith('/s/')
		? url.pathname.slice('/s/'.length)
		: (url.searchParams.get('r') ?? '');
	const card = linkCard(code);
	// 읽을 수 없는 코드는 그대로 넘긴다 → 앱이 「결과를 열 수 없습니다」를 보여 준다
	if (!card) return undefined;

	const page = await fetch(new URL('/index.html', url.origin));
	const html = injectCard(await page.text(), card, url.href);
	return new Response(html, {
		headers: {
			'content-type': 'text/html; charset=utf-8',
			'cache-control': 'public, max-age=0, must-revalidate',
		},
	});
}
