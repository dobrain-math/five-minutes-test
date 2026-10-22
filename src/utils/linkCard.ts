/**
 * 카톡·문자 링크 카드(미리보기) 문구. 리포트마다 이름·실시일이 달라서
 * Vercel 미들웨어(middleware.ts)가 /s/코드 를 열 때 index.html 의 메타를 바꿔 끼운다.
 * NOTE: 미들웨어가 가져다 쓰므로 '@/' 별칭·종목 데이터 없이 상대 경로만 쓴다.
 */
import { formatCardDate } from './formatDate.ts';
import { base64UrlToBytes, readHead } from './shareCode.ts';

export type Card = { title: string; description: string };

/** 코드에서 이름·실시일만 읽는다(v1 긴 JSON 도). 못 읽으면 null */
function readNameAndDate(code: string) {
	if (code.startsWith('e')) {
		const p = JSON.parse(
			new TextDecoder('utf-8', { fatal: true }).decode(base64UrlToBytes(code)),
		) as { n?: unknown; d?: unknown };
		if (typeof p?.n !== 'string') return null;
		return {
			name: p.n,
			finishedAt: typeof p.d === 'number' ? p.d : undefined,
		};
	}
	const read = readHead(code);
	return (
		read && { name: read.head.studentName, finishedAt: read.head.finishedAt }
	);
}

export function linkCard(code: string): Card | null {
	if (!code) return null;
	let info: ReturnType<typeof readNameAndDate>;
	try {
		info = readNameAndDate(code);
	} catch {
		return null;
	}
	if (!info) return null;
	return cardText(info.name, info.finishedAt);
}

/**
 * 카드 제목·설명 문구. 링크 카드와 공유 시트 글(shareParts)이 함께 쓴다.
 * 원장님 지정 형식(2026-10-20): 「⭐m월 d일(요일) 연산 테스트 리포트」 + 「OOO 학생의 금일 …」
 */
export function cardText(name: string, finishedAt?: number): Card {
	const date = finishedAt === undefined ? '' : `${formatCardDate(finishedAt)} `;
	return {
		title: `⭐${date}연산 테스트 리포트`,
		description: `${name} 학생의 금일 테스트 결과입니다. 클릭해 자세한 리포트를 확인해 보세요.`,
	};
}

const escapeHtml = (s: string) =>
	s
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

/** index.html 의 제목·설명·주소 메타를 카드 문구로 바꾼다 */
export function injectCard(html: string, card: Card, url: string) {
	const title = escapeHtml(card.title);
	const description = escapeHtml(card.description);
	const meta = (attr: string, key: string, value: string) => (out: string) =>
		out.replace(
			new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`),
			`<meta ${attr}="${key}" content="${value}" />`,
		);
	return [
		meta('property', 'og:title', title),
		meta('property', 'og:description', description),
		meta('name', 'description', description),
		meta('property', 'og:url', escapeHtml(url)),
	].reduce(
		(out, apply) => apply(out),
		html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`),
	);
}
