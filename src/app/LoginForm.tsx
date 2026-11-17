import { type FormEvent, useEffect, useRef, useState } from 'react';
import logoWhite from '@/assets/logo-w.svg';
import { autoLogin, useTestSessionStore } from '@/store/useTestSessionStore.ts';
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
			// 기록까지 통째로 남겨 두면 다음에는 시트를 기다리지 않고 바로 들어간다(store snapshot)
			autoLogin.set(keep ? r.login : null);
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
		// 머리 띠 없이 파랑 단색 바탕 + 화면 정중앙 흰 카드(사용자 2026-11-17. 위쪽 로고 자리는 나중에)
		<main className={s.loginPage}>
			<div className={s.loginInner}>
				<img className={s.loginLogo} src={logoWhite} alt="두뇌로수학" />
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
					챌린지 코드 분실 시, 학원으로 문의해 주세요.
				</p>
			</div>
		</main>
	);
}
