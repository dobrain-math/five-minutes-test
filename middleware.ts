/**
 * Vercel 라우팅 미들웨어 진입점. 할 일은 server/handle.ts 에 있다(링크 카드, 짧은 링크 /api/share).
 * NOTE: 여기서는 묶어 둔 JS(server/handle.gen.js) «하나만» 불러온다. .ts 파일을 불러오면
 * 배포에서 매번 MIDDLEWARE_INVOCATION_FAILED 로 터졌다(2026-10-20). server/*.ts 를 고치면 `bun run build:server`.
 * NOTE: 로컬 개발 서버(vite)에서는 돌지 않는다 — 배포 뒤에만 동작.
 */
import { handle } from './server/handle.gen.js';

// 짧은 링크 /r/6글자 · 공유 코드 /s/코드 · 예전 /share?r=코드 · 짧은 링크 API
export const config = {
	matcher: ['/r/:path*', '/s/:path*', '/share', '/api/share'],
};

export default function middleware(request: Request) {
	return handle(request);
}
