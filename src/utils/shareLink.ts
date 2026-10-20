import type { Report } from '@/@types/test';

/**
 * 링크에 싣는 짧은 모양. 유형 이름은 sections 에 한 번만 적고 틀린 문제는 그 번호로 가리킨다.
 * NOTE: 종목 정의가 나중에 바뀌어도 옛 링크가 그대로 보이도록 courseId 가 아니라 이름을 싣는다.
 */
type Payload = {
	v: 1;
	n: string;
	a: string;
	c: string;
	t: number;
	/** 테스트를 마친 시각. NOTE: 나중에 더한 칸이라 옛 링크에는 없다. */
	d?: number;
	/** [유형 이름, 맞힌 수, 문제 수] */
	s: [string, number, number][];
	/**
	 * 틀린 문제. 「식|적은 답|정답|유형 번호」를 ~ 로 이은 한 줄.
	 * NOTE: 80문제를 다 틀려도 링크가 길어지지 않도록 JSON 배열 대신 문자열로 줄였다.
	 */
	w: string;
};

function toBase64Url(text: string) {
	const bytes = new TextEncoder().encode(text);
	let binary = '';
	for (const b of bytes) binary += String.fromCharCode(b);
	return btoa(binary)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

function fromBase64Url(code: string) {
	const binary = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
	const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
	return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export function encodeReport(report: Report) {
	const index = new Map(report.sections.map((sec, i) => [sec.title, i]));
	const payload: Payload = {
		v: 1,
		n: report.studentName,
		a: report.studentAge,
		c: report.courseTitle,
		t: report.durationMs,
		d: report.finishedAt,
		s: report.sections.map((sec) => [sec.title, sec.correct, sec.total]),
		w: report.wrong
			.map((q) =>
				[q.text, q.mine, q.answer, index.get(q.sectionTitle) ?? -1].join('|'),
			)
			.join('~'),
	};
	return toBase64Url(JSON.stringify(payload));
}

const isPayload = (p: unknown): p is Payload => {
	const x = p as Payload;
	return (
		typeof x === 'object' &&
		x !== null &&
		x.v === 1 &&
		typeof x.n === 'string' &&
		typeof x.a === 'string' &&
		typeof x.c === 'string' &&
		typeof x.t === 'number' &&
		Array.isArray(x.s) &&
		typeof x.w === 'string'
	);
};

/** 공유 링크의 코드를 리포트로 되살린다. 읽을 수 없으면 null. */
export function decodeReport(code: string): Report | null {
	if (!code) return null;
	let payload: unknown;
	try {
		payload = JSON.parse(fromBase64Url(code));
	} catch {
		return null;
	}
	if (!isPayload(payload)) return null;

	const sections = payload.s.map(([title, correct, total]) => ({
		title,
		correct,
		total,
	}));
	return {
		studentName: payload.n,
		studentAge: payload.a,
		courseTitle: payload.c,
		correct: sections.reduce((sum, sec) => sum + sec.correct, 0),
		total: sections.reduce((sum, sec) => sum + sec.total, 0),
		durationMs: payload.t,
		...(typeof payload.d === 'number' && { finishedAt: payload.d }),
		sections,
		wrong: payload.w
			? payload.w.split('~').map((item) => {
					const [text, mine, answer, i] = item.split('|');
					return {
						text,
						mine,
						answer,
						sectionTitle: sections[Number(i)]?.title ?? '',
					};
				})
			: [],
	};
}

export function shareUrl(origin: string, code: string) {
	return `${origin}/share?r=${code}`;
}
