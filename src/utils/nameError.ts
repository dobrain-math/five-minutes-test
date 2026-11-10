/** 자음·모음 낱자(호환 자모 ㄱ~ㆎ · 첫가끝 자모 · 반각 자모) */
const JAMO = /[ㄱ-ㆎᄀ-ᇿﾠ-ￜ]/;

/**
 * 학생명 형식 검사. 완성된 한글 글자(가~힣)만 받는다 — 외국어·숫자·특수문자·공백·낱자는 막는다(2026-11-10).
 * 빈칸은 null(오류 문구 없이 시작 버튼만 막는다). 위반이면 화면에 띄울 문구.
 */
export function nameError(name: string): string | null {
	if (name === '') return null;
	if (/\s/.test(name)) return '띄어쓰기 없이 입력해 주세요.';
	if (JAMO.test(name)) return '자음·모음만 따로 쓸 수 없습니다.';
	if (!/^[가-힣]+$/.test(name)) return '한글 이름만 입력할 수 있습니다.';
	return null;
}
