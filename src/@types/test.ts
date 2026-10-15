export interface Question {
	id: string;
	sectionId: string;
	answer: string;
}

export interface Section {
	id: string;
	title: string;
}

export interface SectionResult {
	sectionId: string;
	correct: number;
	total: number;
}
