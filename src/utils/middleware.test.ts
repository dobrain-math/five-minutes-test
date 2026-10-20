import { afterEach, describe, expect, test, vi } from 'vitest';
import type { Report } from '@/@types/test';
import { getCourse } from '@/data/courses.ts';
import indexHtml from '../../index.html?raw';
import middleware from '../../middleware.ts';
import { encodeReport } from './shareLink.ts';

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

afterEach(() => vi.unstubAllGlobals());

describe('middleware (/s/코드 링크 카드)', () => {
	test('배포된 index.html 을 받아 카드 문구를 끼운 HTML 로 돌려준다', async () => {
		const fetchMock = vi.fn(async () => new Response(indexHtml));
		vi.stubGlobal('fetch', fetchMock);

		const res = await middleware(
			new Request(`https://five-minutes-test.vercel.app/s/${code}`),
		);

		expect(fetchMock).toHaveBeenCalledWith(
			new URL('https://five-minutes-test.vercel.app/index.html'),
		);
		expect(res?.headers.get('content-type')).toContain('text/html');
		const html = await res!.text();
		expect(html).toContain('content="⭐10월 20일(화) 연산 테스트 리포트"');
		expect(html).toContain('김하늘 학생의 금일 테스트 결과입니다.');
		// 앱은 그대로 뜬다
		expect(html).toContain('<div id="root"></div>');
	});

	test('예전 긴 주소(/share?r=코드)도 카드를 바꾼다', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => new Response(indexHtml)),
		);
		const res = await middleware(
			new Request(`https://five-minutes-test.vercel.app/share?r=${code}`),
		);
		expect(await res!.text()).toContain(
			'김하늘 학생의 금일 테스트 결과입니다.',
		);
	});

	test('읽을 수 없는 코드면 손대지 않고 넘긴다(앱이 「열 수 없습니다」를 보여 줌)', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
		const res = await middleware(
			new Request('https://five-minutes-test.vercel.app/s/zzz'),
		);
		expect(res).toBeUndefined();
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
