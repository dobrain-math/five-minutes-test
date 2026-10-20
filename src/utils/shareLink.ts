import type { Report } from '@/@types/test';
import { getCourse } from '@/data/courses.ts';

/**
 * 예전(v1) 링크 모양. 유형 이름(한글 문장)을 통째로 실은 JSON 이라 900자 안팎으로 길었다.
 * NOTE: 이미 보낸 링크가 있으니 읽기만 계속 지원한다(2026-10-20 v2 로 교체).
 */
type PayloadV1 = {
	v: 1;
	n: string;
	a: string;
	c: string;
	t: number;
	d?: number;
	/** [유형 이름, 맞힌 수, 문제 수] */
	s: [string, number, number][];
	/** 「식|적은 답|정답|유형 번호」를 ~ 로 이은 한 줄 */
	w: string;
};

/** v2 코드 맨 앞 글자. v1 코드는 늘 'e'(base64 의 '{"')로 시작해서 겹치지 않는다. */
const V2 = '2';

/**
 * 식의 연산 기호 ↔ 번호. 화면 식은 buildTest 가 「27 − 8」처럼 만든다.
 * RAW 는 이 모양이 아니거나 정답이 계산과 다른 문제 — 식·정답을 글자 그대로 싣는다.
 */
const OPS = ['+', '−', '×', '-'] as const;
const RAW = 7;

const calc = (left: number, op: number, right: number) =>
	op === 0 ? left + right : op === 2 ? left * right : left - right;

// ── 바이트 쓰기·읽기 ─────────────────────────────────────

/** 숫자는 7비트씩 끊어 적는다(작은 수는 1바이트). 글자는 길이 + UTF-8. */
class Writer {
	bytes: number[] = [];
	num(n: number) {
		let v = Math.max(0, Math.floor(n));
		while (v >= 0x80) {
			this.bytes.push((v % 0x80) | 0x80);
			v = Math.floor(v / 0x80);
		}
		this.bytes.push(v);
	}
	str(s: string) {
		const utf8 = new TextEncoder().encode(s);
		this.num(utf8.length);
		this.bytes.push(...utf8);
	}
}

class Reader {
	i = 0;
	bytes: Uint8Array;
	constructor(bytes: Uint8Array) {
		this.bytes = bytes;
	}
	num() {
		let v = 0;
		let scale = 1;
		for (;;) {
			if (this.i >= this.bytes.length) throw new Error('코드가 잘렸습니다');
			const b = this.bytes[this.i++];
			v += (b & 0x7f) * scale;
			if (b < 0x80) return v;
			scale *= 0x80;
		}
	}
	str() {
		const len = this.num();
		if (this.i + len > this.bytes.length) throw new Error('코드가 잘렸습니다');
		const s = new TextDecoder('utf-8', { fatal: true }).decode(
			this.bytes.subarray(this.i, this.i + len),
		);
		this.i += len;
		return s;
	}
}

function bytesToBase64Url(bytes: ArrayLike<number>) {
	let binary = '';
	for (let i = 0; i < bytes.length; i++)
		binary += String.fromCharCode(bytes[i]);
	return btoa(binary)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

function base64UrlToBytes(code: string) {
	const binary = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
	return Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
}

// ── 쓰기 ─────────────────────────────────────────────────

/** 적은 답: 0 = 빈칸, 1 = 글자 그대로(뒤따름), n + 2 = 숫자 n */
function writeMine(w: Writer, mine: string) {
	if (mine === '') w.num(0);
	else if (/^(0|[1-9]\d{0,14})$/.test(mine)) w.num(Number(mine) + 2);
	else {
		w.num(1);
		w.str(mine);
	}
}

/**
 * 리포트 → 링크에 붙일 코드(v2).
 * 유형·종목 이름은 싣지 않고(courses.ts 에서 되찾는다) 숫자는 바이트로 묶는다.
 * 틀린 문제의 정답도 식에서 다시 계산하므로 싣지 않는다.
 * NOTE: lz-string 압축도 재 봤지만 흔한 결과가 337자로 이 방식(약 200자)보다 길었다.
 * 글자는 base64url(A-Z a-z 0-9 - _)만 써서 카톡·문자가 링크를 중간에 끊지 않는다.
 */
export function encodeReport(report: Report) {
	const w = new Writer();
	w.str(report.courseId ?? '');
	w.str(report.studentName);
	w.str(report.studentAge);
	w.num(report.durationMs);
	// 실시일은 초 단위로 충분하다. 0 = 없음
	w.num(report.finishedAt === undefined ? 0 : report.finishedAt / 1000);
	w.num(report.sections.length);
	for (const sec of report.sections) {
		w.num(sec.correct);
		w.num(sec.total);
	}

	const index = new Map(report.sections.map((sec, i) => [sec.title, i]));
	w.num(report.wrong.length);
	for (const q of report.wrong) {
		const section = index.get(q.sectionTitle) ?? 0;
		const m = /^(\d{1,9}) (\S) (\d{1,9})$/.exec(q.text);
		const op = m ? OPS.indexOf(m[2] as (typeof OPS)[number]) : -1;
		const fits =
			m !== null &&
			op >= 0 &&
			String(calc(Number(m[1]), op, Number(m[3]))) === q.answer;
		// 한 바이트에 «연산 번호 × 16 + 유형 번호»
		w.num((fits ? op : RAW) * 16 + section);
		if (fits) {
			w.num(Number(m[1]));
			w.num(Number(m[3]));
		} else {
			w.str(q.text);
			w.str(q.answer);
		}
		writeMine(w, q.mine);
	}
	return V2 + bytesToBase64Url(w.bytes);
}

// ── 읽기 ─────────────────────────────────────────────────

function readMine(r: Reader) {
	const v = r.num();
	return v === 0 ? '' : v === 1 ? r.str() : String(v - 2);
}

function decodeV2(code: string): Report | null {
	const r = new Reader(base64UrlToBytes(code));
	const courseId = r.str();
	const course = getCourse(courseId);
	if (!course) return null;
	const studentName = r.str();
	const studentAge = r.str();
	const durationMs = r.num();
	const finishedSec = r.num();

	const count = r.num();
	if (count !== course.sections.length) return null;
	const sections = course.sections.map((sec) => ({
		title: sec.title,
		correct: r.num(),
		total: r.num(),
	}));

	const wrongCount = r.num();
	const wrong = Array.from({ length: wrongCount }, () => {
		const head = r.num();
		const op = Math.floor(head / 16);
		const sectionTitle = sections[head % 16]?.title ?? '';
		let text: string;
		let answer: string;
		if (op === RAW) {
			text = r.str();
			answer = r.str();
		} else {
			if (op >= OPS.length) throw new Error('알 수 없는 연산');
			const left = r.num();
			const right = r.num();
			text = `${left} ${OPS[op]} ${right}`;
			answer = String(calc(left, op, right));
		}
		return { text, mine: readMine(r), answer, sectionTitle };
	});

	return {
		studentName,
		studentAge,
		courseId,
		courseTitle: course.title,
		correct: sections.reduce((sum, sec) => sum + sec.correct, 0),
		total: sections.reduce((sum, sec) => sum + sec.total, 0),
		durationMs,
		...(finishedSec > 0 && { finishedAt: finishedSec * 1000 }),
		sections,
		wrong,
	};
}

const isPayloadV1 = (p: unknown): p is PayloadV1 => {
	const x = p as PayloadV1;
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

function decodeV1(code: string): Report | null {
	const payload: unknown = JSON.parse(
		new TextDecoder('utf-8', { fatal: true }).decode(base64UrlToBytes(code)),
	);
	if (!isPayloadV1(payload)) return null;
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

/** 공유 링크의 코드를 리포트로 되살린다. 읽을 수 없으면 null. */
export function decodeReport(code: string): Report | null {
	if (!code) return null;
	try {
		return code.startsWith(V2) ? decodeV2(code.slice(1)) : decodeV1(code);
	} catch {
		return null;
	}
}

/** 짧은 주소 /s/코드. 예전 /share?r=코드 도 계속 열린다(layout.tsx). */
export function shareUrl(origin: string, code: string) {
	return `${origin}/s/${code}`;
}
