import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { encodeReport } from '../src/utils/shareLink.ts';
import { createShortLink, isShortId, resolveShortLink } from './shortLink.ts';

const CODE = '3BWJhc2ljCe2Zjeq4uOuPmQPYBIO1nw4IAAAAAAAAAAAAAAAAAAAAAAAA';

/** Upstash REST 를 흉내 낸다: 보낸 명령을 기록하고 정해 둔 result 를 차례로 돌려준다 */
function fakeRedis(...results: unknown[]) {
	const calls: unknown[][] = [];
	const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
		calls.push(JSON.parse(String(init.body)));
		return Response.json({ result: results.shift() ?? null });
	});
	vi.stubGlobal('fetch', fetchMock);
	return { calls, fetchMock };
}

beforeEach(() => {
	vi.stubEnv('KV_REST_API_URL', 'https://kv.example');
	vi.stubEnv('KV_REST_API_TOKEN', 'secret');
});
afterEach(() => {
	vi.unstubAllGlobals();
	vi.unstubAllEnvs();
});

describe('createShortLink', () => {
	test('6글자 id 를 만들어 «겹치면 안 씀(NX)»으로 저장한다', async () => {
		const { calls, fetchMock } = fakeRedis('OK');
		const id = await createShortLink(CODE);
		expect(id).toMatch(/^[A-Za-z0-9]{6}$/);
		expect(calls).toEqual([['SET', `r:${id}`, CODE, 'NX']]);
		expect(fetchMock.mock.calls[0][0]).toBe('https://kv.example');
		expect(
			(fetchMock.mock.calls[0][1].headers as Record<string, string>)
				.Authorization,
		).toBe('Bearer secret');
	});

	test('이미 있는 id 와 겹치면 새 id 로 다시 저장한다', async () => {
		const { calls } = fakeRedis(null, 'OK');
		const id = await createShortLink(CODE);
		expect(calls).toHaveLength(2);
		expect(calls[1][1]).toBe(`r:${id}`);
	});

	test('공유 코드 모양이 아니면 저장하지 않는다', async () => {
		const { fetchMock } = fakeRedis('OK');
		await expect(createShortLink('<script>')).rejects.toThrow();
		await expect(createShortLink('3' + 'A'.repeat(3000))).rejects.toThrow();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	test('지금 앱이 만드는 코드(최신 모양 번호)는 저장한다', async () => {
		// NOTE: v4 때 CODE_PATTERN 을 안 넓혀 저장이 막힐 뻔했다 — 모양 번호를 올리면 이 테스트가 잡는다.
		const latest = encodeReport({
			studentName: '김하늘',
			studentAge: '초3',
			courseId: 'basic',
			courseTitle: '기본연습',
			correct: 1,
			total: 1,
			durationMs: 60_000,
			sections: [{ title: '한한덧셈 (받아올림X)', correct: 1, total: 1 }],
			wrong: [],
		});
		const { calls } = fakeRedis('OK');
		await createShortLink(latest);
		expect(calls[0][2]).toBe(latest);
	});

	test('Upstash 주소가 Vercel 에 연결 안 돼 있으면 알려 준다', async () => {
		vi.unstubAllEnvs();
		await expect(createShortLink(CODE)).rejects.toThrow(/연결/);
	});

	test('UPSTASH_REDIS_REST_* 이름으로 들어와도 쓴다', async () => {
		vi.unstubAllEnvs();
		vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://up.example');
		vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 't');
		const { fetchMock } = fakeRedis('OK');
		await createShortLink(CODE);
		expect(fetchMock.mock.calls[0][0]).toBe('https://up.example');
	});
});

describe('resolveShortLink', () => {
	test('id 로 저장된 코드를 찾는다', async () => {
		const { calls } = fakeRedis(CODE);
		expect(await resolveShortLink('aB3x9K')).toBe(CODE);
		expect(calls).toEqual([['GET', 'r:aB3x9K']]);
	});

	test('없는 id 는 null', async () => {
		fakeRedis(null);
		expect(await resolveShortLink('zzzzzz')).toBeNull();
	});

	test('id 모양이 아니면 저장소에 묻지 않고 null', async () => {
		const { fetchMock } = fakeRedis(CODE);
		expect(await resolveShortLink('../../x')).toBeNull();
		expect(fetchMock).not.toHaveBeenCalled();
	});
});

describe('isShortId', () => {
	test('영문·숫자 6글자만', () => {
		expect(isShortId('aB3x9K')).toBe(true);
		expect(isShortId('aB3x9')).toBe(false);
		expect(isShortId('aB3x9K!')).toBe(false);
	});
});
