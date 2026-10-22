import * as layout from '@/styles/utility.css.ts';
import * as s from './ReportSkeleton.css.ts';
import * as r from './ReportView.css.ts';

/**
 * 짧은 링크(/r/6글자)의 리포트 코드를 서버에서 받아 오는 동안 보여 주는 자리.
 * NOTE: 보통 0.5초 안에 끝나지만 신호가 약하거나 서버가 깨어날 때 1~3초 빈 화면이 보여서 넣었다(2026-10-22).
 */
export default function ReportSkeleton() {
	return (
		<main
			className={layout.page}
			aria-busy
			aria-label="결과를 불러오는 중입니다"
		>
			<header className={r.hero}>
				<div className={`${r.container} ${r.heroInner}`}>
					<div
						className={`${s.bar} ${s.onBlue}`}
						style={{ width: '70%', height: 28 }}
					/>
					<div className={s.row}>
						<div
							className={`${s.bar} ${s.onBlue}`}
							style={{ width: 72, height: 24 }}
						/>
						<div
							className={`${s.bar} ${s.onBlue}`}
							style={{ width: 48, height: 24 }}
						/>
						<div
							className={`${s.bar} ${s.onBlue}`}
							style={{ width: 64, height: 24 }}
						/>
					</div>
				</div>
			</header>
			<div className={`${r.container} ${r.body}`}>
				<div className={s.stack}>
					<div className={r.stats}>
						{[0, 1].map((n) => (
							<div key={n} className={layout.card}>
								<div className={s.bar} style={{ width: 56, height: 14 }} />
								<div
									className={s.bar}
									style={{ width: 88, height: 30, marginTop: 10 }}
								/>
							</div>
						))}
					</div>
					{[3, 6].map((lines) => (
						<div key={lines} className={layout.card}>
							<div className={s.bar} style={{ width: 96, height: 20 }} />
							{Array.from({ length: lines }, (_, i) => (
								<div
									key={i}
									className={s.bar}
									style={{
										width: i === lines - 1 ? '60%' : '100%',
										height: 14,
										marginTop: 12,
									}}
								/>
							))}
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
