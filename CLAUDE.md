# dobrain-test — 유아~초등 연산 테스트 앱

학생 이름을 적고 종목을 골라 80문제를 풀면, 시간을 재고 채점해 유형별 정답·오답 그래프를 보여준다.
에러·주의사항은 [오답노트.md](오답노트.md) 를 먼저 읽을 것.

## 스택·명령

- React 19 + react-router 8 + zustand 5 + vanilla-extract + recharts, Vite 8, TypeScript 6, 패키지 매니저 **bun**
- `bun run dev` 개발 서버 · `bun run build` (tsc -b + vite build) · `bunx vitest run` 테스트 · `bun run lint` (oxlint) · `bunx prettier --write src`
- 경로 별칭 `@/` = `src/`, import 에 `.ts`/`.tsx` 확장자를 붙인다. 들여쓰기는 탭, 작은따옴표.

## 구조

```
src/
  @types/test.ts        Problem·Question·SectionDef·Course 타입 + Report(리포트 화면·공유 링크 공통 모양)
  data/courses.ts       종목(Course)과 유형(SectionDef)별 문제 생성기. 홈 리스트도 이 배열에서 나온다
  data/courses.test.ts  유형 조건을 생성기와 «따로» 적어 500회씩 검증 + buildTest 검증
  data/ages.ts          홈에서 고르는 나이·학년(5세~중1)
  utils/buildTest.ts    80문제 = 유형 수로 똑같이 나눔(나눠떨어지지 않으면 throw), 유형 안 중복 제거, 전체 섞기
  utils/gradeBySection.ts  유형별 맞힌 개수
  utils/buildReport.ts  끝난 세션 → Report (유형은 목차 순서, 틀린 문제는 출제 순서)
  utils/highlightSections.ts  유형별 정답률로 가장 잘함(strong)·더 연습(weak) 표시. 모두 같으면 표시 없음
  utils/evaluate.ts     Report → 학부모용 종합 평가문(300자 안팎, 규칙 기반)
  utils/shareLink.ts    Report ↔ base64url 코드, /share?r=코드
  utils/summarize.ts    joinTitles 만 evaluate 가 쓴다(한 줄 평 화면은 2026-10-20 삭제)
  utils/formatDuration.ts  ms → m:ss
  store/useTestSessionStore.ts zustand + persist(sessionStorage): 이름·나이·courseId·문제·답·startedAt·finishedAt
  styles/palette.ts     원시 컬러(라이트 + 다크: 스케일 50↔900 뒤집기). 컴포넌트는 직접 쓰지 않는다
  styles/theme.css.ts   vars.color / vars.shadow(xs~lg, 다크 대응) / vars.font(family·size t1~t8·weight·lineHeight) / vars.radius, breakpoints, canHover
  styles/typography.css.ts  text.{title1,display,expression,title2,body1,body2,label,caption,caption2,number} — style([text.x, {...}]) 로 조합
  styles/utility.css.ts page, container.{narrow,medium,wide}, content, card, bottomBar, 버튼, 제목
  app/layout.tsx        BrowserRouter + Routes. 폴더 이름만 Next.js 식이고 라우팅은 react-router — 새 화면은 여기에 Route 추가
  app/page.tsx          홈: 이름 input + 나이 칩 + 세로 종목 리스트(radiogroup) → start(courseId) 후 /test/:id
  app/test/page.tsx     상단 타이머·진행률, 문제 카드 그리드, 빈칸 있으면 한 번 확인 후 finish → /report/:id
  app/report/page.tsx   buildReport → ReportView + 「결과 공유」(휴대폰 공유 시트, 안 되면 링크 복사)·「처음으로」
  app/share/page.tsx    ?r= 코드를 decodeReport → ReportView. 깨진 링크는 안내 화면
  components/ReportView 점수·시간, 종합 평가, 유형별 정답률 막대 목록(강·약 표시), 틀린 문제 목록
  components/ThemeToggle 32px 원형 해·달 버튼(@heroicons/react 24/outline). 홈·리포트 제목 줄, 테스트 상단 바 타이머 옆
  utils/theme.ts        resolveTheme(저장값 > 기기 설정)·toggleTheme. localStorage 'theme' — index.html 인라인 스크립트가 첫 화면 전에 적용
```

라우트: `/` · `/test/:testId` · `/report/:testId` · `/share?r=코드` (testId = Course.id, 예: `basic`, `53-1`)

## 정해진 규칙 (사용자 결정)

- 모바일 퍼스트, PC 반응형: 테스트 그리드 1열 → 640px 2열 → 960px 3열 → 1280px 4열
- 디자인은 토스풍: 옅은 회색 바탕(greyBackground) + 흰 카드, **아주 약한 그림자**를 많이(vars.shadow)
- 답 입력은 80문제 세로 스크롤 + 칸마다 입력(inputMode numeric), 출제 순서는 전체 섞기
- 한 테스트 80문제, 유형별 비율은 정확히 같게(현재 두 종목 모두 8유형 × 10문제)
- 큰 작업 단위마다 커밋한다
- 페이지 바탕·답 입력칸은 grey50(한 톤 밝게), 글꼴은 Pretendard(패키지로 포함), 모서리는 vars.radius(xs6~xl16)
- 리포트의 「한 줄 평」 칸은 없앴다(2026-10-20). 대신 유형별 막대에서 정답률 최고 유형은 「가장 잘함」(파랑), 최저 유형은 「더 연습」(주황)으로 표시
- 유형별 그래프는 세로 막대 대신 «유형마다 한 줄: 이름·맞힌 수·정답률 막대» 목록(유형 8개의 긴 이름이 휴대폰 폭에 안 들어가서). 640px 이상 2열
- 홈에서 이름·나이·종목을 모두 골라야 시작된다

## 문제 유형 해석 (명시 안 된 부분은 이렇게 정함)

- 받아올림 = 자릿수가 올라가는 덧셈(4+8), 받아내림 = 빌려오는 뺄셈. 피연산자에 0·1 은 기본적으로 안 씀
- 기본연습: 1 한+한 X / 2 한+한 O / 3 한-한 X / 4 두-한 X / 5 1□-한 O / 6 두+한 O / 7 두-한 O(십의자리 2~9) / 8 □0-한
- 53-1권: 두한덧셈·두한뺄셈 / 두두덧셈·두두뺄셈(일의자리 받아올림·내림) /
  셋둘덧셈(세자리 수 십의자리 9·일의자리 6~9, 일의자리 받아올림) /
  셋둘뺄셈(일·십 둘 다 받아내림, 짝수 번째 = 절반은 「십의자리 9·일의자리 4~8」 → 빼는 수 십의자리 9 필수) /
  두한곱셈-1(×2~4, 각 자리 곱 < 10) / 두한곱셈-2(일의자리 × 한자리 ≥ 10)
- 새 종목 추가: `courses.ts` 에 Course 를 만들어 `courses` 배열에 넣고, `courses.test.ts` 의 `rules` 에 유형별 조건을 추가

## 진행 상황

> 남은 일·새 PC 준비 방법은 [HANDOFF.md](HANDOFF.md) 를 먼저 볼 것.

- [x] 컬러 토큰 + 다크모드 (a2d578c)
- [x] 문제 생성기 + 테스트 (aa554bd)
- [x] 홈·테스트·리포트 페이지, 토스풍 반응형 UI (9692393)
- [x] 배경·입력칸 grey50, Pretendard + 글꼴/둥글기 토큰, 둥글기 축소, 리포트 한 줄 평
- [x] 나이 선택, 종합 평가문, 공유 링크(/share), app/ 폴더 구조 (874c379)
- [x] 한 줄 평 삭제, 유형별 그래프를 정답률 막대 목록 + 강·약 표시로 교체, recharts 제거로 번들 595→279KB
- [ ] 다크모드 주 버튼(blue500 반전값)이 흐려 보임, 「더 연습」 줄·틀린 문제 칸이 진한 주황·빨강으로 튐 — 다크 전용 색 조정 필요
- [ ] 실제 휴대폰에서 확인(숫자 키보드, safe-area), 다크모드 화면 점검
- [ ] package.json 에 recharts 가 아직 남아 있음(코드에서는 안 씀) — 빼도 됨

## 작업 히스토리

- 2026-10-15: 팔레트(palette.ts) 분리, theme 를 contract + 라이트/다크 구조로 교체, 기존 5색 토큰 삭제
- 2026-10-15: 문제 생성기·buildTest·테스트 22개 작성. 페이지 3개 구현 후 agent-browser 로 모바일(390)·태블릿(820)·PC(1440) 캡처 검증. 채점 후 홈으로 튕기던 버그 수정, 리포트 눈금 0·½·전체로 고정
- 2026-10-15: 배경·답 칸 grey50, Pretendard 패키지 추가, 글꼴(size t1~t8 등)·radius 토큰과 typography.css.ts 신설, 모서리 축소, 리포트 강점·취약점 한 줄 평(TDD 8개). 다크에서 카드가 바탕과 같아지는 문제로 layered/floated 를 grey100/200 으로 올림
- 2026-10-20: 나이 칩·종합 평가·공유 링크 화면 연결(buildReport TDD), ReportView 로 /report·/share 공용화. 한 줄 평 삭제, 유형별 그래프를 정답률 막대 목록 + 가장 잘함/더 연습 표시(highlightSections TDD)로 교체. agent-browser 390·1440·다크 확인
- 2026-10-20: 다크모드 토글(Heroicons, theme.ts TDD), 고른 값 localStorage 유지 + index.html 깜빡임 방지. 새로고침 후 유지까지 브라우저 확인
