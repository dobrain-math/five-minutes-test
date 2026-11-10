import { useEffect, useState } from 'react';
import { isChallengeCode, lookupChallenge } from '@/utils/challenge.ts';

export type ChallengeStatus =
	| { kind: 'none' } // 비었거나 아직 4자리가 아님
	| { kind: 'checking' }
	| { kind: 'found'; name: string }
	| { kind: 'unknown' } // 명단에 없는 코드
	| { kind: 'error' }; // 시트에 닿지 못함

/** 챌린지 코드 4자리가 되면 시트 명단에서 학생 이름을 찾는다 */
export function useChallengeLookup(code: string): ChallengeStatus {
	// 답이 온 코드와 그 결과. 지금 코드와 다르면 아직 확인 중이다(효과 안에서 바로 상태를 바꾸지 않게)
	const [answer, setAnswer] = useState<{
		code: string;
		status: ChallengeStatus;
	} | null>(null);
	const valid = isChallengeCode(code);

	useEffect(() => {
		if (!valid) return;
		let alive = true;
		lookupChallenge(code)
			.then((name) => {
				if (alive)
					setAnswer({
						code,
						status: name ? { kind: 'found', name } : { kind: 'unknown' },
					});
			})
			.catch(() => alive && setAnswer({ code, status: { kind: 'error' } }));
		return () => {
			alive = false;
		};
	}, [code, valid]);

	if (!valid) return { kind: 'none' };
	return answer?.code === code ? answer.status : { kind: 'checking' };
}
