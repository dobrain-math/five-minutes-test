# 인계 메모 — 2026-10-20 갱신

> 다른 PC에서 이어갈 때 이 파일 → [CLAUDE.md](CLAUDE.md) → [오답노트.md](오답노트.md) 순서로 읽는다.
> Claude Code 에서는 「HANDOFF.md 읽고 이어서 하자」 한마디면 된다.

## 1. 새 PC 준비

```bash
git clone https://github.com/dobrain-math/five-minutes-test.git
cd five-minutes-test
bun install          # bun 이 없으면: npm i -g bun  (또는 https://bun.sh)
bun run dev          # http://localhost:5173
bunx vitest run      # 테스트 52개 통과해야 정상
bun run build        # tsc + vite build (경고 없이 끝나야 정상)
```

- ⚠ 가능하면 프로젝트를 **구글 드라이브 폴더 밖**(예: `C:\dev\`)에 둔다. 드라이브 안에서는
  node_modules 파일이 빠지거나 `bun add` 가 bun.lock 교체에 실패했다(오답노트 2·4번).

## 2. 지금까지 끝난 것 (main 에 커밋됨 — 푸시는 직접 확인)

- 컬러 팔레트 토큰 + 다크모드 구조 (`src/styles/palette.ts`, `src/styles/theme.css.ts`)
- 문제 생성기: 기본연습 8유형, 53-1권 8유형, 80문제 = 유형별 10문제, 전체 섞기 (`src/data/courses.ts`, `src/utils/buildTest.ts`)
- 홈(이름 + 나이 칩 + 세로 종목 리스트) → 테스트(타이머·진행률·카드 그리드 1~4열) → 리포트(점수·시간·종합 평가·유형별 정답률 막대·틀린 문제)
- 토스풍 디자인: grey50 바탕 + 흰 카드 + 옅은 그림자, Pretendard, 글꼴·둥글기·그림자 토큰 (`src/styles/typography.css.ts`)
- 학부모용 종합 평가문 (`src/utils/evaluate.ts`, 두각 90% / 기초 50% / 문제당 15초·6초 기준)
- 결과 공유: 리포트 「결과 공유」 → 휴대폰은 공유 시트, PC는 링크 복사. `/share?r=코드` 는 그 기기에 기록이 없어도 열린다
- 유형별 막대에 정답률 최고 「가장 잘함」·최저 「더 연습」 표시 (`src/utils/highlightSections.ts`). 「한 줄 평」 칸은 삭제됨
- 폴더 구조: `src/app/*/page.tsx` (이름만 Next.js 식, 라우팅은 react-router `app/layout.tsx`)

## 3. 아직 안 한 작업 (우선순위 순)

1. **다크모드 색 다듬기** — 다크 팔레트를 「단계 뒤집기」로 자동 생성해서 주 버튼(blue500 → 원래 blue400)이
   흐린 하늘색으로 보인다. 다크 전용 버튼·강조색을 따로 정하거나, 공식 다크 팔레트를 받아 `darkColors` 에 넣는다.
   확인: 리포트에서 `document.documentElement.dataset.theme='dark'` 로 강제 후 화면 보기.
   같은 원인으로 리포트의 「더 연습」 줄(orange50)·틀린 문제 칸(red50)이 다크에서 진한 주황·빨강으로 튄다.
2. **실제 휴대폰 확인** — 지금까지는 데스크톱 브라우저를 390px로 줄여서만 봤다.
   - 답 칸 누를 때 숫자 키보드가 뜨는지 (iOS/안드로이드)
   - 키보드가 올라올 때 입력칸·하단 「채점하기」 버튼이 가리지 않는지
   - Enter(다음) 로 다음 칸 이동, 노치·홈 바 여백(safe-area)
3. **원장님 확인 필요 항목** — 제가 임의로 정한 값들. 바꾸라 하면 바로 바꾼다.
   - 문제에 0·1 은 넣지 않음, 두한곱셈-1 은 ×2~4 만
   - 종합 평가 기준선: 두각 90%, 기초 권유 50%, 문제당 15초 넘으면 속도 연습 권유 (`evaluate.ts` 상단 상수)
   - 표시 문구 「가장 잘함」·「더 연습」, 나이 칩 범위 5세~중1(필수 선택)
   - 다크모드 배경 값 (#101318 등)
4. **recharts 정리** — 그래프를 직접 그리게 바꿔 코드에서는 안 쓴다. `bun remove recharts` 로 package.json 에서 빼도 된다.
5. **종목 추가** — 앞으로 종목이 많이 늘어난다고 했음. 추가 방법:
   `src/data/courses.ts` 에 Course 를 만들고 `courses` 배열에 넣기 → `src/data/courses.test.ts` 의 `rules` 에
   유형별 조건 추가 → `bunx vitest run`. 유형 수가 80을 나누어떨어지게 해야 한다(1·2·4·5·8·10·16·20…), 아니면 buildTest 가 오류를 낸다.
6. **(요청 없음, 아이디어)** 결과 보관 — 지금은 sessionStorage 라 탭을 닫으면 결과가 사라진다(공유 링크로는 남길 수 있다). 학생별 기록·다른 학생 평균 비교는 DB 가 필요 — `evaluate.ts` NOTE 참고.
   공유 링크는 실제 휴대폰 공유 시트(카카오톡)·PC 링크 복사 문구를 아직 직접 눌러 보지 못했다(자동 브라우저에서는 공유 함수를 가로채 링크만 확인).
7. **배포 미확인** — `vercel.json`(SPA rewrite)은 있으나 실제 배포는 이번에 확인하지 않았다.

## 4. 작업 규칙 (원장님 지시)

- 모바일 퍼스트 + PC 반응형, 토스 디자인 참고, 아주 약한 그림자 많이
- 큰 작업 단위마다 커밋
- 답 입력은 80문제 세로 스크롤, 출제 순서는 전체 섞기
