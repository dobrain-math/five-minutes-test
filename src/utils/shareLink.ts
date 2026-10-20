import type { Report } from '@/@types/test';
import { getCourse } from '@/data/courses.ts';
import {
	type Reader,
	V3,
	Writer,
	base64UrlToBytes,
	bytesToBase64Url,
	readHead,
	writeAge,
} from '@/utils/shareCode.ts';

/**
 * 예전(v1) 링크 모양. 유형 이름(한글 문장)을 통째로 실은 JSON 이라 900자 안팎으로 길었다.
 * NOTE: 이미 보낸 링크가 있으니 읽기만 계속 지원한다(2026-10-20 v2 → v3 로 교체).
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

/**
 * 식의 연산 기호 ↔ 번호. 화면 식은 buildTest 가 「27 − 8」처럼 만든다.
 * RAW 는 이 모양이 아니거나 정답이 계산과 다른 문제 — 식·정답을 글자 그대로 싣는다.
 */
const OPS = ['+', '−', '×', '-'] as const;
const RAW = 7;

const calc = (left: number, op: number, right: number) =>
	op === 0 ? left + right : op === 2 ? left * right : left - right;

const isPlainNumber = (s: string) => /^(0|[1-9]\d{0,14})$/.test(s);

/** 음수도 작은 수로: 0,-1,1,-2,2 … → 0,1,2,3,4 … */
const zigzag = (d: number) => (d >= 0 ? d * 2 : -d * 2 - 1);
const unzigzag = (z: number) => (z % 2 === 0 ? z / 2 : -(z + 1) / 2);

// ── 쓰기(v3) ─────────────────────────────────────────────

/**
 * 적은 답: 0 = 빈칸, 1 = 글자 그대로(뒤따름), 그 밖 = «정답과의 차이» + 2.
 * NOTE: 틀린 답은 대개 정답과 1·10 차이라 차이로 적으면 1바이트에 들어간다.
 */
function writeMine(w: Writer, mine: string, answer: string) {
	if (mine === '') w.num(0);
	else if (isPlainNumber(mine)) {
		const base = isPlainNumber(answer) ? Number(answer) : 0;
		w.num(zigzag(Number(mine) - base) + 2);
	} else {
		w.num(1);
		w.str(mine);
	}
}

/**
 * 리포트 → 링크에 붙일 코드(v3).
 * 유형·종목 이름은 싣지 않고(courses.ts 에서 되찾는다) 숫자는 바이트로 묶는다.
 * 틀린 문제의 정답은 식에서 다시 계산하고, 적은 답은 정답과의 차이만 싣는다.
 * NOTE: lz-string 압축도 재 봤지만 흔한 결과가 337자로 이 방식보다 길었다.
 * 글자는 base64url(A-Z a-z 0-9 - _)만 써서 카톡·문자가 링크를 중간에 끊지 않는다.
 */
export function encodeReport(report: Report) {
	const w = new Writer();
	w.str(report.courseId ?? '');
	w.str(report.studentName);
	writeAge(w, report.studentAge);
	w.num(Math.round(report.durationMs / 1000));
	// 실시일은 분 단위로 충분하다. 0 = 없음
	w.num(
		report.finishedAt === undefined
			? 0
			: Math.round(report.finishedAt / 60_000),
	);

	// 유형마다 문제 수가 같으면(늘 10) 한 번만 적는다. 0 = 유형마다 따로
	const totals = new Set(report.sections.map((sec) => sec.total));
	const common = totals.size === 1 ? [...totals][0] : 0;
	w.num(report.sections.length);
	w.num(common);
	for (const sec of report.sections) {
		w.num(sec.correct);
		if (common === 0) w.num(sec.total);
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
		writeMine(w, q.mine, q.answer);
	}
	return V3 + bytesToBase64Url(w.bytes);
}

// ── 읽기(v2·v3) ──────────────────────────────────────────

function readMine(r: Reader, version: 2 | 3, answer: string) {
	const v = r.num();
	if (v === 0) return '';
	if (v === 1) return r.str();
	if (version === 2) return String(v - 2);
	const base = isPlainNumber(answer) ? Number(answer) : 0;
	return String(base + unzigzag(v - 2));
}

function decodeShort(code: string): Report | null {
	const read = readHead(code);
	if (!read) return null;
	const { head, reader: r } = read;
	const course = getCourse(head.courseId);
	if (!course) return null;

	const count = r.num();
	if (count !== course.sections.length) return null;
	const common = head.version === 3 ? r.num() : 0;
	const sections = course.sections.map((sec) => {
		const correct = r.num();
		return { title: sec.title, correct, total: common || r.num() };
	});

	const wrong = Array.from({ length: r.num() }, () => {
		const h = r.num();
		const op = Math.floor(h / 16);
		const sectionTitle = sections[h % 16]?.title ?? '';
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
		const mine = readMine(r, head.version, answer);
		return { text, mine, answer, sectionTitle };
	});

	return {
		studentName: head.studentName,
		studentAge: head.studentAge,
		courseId: head.courseId,
		courseTitle: course.title,
		correct: sections.reduce((sum, sec) => sum + sec.correct, 0),
		total: sections.reduce((sum, sec) => sum + sec.total, 0),
		durationMs: head.durationMs,
		...(head.finishedAt !== undefined && { finishedAt: head.finishedAt }),
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
		return code.startsWith('e') ? decodeV1(code) : decodeShort(code);
	} catch {
		return null;
	}
}

/** 짧은 주소 /s/코드. 예전 /share?r=코드 도 계속 열린다(layout.tsx). */
export function shareUrl(origin: string, code: string) {
	return `${origin}/s/${code}`;
}
