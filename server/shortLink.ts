/**
 * 짧은 링크 저장소(Upstash Redis, Vercel 마켓플레이스로 연결).
 * 「r:6글자 id」 → 공유 코드(v3, 약 165자). 코드 안에 리포트 전체가 들어 있어 저장은 이 한 줄뿐이다.
 * NOTE: SDK 없이 Upstash REST(명령 배열을 POST)만 쓴다 — 미들웨어 묶음이 가볍고 테스트에서 흉내 내기 쉽다.
 * NOTE: 기한 없이 보관한다(결과 하나 약 200바이트, 무료 256MB 로 100만 건 이상).
 */

const ID_CHARS =
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const ID_LENGTH = 6;
/** 공유 코드(v2·v3·v4)만 받는다. 아무 글이나 저장되는 것을 막는다 */
// NOTE: 맨 앞 = 코드 모양 번호. 새 모양을 만들면 여기도 넓힌다(2026-10-22 v4 를 빠뜨려 저장이 막힐 뻔함).
const CODE_PATTERN = /^[2-5][A-Za-z0-9_-]{8,2000}$/;

export const isShortId = (id: string) =>
	new RegExp(`^[A-Za-z0-9]{${ID_LENGTH}}$`).test(id);

/** Vercel 이 연결 때 넣어 주는 환경 변수. 연결 방식에 따라 이름이 둘 중 하나다 */
function credentials() {
	const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
	const token =
		process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
	if (!url || !token)
		throw new Error(
			'Upstash Redis 가 연결되지 않았습니다(Vercel → Storage 에서 프로젝트에 연결)',
		);
	return { url, token };
}

async function redis(command: string[]): Promise<unknown> {
	const { url, token } = credentials();
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(command),
	});
	if (!res.ok) throw new Error(`Upstash 오류 ${res.status}`);
	return ((await res.json()) as { result: unknown }).result;
}

function randomId() {
	const bytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH));
	// NOTE: 256 % 62 만큼 앞 글자가 아주 조금 더 자주 나오지만 짧은 링크엔 상관없다.
	return Array.from(bytes, (b) => ID_CHARS[b % ID_CHARS.length]).join('');
}

/** 코드를 저장하고 6글자 id 를 돌려준다. id 가 겹치면(아주 드묾) 새로 뽑는다 */
export async function createShortLink(code: string) {
	if (!CODE_PATTERN.test(code)) throw new Error('공유 코드 모양이 아닙니다');
	for (let tries = 0; tries < 5; tries++) {
		const id = randomId();
		if ((await redis(['SET', `r:${id}`, code, 'NX'])) === 'OK') return id;
	}
	throw new Error('짧은 링크를 만들지 못했습니다');
}

/** id → 공유 코드. 없거나 id 모양이 아니면 null */
export async function resolveShortLink(id: string) {
	if (!isShortId(id)) return null;
	const code = await redis(['GET', `r:${id}`]);
	return typeof code === 'string' ? code : null;
}
