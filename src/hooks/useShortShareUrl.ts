import { useEffect, useState } from 'react';
import { requestShortId } from '@/utils/shortLink.ts';

/**
 * 리포트를 여는 순간 짧은 링크(/r/6글자)를 미리 만들어 둔다. 준비 전·실패면 null.
 * NOTE: 「공유」를 누른 뒤에 서버를 기다리면 아이폰 사파리가 공유 시트를 막는다(누른 직후에만 허용).
 * 그래서 미리 만들고, 새로고침해도 같은 링크를 쓰도록 sessionStorage 에 코드별로 기억한다.
 */
export function useShortShareUrl(code: string | null) {
	const key = code && `short-link:${code}`;
	const [id, setId] = useState<string | null>(() => {
		try {
			return key ? sessionStorage.getItem(key) : null;
		} catch {
			return null;
		}
	});

	useEffect(() => {
		if (!key || !code || id) return;
		let alive = true;
		requestShortId(code).then((newId) => {
			if (!alive || !newId) return;
			setId(newId);
			try {
				sessionStorage.setItem(key, newId);
			} catch {
				// 저장 못 해도 이번 화면에서는 쓴다
			}
		});
		return () => {
			alive = false;
		};
	}, [key, code, id]);

	return id ? `${window.location.origin}/r/${id}` : null;
}
