import type { Report, SectionScore } from '@/@types/test';
import { getCourse } from '@/data/courses.ts';
import {
	type Reader,
	V5,
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

// ── 쓰기(v5) ─────────────────────────────────────────────

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
 * 리포트 → 링크에 붙일 코드(v5 — v3 에 풀이 범위·유형별 시간(v4), 틀린 문제 머리 모양을 바꿈(v5)).
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
	// NOTE: 화면(formatDuration)이 초를 버림하므로 링크도 버림 — 반올림하면 받은 쪽이 1초 길게 보였다(2026-10-22).
	w.num(Math.floor(report.durationMs / 1000));
	// 실시일은 분 단위로 충분하다. 0 = 없음
	w.num(
		report.finishedAt === undefined
			? 0
			: Math.round(report.finishedAt / 60_000),
	);

	// 풀이 범위: 0 = 전체 풀기, n = n번 유형 하나(1부터)
	w.num(report.part === undefined ? 0 : report.part + 1);

	// 유형마다 문제 수가 같으면(늘 24) 한 번만 적는다. 0 = 유형마다 따로
	const totals = new Set(report.sections.map((sec) => sec.total));
	const common = totals.size === 1 ? [...totals][0] : 0;
	w.num(report.sections.length);
	w.num(common);
	for (const sec of report.sections) {
		w.num(sec.correct);
		if (common === 0) w.num(sec.total);
	}

	// 유형(페이지)마다 걸린 초. 0 = 없음, 1 = 뒤따름
	const timed = report.sections.every((sec) => sec.durationMs !== undefined);
	w.num(timed ? 1 : 0);
	if (timed) {
		for (const sec of report.sections)
			w.num(Math.floor((sec.durationMs ?? 0) / 1000));
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
		// «유형 번호 × 8 + 연산 번호»(v5). 유형 16개까지는 1바이트, 그 뒤는 2바이트.
		// NOTE: v4 는 «연산 × 16 + 유형»이라 유형이 16개를 넘으면 담을 수 없었다(53-1권 20개, 2026-10-29).
		w.num(section * 8 + (fits ? op : RAW));
		if (fits) {
			w.num(Number(m[1]));
			w.num(Number(m[3]));
		} else {
			w.str(q.text);
			w.str(q.answer);
		}
		writeMine(w, q.mine, q.answer);
	}
	return V5 + bytesToBase64Url(w.bytes);
}

// ── 읽기(v2~v5) ──────────────────────────────────────────

function readMine(r: Reader, version: 2 | 3 | 4 | 5, answer: string) {
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

	// v4 부터 한 유형 풀이가 있다. 그 전 코드는 늘 전체(유형을 섞은 80문제).
	const partCode = head.version >= 4 ? r.num() : 0;
	const count = r.num();
	// NOTE: 유형은 권 뒤에 이어 붙이기만 한다(2026-10-22 53-1권 8 → 16개). 그 전에 보낸 전체 풀기 링크는
	// 유형 수가 적으니 앞에서부터 그 개수만큼으로 읽는다. 순서를 바꾸거나 중간에 끼우면 옛 링크 이름이 엇갈린다.
	const solved =
		partCode === 0
			? course.sections.slice(0, count)
			: course.sections.slice(partCode - 1, partCode);
	if (solved.length === 0 || count !== solved.length) return null;
	const common = head.version >= 3 ? r.num() : 0;
	const sections: SectionScore[] = solved.map((sec) => {
		const correct = r.num();
		return { title: sec.title, correct, total: common || r.num() };
	});
	if (head.version >= 4 && r.num() === 1) {
		for (const sec of sections) sec.durationMs = r.num() * 1000;
	}

	const wrong = Array.from({ length: r.num() }, () => {
		const h = r.num();
		const [op, at] =
			head.version === 5
				? [h % 8, Math.floor(h / 8)]
				: [Math.floor(h / 16), h % 16];
		const sectionTitle = sections[at]?.title ?? '';
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
		...(partCode > 0 && { part: partCode - 1 }),
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
