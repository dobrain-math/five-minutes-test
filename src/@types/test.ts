export type Operator = '+' | '-' | '×';

/** 생성기가 만드는 원재료 문제 */
export interface Problem {
	left: number;
	op: Operator;
	right: number;
}

/** 0 이상 1 미만을 돌려주는 난수 함수 (기본은 Math.random) */
export type Rng = () => number;

export interface Question {
	id: string;
	sectionId: string;
	/** 화면에 보이는 식. 예: "27 + 8" */
	text: string;
	answer: string;
}

export interface Section {
	id: string;
	title: string;
}

export interface SectionDef extends Section {
	/** i 는 이 유형 안에서 몇 번째 문제인지(0부터). 비율을 나눠야 하는 유형이 쓴다. */
	generate: (rng: Rng, i?: number) => Problem;
}

export interface Course {
	id: string;
	title: string;
	sections: SectionDef[];
}

export interface SectionResult {
	sectionId: string;
	correct: number;
	total: number;
}
