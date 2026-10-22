import { type ReactNode, useEffect, useId, useRef } from 'react';
import * as s from './Modal.css.ts';

/**
 * 화면 가운데 확인 창. 브라우저 기본 <dialog> 의 showModal 이라 뒤 화면은 눌리지 않고,
 * Esc·바깥(어두운 바탕) 누르기로 닫힌다(onClose). 버튼은 children 으로 넘긴다.
 */
export default function Modal({
	open,
	onClose,
	title,
	description,
	children,
}: {
	open: boolean;
	onClose: () => void;
	title: string;
	description: string;
	children: ReactNode;
}) {
	const ref = useRef<HTMLDialogElement>(null);
	const id = useId();

	useEffect(() => {
		const dialog = ref.current;
		if (!dialog) return;
		if (open && !dialog.open) {
			dialog.showModal();
			// NOTE: React 의 autoFocus 는 처음 그릴 때만 먹어서, 숨겨 둔 창을 열 때는 data-autofocus 버튼에 직접 커서를 둔다
			dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
		}
		if (!open && dialog.open) dialog.close();
	}, [open]);

	return (
		<dialog
			ref={ref}
			className={s.modal}
			aria-labelledby={`${id}-title`}
			aria-describedby={`${id}-desc`}
			onClose={onClose}
			// 바깥(어두운 바탕)을 누르면 닫는다. 안쪽 여백은 modalBody 가 가져서 창 안 빈 곳을 눌러도 안 닫힌다
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className={s.modalBody}>
				<h2 id={`${id}-title`} className={s.modalTitle}>
					{title}
				</h2>
				<p id={`${id}-desc`} className={s.modalText}>
					{description}
				</p>
				<div className={s.modalButtons}>{children}</div>
			</div>
		</dialog>
	);
}
