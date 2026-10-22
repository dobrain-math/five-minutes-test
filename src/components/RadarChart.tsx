import type { SectionScore } from '@/@types/test';
import type { Highlight } from '@/utils/highlightSections.ts';
import * as s from './RadarChart.css.ts';

type Props = {
	sections: SectionScore[];
	marks: Highlight[];
};

// NOTE: viewBox 좌표. 화면 폭에 맞춰 늘고 줄지만 비율은 그대로다.
const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = 104;
/** 꼭짓점 번호 동그라미가 놓이는 거리 */
const LABEL_RADIUS = RADIUS + 22;
const RINGS = [0.25, 0.5, 0.75, 1];

/** i 번째 축(맨 위에서 시계 방향)에서 중심으로부터 r 만큼 떨어진 점 */
const point = (i: number, count: number, r: number) => {
	const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
	return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)] as const;
};

const polygon = (points: (readonly [number, number])[]) =>
	points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

/**
 * 유형별 정답률 레이더(n각형). 꼭짓점 번호 = 유형 번호(아래 목록과 같다).
 * NOTE: 라이브러리 없이 SVG 로 직접 그린다 — 데이터가 이미 메모리에 있어 로딩이 없고 번들도 그대로다(2026-10-22).
 */
export default function RadarChart({ sections, marks }: Props) {
	const count = sections.length;
	const rates = sections.map((sec) =>
		sec.total === 0 ? 0 : sec.correct / sec.total,
	);
	const label = sections
		.map(
			(_, i) =>
				`${i + 1}번 ${Math.round(rates[i] * 100)}%${marks[i] === 'strong' ? ' 강점' : marks[i] === 'weak' ? ' 약점' : ''}`,
		)
		.join(', ');

	return (
		<svg
			className={s.chart}
			viewBox={`0 0 ${SIZE} ${SIZE}`}
			role="img"
			aria-label={`유형별 정답률: ${label}`}
		>
			{RINGS.map((ring) => (
				<polygon
					key={ring}
					className={s.ring}
					points={polygon(
						sections.map((_, i) => point(i, count, RADIUS * ring)),
					)}
				/>
			))}
			{sections.map((_, i) => {
				const [x, y] = point(i, count, RADIUS);
				return (
					<line
						key={i}
						className={s.axis}
						x1={CENTER}
						y1={CENTER}
						x2={x}
						y2={y}
					/>
				);
			})}
			<text className={s.ringLabel} x={CENTER + 4} y={CENTER - RADIUS / 2 - 3}>
				50%
			</text>

			<g className={s.data}>
				<polygon
					className={s.area}
					points={polygon(
						rates.map((rate, i) => point(i, count, RADIUS * rate)),
					)}
				/>
				{rates.map((rate, i) => {
					const [x, y] = point(i, count, RADIUS * rate);
					return (
						<circle
							key={i}
							className={s.dot}
							data-mark={marks[i] ?? undefined}
							cx={x}
							cy={y}
							r={4.5}
						/>
					);
				})}
			</g>

			{sections.map((_, i) => {
				const [x, y] = point(i, count, LABEL_RADIUS);
				return (
					<g key={i} data-mark={marks[i] ?? undefined} className={s.vertex}>
						<circle className={s.vertexCircle} cx={x} cy={y} r={12} />
						<text className={s.vertexText} x={x} y={y}>
							{i + 1}
						</text>
					</g>
				);
			})}
		</svg>
	);
}
