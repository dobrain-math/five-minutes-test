/**
 * 공유 코드의 바이트 쓰기·읽기 + 코드 머리(이름·날짜) 읽기.
 * NOTE: Vercel 미들웨어(middleware.ts)도 이 파일을 가져다 카드 문구를 만든다.
 * 그래서 '@/' 별칭·종목 데이터(courses.ts)를 가져오지 않는다 — 상대 경로만 쓴다.
 */
import { AGES } from '../data/ages.ts';

/** 숫자는 7비트씩 끊어 적는다(작은 수는 1바이트). 글자는 길이 + UTF-8. */
export class Writer {
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

export class Reader {
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

export function bytesToBase64Url(bytes: ArrayLike<number>) {
	let binary = '';
	for (let i = 0; i < bytes.length; i++)
		binary += String.fromCharCode(bytes[i]);
	return btoa(binary)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

export function base64UrlToBytes(code: string) {
	const binary = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
	return Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
}

/** 코드 맨 앞 글자 = 모양 번호. v1(긴 JSON)은 늘 'e' 로 시작해서 겹치지 않는다. */
export const V2 = '2';
export const V3 = '3';
/** v4(2026-10-22): v3 머리 + 풀이 범위(전체·한 유형) + 유형별 걸린 시간 */
export const V4 = '4';
/** v5(2026-10-29): v4 와 같고, 틀린 문제 머리를 «유형 번호 × 8 + 연산 번호»로(유형 16개 한도를 없앰) */
export const V5 = '5';

/** 나이: 0 = 글자 그대로(뒤따름), n + 1 = AGES[n] */
export function writeAge(w: Writer, age: string) {
	const i = (AGES as readonly string[]).indexOf(age);
	if (i >= 0) w.num(i + 1);
	else {
		w.num(0);
		w.str(age);
	}
}

export type CodeHead = {
	version: 2 | 3 | 4 | 5;
	courseId: string;
	studentName: string;
	studentAge: string;
	durationMs: number;
	finishedAt?: number;
};

/**
 * 짧은 코드(v2~v5)의 머리를 읽는다. 뒤따르는 유형·틀린 문제는 reader 로 이어 읽는다.
 * v2: 걸린 시간 ms, 실시일 초 / v3~v5: 걸린 시간 초, 실시일 분, 나이는 목록 번호(머리 모양이 같다).
 * 짧은 코드가 아니면 null(예외는 던질 수 있다).
 */
export function readHead(
	code: string,
): { head: CodeHead; reader: Reader } | null {
	const version =
		code[0] === V2
			? 2
			: code[0] === V3
				? 3
				: code[0] === V4
					? 4
					: code[0] === V5
						? 5
						: null;
	if (version === null) return null;
	const reader = new Reader(base64UrlToBytes(code.slice(1)));
	const courseId = reader.str();
	const studentName = reader.str();
	let studentAge: string;
	if (version === 2) studentAge = reader.str();
	else {
		const a = reader.num();
		studentAge = a === 0 ? reader.str() : (AGES[a - 1] ?? '');
	}
	const duration = reader.num();
	const finished = reader.num();
	const head: CodeHead = {
		version,
		courseId,
		studentName,
		studentAge,
		durationMs: version === 2 ? duration : duration * 1000,
		...(finished > 0 && {
			finishedAt: version === 2 ? finished * 1000 : finished * 60_000,
		}),
	};
	return { head, reader };
}
