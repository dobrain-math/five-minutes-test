import { describe, expect, test } from 'vitest';
import { nameError } from './nameError.ts';

describe('nameError — 학생명은 완성된 한글 글자만(2026-11-10)', () => {
	test('한글 이름은 통과', () => {
		for (const name of ['김민준', '이서', '남궁민수', '똠']) {
			expect(nameError(name), name).toBeNull();
		}
	});

	test('아직 안 적었으면 오류를 띄우지 않는다(빈칸은 시작 버튼이 막는다)', () => {
		expect(nameError('')).toBeNull();
	});

	test('공백이 있으면 띄어쓰기 안내', () => {
		for (const name of ['김 민준', ' 김민준', '김민준 ', '김　민준']) {
			expect(nameError(name), JSON.stringify(name)).toBe(
				'띄어쓰기 없이 입력해 주세요.',
			);
		}
	});

	test('자음·모음 낱자가 있으면 낱자 안내', () => {
		for (const name of ['김민ㅈ', 'ㄱㄴㄷ', '김ㅏ', 'ㅋㅋ']) {
			expect(nameError(name), name).toBe('자음·모음만 따로 쓸 수 없습니다.');
		}
	});

	test('외국어·숫자·특수문자는 한글만 안내', () => {
		for (const name of [
			'Minjun',
			'김minjun',
			'金民俊',
			'みんじゅん',
			'김민준2',
			'김민준!',
			'김-민준',
			'김민준😀',
			'김.',
		]) {
			expect(nameError(name), name).toBe('한글 이름만 입력할 수 있습니다.');
		}
	});
});
