import { afterEach, describe, expect, test, vi } from 'vitest';
import { fetchSharedCode, requestShortId } from './shortLink.ts';

afterEach(() => vi.unstubAllGlobals());

describe('requestShortId', () => {
	test('서버에 코드를 맡기고 6글자 id 를 받는다', async () => {
		const fetchMock = vi.fn(async () => Response.json({ id: 'aB3x9K' }));
		vi.stubGlobal('fetch', fetchMock);
		expect(await requestShortId('3abc')).toBe('aB3x9K');
		expect(fetchMock).toHaveBeenCalledWith('/api/share', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ code: '3abc' }),
		});
	});

	test('서버가 없거나(로컬 개발) 실패하면 null — 긴 링크로 대신 보낸다', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => new Response('<html>', { status: 404 })),
		);
		expect(await requestShortId('3abc')).toBeNull();
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => {
				throw new TypeError('offline');
			}),
		);
		expect(await requestShortId('3abc')).toBeNull();
	});
});

describe('fetchSharedCode', () => {
	test('id 로 맡긴 코드를 받는다', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => Response.json({ code: '3abc' })),
		);
		expect(await fetchSharedCode('aB3x9K')).toBe('3abc');
	});

	test('없는 링크·실패는 null', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => Response.json({ error: 'x' }, { status: 404 })),
		);
		expect(await fetchSharedCode('aB3x9K')).toBeNull();
	});
});
