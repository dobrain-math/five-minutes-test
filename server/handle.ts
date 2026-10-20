/**
 * 서버(Vercel 미들웨어)가 하는 일 전부.
 * - 링크 카드: /s/코드 · /share?r=코드 · /r/6글자 를 열면 index.html 의 og 메타를 «이 학생·이 날짜»로 바꿔 돌려준다.
 *   카톡·문자의 미리보기는 자바스크립트를 실행하지 않고 HTML 의 og 메타만 읽어서, 화면(React)이 아니라 여기서 바꾼다.
 * - /api/share: POST {code} → 짧은 링크 저장 {id}, GET ?id= → {code}
 *
 * NOTE: 이 파일은 그대로 배포되지 않는다. `bun run build:server` 가 하나의 JS(handle.gen.js)로 묶고,
 * 루트 middleware.ts 는 그 JS 만 불러온다. Vercel 미들웨어가 «.ts 확장자로 적힌 가져오기»를 불러오다
 * 실행할 때마다 터졌기 때문(2026-10-20 배포에서 MIDDLEWARE_INVOCATION_FAILED).
 * 고친 뒤에는 반드시 `bun run build:server` — handle.gen.test.ts 가 묶음이 최신인지 검사한다.
 */
import { injectCard, linkCard } from '../src/utils/linkCard.ts';
import { createShortLink, resolveShortLink } from './shortLink.ts';

const json = (body: unknown, status = 200) =>
	Response.json(body, {
		status,
		headers: { 'cache-control': 'no-store' },
	});

async function api(request: Request, url: URL) {
	if (request.method === 'POST') {
		let code: unknown;
		try {
			code = ((await request.json()) as { code?: unknown }).code;
		} catch {
			return json({ error: '잘못된 요청' }, 400);
		}
		if (typeof code !== 'string' || !linkCard(code))
			return json({ error: '공유 코드가 아닙니다' }, 400);
		try {
			return json({ id: await createShortLink(code) });
		} catch (e) {
			// 저장소 미연결·장애 → 앱은 긴 링크(/s/코드)로 대신 보낸다
			return json({ error: (e as Error).message }, 503);
		}
	}
	try {
		const code = await resolveShortLink(url.searchParams.get('id') ?? '');
		return code ? json({ code }) : json({ error: '없는 링크' }, 404);
	} catch (e) {
		return json({ error: (e as Error).message }, 503);
	}
}

/** 주소에서 공유 코드를 찾는다. 짧은 링크는 저장소에 묻는다. 없으면 '' */
async function codeOf(url: URL) {
	const { pathname } = url;
	// NOTE: 코드·id 는 영문·숫자·-_ 뿐이라 주소 디코딩이 필요 없다(잘못된 % 로 터지지도 않게).
	if (pathname.startsWith('/s/')) return pathname.slice('/s/'.length);
	if (pathname === '/share') return url.searchParams.get('r') ?? '';
	if (pathname.startsWith('/r/')) {
		try {
			return (await resolveShortLink(pathname.slice('/r/'.length))) ?? '';
		} catch {
			return ''; // 저장소 장애 → 카드 없이 앱으로
		}
	}
	return '';
}

/** 처리할 요청이면 Response, 아니면 undefined(그대로 넘김) */
export async function handle(request: Request): Promise<Response | undefined> {
	const url = new URL(request.url);
	if (url.pathname === '/api/share') return api(request, url);

	const card = linkCard(await codeOf(url));
	// 읽을 수 없으면 그대로 넘긴다 → 앱이 「결과를 열 수 없습니다」를 보여 준다
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
