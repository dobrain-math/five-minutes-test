import { type FormEvent, useEffect, useRef, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle.tsx';
import { autoLogin, useTestSessionStore } from '@/store/useTestSessionStore.ts';
import * as brand from '@/styles/brand.css.ts';
import * as layout from '@/styles/utility.css.ts';
import {
	type ChallengeWho,
	isChallengeCode,
	login,
	loginError,
} from '@/utils/challenge.ts';
import * as s from './page.css.ts';

/**
 * 홈 첫 화면 — 이름 + 학원이 발급한 챌린지 코드로 로그인해야 권 고르기로 넘어간다(2026-11-17).
 * «자동 로그인»을 켜 두면 이 기기에 이름·코드를 남겨 두고 다음에 열 때 바로 들어간다.
 */
export default function LoginForm() {
	const setLogin = useTestSessionStore((st) => st.setLogin);
	const [saved] = useState(() => autoLogin.get());
	const [name, setName] = useState(saved?.name ?? '');
	const [code, setCode] = useState(saved?.code ?? '');
	const [remember, setRemember] = useState(true);
	const [busy, setBusy] = useState(saved !== null);
	const [error, setError] = useState<string | null>(null);

	const submit = async (who: ChallengeWho, keep: boolean) => {
		setBusy(true);
		setError(null);
		const r = await login(who.name, who.code);
		if (r.ok) {
			autoLogin.set(keep ? { name: r.login.name, code: who.code } : null);
			setLogin(r.login);
			return;
		}
		// 저장해 둔 값이 틀리면(코드 재발급 등) 지운다. 연결 실패는 다음에 다시 시도하게 둔다
		if (r.error === 'wrong') autoLogin.set(null);
		setError(loginError(r.error));
		setBusy(false);
	};

	// 자동 로그인 — 개발 StrictMode 에서 효과가 두 번 돌아도 한 번만
	const tried = useRef(false);
	useEffect(() => {
		if (!saved || tried.current) return;
		tried.current = true;
		void submit(saved, true);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- 처음 열 때 한 번
	}, []);

	const canSubmit = name.trim() !== '' && isChallengeCode(code) && !busy;
	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (canSubmit) void submit({ name: name.trim(), code }, remember);
	};

	return (
		<main className={layout.page}>
			<header className={brand.brandBand}>
				<div className={`${layout.container.narrow} ${s.heroInner}`}>
					<div className={layout.titleRow}>
						<h1 className={s.heroTitle}>두뇌로수학 연산 테스트</h1>
						<ThemeToggle />
					</div>
					<p className={s.heroSubtitle}>
						학생 이름과 챌린지 코드를 입력해 주세요.
					</p>
				</div>
			</header>

			<div className={`${layout.container.narrow} ${layout.content}`}>
				<form className={s.loginCard} onSubmit={handleSubmit}>
					<div>
						<div className={s.ageLabelRow}>
							<label
								htmlFor="login-name"
								className={`${layout.sectionLabel} ${s.ageLabelText}`}
							>
								학생명
							</label>
						</div>
						<input
							id="login-name"
							className={s.nameInput}
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="이름을 적어 주세요"
							autoComplete="off"
							maxLength={20}
							disabled={busy}
						/>
					</div>
					<div>
						<div className={s.ageLabelRow}>
							<label
								htmlFor="login-code"
								className={`${layout.sectionLabel} ${s.ageLabelText}`}
							>
								챌린지 코드
							</label>
						</div>
						<input
							id="login-code"
							className={s.nameInput}
							value={code}
							onChange={(e) =>
								setCode(e.target.value.replace(/\D/g, '').slice(0, 4))
							}
							placeholder="학원에서 받은 4자리 숫자"
							inputMode="numeric"
							autoComplete="off"
							enterKeyHint="go"
							maxLength={4}
							disabled={busy}
						/>
					</div>
					<label className={s.remember}>
						<input
							type="checkbox"
							className={s.rememberBox}
							checked={remember}
							onChange={(e) => setRemember(e.target.checked)}
						/>
						자동 로그인
					</label>
					{error && (
						<p className={s.loginError} role="alert">
							{error}
						</p>
					)}
					<button
						type="submit"
						className={layout.primaryButton}
						disabled={!canSubmit}
					>
						{busy ? '확인 중…' : '로그인'}
					</button>
				</form>
				<p className={s.loginNote}>
					챌린지 코드를 잃어버렸다면 학원으로 문의해 주세요.
				</p>
			</div>
		</main>
	);
}
