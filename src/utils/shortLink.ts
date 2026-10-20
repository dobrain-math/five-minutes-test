/**
 * 짧은 링크(/r/6글자) 서버 요청. 서버는 server/handle.ts(/api/share).
 * NOTE: 로컬 개발 서버·저장소 미연결·오프라인이면 null — 부르는 쪽이 긴 링크(/s/코드)로 대신 보낸다.
 */

/** 공유 코드를 서버에 맡기고 6글자 id 를 받는다 */
export async function requestShortId(code: string): Promise<string | null> {
	try {
		const res = await fetch('/api/share', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ code }),
		});
		if (!res.ok) return null;
		const { id } = (await res.json()) as { id?: unknown };
		return typeof id === 'string' ? id : null;
	} catch {
		return null;
	}
}

/** 6글자 id → 맡긴 공유 코드. 없거나 실패하면 null */
export async function fetchSharedCode(id: string): Promise<string | null> {
	try {
		const res = await fetch(`/api/share?id=${encodeURIComponent(id)}`);
		if (!res.ok) return null;
		const { code } = (await res.json()) as { code?: unknown };
		return typeof code === 'string' ? code : null;
	} catch {
		return null;
	}
}
