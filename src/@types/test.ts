export type Operator = '+' | '-' | '×';

/** 생성기가 만드는 원재료 문제 */
export type Problem = {
	left: number;
	op: Operator;
	right: number;
};

/** 0 이상 1 미만을 돌려주는 난수 함수 (기본은 Math.random) */
export type Rng = () => number;

export type Question = {
	id: string;
	sectionId: string;
	/** 화면에 보이는 식. 예: "27 + 8" */
	text: string;
	answer: string;
};

export type Section = {
	id: string;
	title: string;
};

export type SectionDef = Section & {
	/** i 는 이 유형 안에서 몇 번째 문제인지(0부터). 비율을 나눠야 하는 유형이 쓴다. */
	generate: (rng: Rng, i?: number) => Problem;
};

export type Course = {
	id: string;
	title: string;
	sections: SectionDef[];
};

export type SectionResult = {
	sectionId: string;
	correct: number;
	total: number;
};

/** 유형 하나의 점수(목차 순서) */
export type SectionScore = {
	title: string;
	correct: number;
	total: number;
	/** 이 유형(전체 풀기의 한 페이지)에 걸린 시간. 페이지별 시간을 재기 전 옛 링크에는 없다. */
	durationMs?: number;
};

export type WrongAnswer = {
	text: string;
	/** 학생이 적은 답. 비워 두었으면 빈 문자열 */
	mine: string;
	answer: string;
	sectionTitle: string;
};

/** 리포트 화면이 그리는 데이터. 내 기기(세션)에서도, 공유 링크에서도 이 모양으로 만든다. */
export type Report = {
	studentName: string;
	studentAge: string;
	/** 종목 id. 짧은 공유 코드는 유형 이름 대신 이것만 싣는다. 예전(v1) 공유 링크에는 없다. */
	courseId?: string;
	courseTitle: string;
	/** 한 유형만 풀었으면 그 유형 번호(0부터, sections 는 그 유형 하나). 없으면 전체 풀기. */
	part?: number;
	correct: number;
	total: number;
	durationMs: number;
	/** 테스트를 마친 시각(ms). 공유 메시지의 날짜로 쓴다. 날짜를 싣기 전 옛 공유 링크에는 없다. */
	finishedAt?: number;
	sections: SectionScore[];
	wrong: WrongAnswer[];
};
