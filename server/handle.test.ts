import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import indexHtml from '../index.html?raw';
import type { Report } from '../src/@types/test';
import { getCourse } from '../src/data/courses.ts';
import { encodeReport } from '../src/utils/shareLink.ts';
import { handle } from './handle.ts';

const SITE = 'https://five-minutes-test.vercel.app';
const course = getCourse('basic')!;
const code = encodeReport({
	studentName: '김하늘',
	studentAge: '초2',
	courseId: 'basic',
	courseTitle: course.title,
	correct: 80,
	total: 80,
	durationMs: 300_000,
	finishedAt: Date.UTC(2026, 9, 20, 9, 25),
	sections: course.sections.map((sec) => ({
		title: sec.title,
		correct: 10,
		total: 10,
	})),
	wrong: [],
} satisfies Report);

/** 배포 사이트(index.html)와 Upstash 를 함께 흉내 낸다 */
function fakeWorld(store: Record<string, string> = {}) {
	const fetchMock = vi.fn(async (input: string | URL, init?: RequestInit) => {
		const url = String(input);
		if (url === `${SITE}/index.html`) return new Response(indexHtml);
		if (url === 'https://kv.example') {
			const [cmd, key, value] = JSON.parse(String(init?.body)) as string[];
			if (cmd === 'SET') {
				if (key in store) return Response.json({ result: null });
				store[key] = value;
				return Response.json({ result: 'OK' });
			}
			return Response.json({ result: store[key] ?? null });
		}
		throw new Error(`예상 못 한 요청 ${url}`);
	});
	vi.stubGlobal('fetch', fetchMock);
	return { fetchMock, store };
}

beforeEach(() => {
	vi.stubEnv('KV_REST_API_URL', 'https://kv.example');
	vi.stubEnv('KV_REST_API_TOKEN', 'secret');
});
afterEach(() => {
	vi.unstubAllGlobals();
	vi.unstubAllEnvs();
});

const card = async (res: Response | undefined) => {
	expect(res?.headers.get('content-type')).toContain('text/html');
	return res!.text();
};

describe('링크 카드', () => {
	test('/s/코드: index.html 에 이 학생·이 날짜 카드 문구를 끼운다', async () => {
		fakeWorld();
		const html = await card(await handle(new Request(`${SITE}/s/${code}`)));
		expect(html).toContain('content="⭐10월 20일(화) 연산 테스트 리포트"');
		expect(html).toContain('김하늘 학생의 금일 테스트 결과입니다.');
		expect(html).toContain('<div id="root"></div>');
	});

	test('예전 긴 주소(/share?r=코드)도', async () => {
		fakeWorld();
		const html = await card(
			await handle(new Request(`${SITE}/share?r=${code}`)),
		);
		expect(html).toContain('김하늘 학생의 금일 테스트 결과입니다.');
	});

	test('짧은 링크(/r/6글자)는 저장소에서 코드를 찾아 카드를 끼운다', async () => {
		fakeWorld({ 'r:aB3x9K': code });
		const html = await card(await handle(new Request(`${SITE}/r/aB3x9K`)));
		expect(html).toContain('content="⭐10월 20일(화) 연산 테스트 리포트"');
		expect(html).toContain(`content="${SITE}/r/aB3x9K"`);
	});

	test('읽을 수 없는 코드·없는 짧은 링크는 손대지 않고 넘긴다(앱이 안내)', async () => {
		const { fetchMock } = fakeWorld();
		expect(await handle(new Request(`${SITE}/s/zzz`))).toBeUndefined();
		expect(await handle(new Request(`${SITE}/r/zzzzzz`))).toBeUndefined();
		expect(fetchMock.mock.calls.map((c) => String(c[0]))).not.toContain(
			`${SITE}/index.html`,
		);
	});

	test('저장소가 연결 안 돼 있어도 /r/ 은 터지지 않고 넘긴다', async () => {
		vi.unstubAllEnvs();
		fakeWorld();
		expect(await handle(new Request(`${SITE}/r/aB3x9K`))).toBeUndefined();
	});

	test('그 밖의 주소는 손대지 않는다', async () => {
		const { fetchMock } = fakeWorld();
		expect(await handle(new Request(`${SITE}/report/basic`))).toBeUndefined();
		expect(fetchMock).not.toHaveBeenCalled();
	});
});

describe('/api/share', () => {
	const post = (body: unknown) =>
		handle(
			new Request(`${SITE}/api/share`, {
				method: 'POST',
				body: JSON.stringify(body),
			}),
		);

	test('POST {code} → 저장하고 {id} 를 돌려준다', async () => {
		const { store } = fakeWorld();
		const res = await post({ code });
		expect(res?.status).toBe(200);
		const { id } = (await res!.json()) as { id: string };
		expect(id).toMatch(/^[A-Za-z0-9]{6}$/);
		expect(store[`r:${id}`]).toBe(code);
	});

	test('공유 코드가 아니면 400', async () => {
		fakeWorld();
		expect((await post({ code: '<b>' }))?.status).toBe(400);
		expect((await post({}))?.status).toBe(400);
	});

	test('저장소가 연결 안 돼 있으면 503(앱은 긴 링크로 대신 보낸다)', async () => {
		vi.unstubAllEnvs();
		fakeWorld();
		expect((await post({ code }))?.status).toBe(503);
	});

	test('GET ?id= → {code}, 없으면 404', async () => {
		fakeWorld({ 'r:aB3x9K': code });
		const ok = await handle(new Request(`${SITE}/api/share?id=aB3x9K`));
		expect(await ok!.json()).toEqual({ code });
		const missing = await handle(new Request(`${SITE}/api/share?id=zzzzzz`));
		expect(missing?.status).toBe(404);
	});
});
