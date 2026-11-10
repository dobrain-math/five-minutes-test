import { describe, expect, test } from 'vitest';
import { nameError } from './nameError.ts';

// 제목 줄 오른쪽에 한 줄로 붙인다(사용자 «한 줄로» 2026-11-10). 360px 휴대폰에서 «학생명»과 안 겹치게 짧게(208px)
const MESSAGE = '외국어·숫자·공백·특수문자는 쓸 수 없습니다.';

describe('nameError — 학생명은 완성된 한글 글자만(2026-11-10)', () => {
	test('한글 이름은 통과', () => {
		for (const name of ['김민준', '이서', '남궁민수', '똠']) {
			expect(nameError(name), name).toBeNull();
		}
	});

	test('아직 안 적었으면 오류를 띄우지 않는다(빈칸은 시작 버튼이 막는다)', () => {
		expect(nameError('')).toBeNull();
	});

	test('외국어·숫자·공백·특수문자·자음/모음 낱자는 모두 같은 형식 안내', () => {
		for (const name of [
			'김 민준',
			' 김민준',
			'김민준 ',
			'김　민준',
			'김민ㅈ',
			'ㄱㄴㄷ',
			'김ㅏ',
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
			expect(nameError(name), JSON.stringify(name)).toBe(MESSAGE);
		}
	});
});
