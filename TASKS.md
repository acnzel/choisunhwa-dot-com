# TASKS.md — 에이전트 공유 태스크 큐
> **규칙:** 작업 받으면 status를 `in_progress`로, 완료하면 `done`으로 바꾸고 다음 에이전트에게 sessions_send로 알릴 것.
> 모든 에이전트는 heartbeat마다 이 파일을 체크한다.

---

## 🔴 OPEN (미착수)

| ID | 우선순위 | assignee | 제목 | 의존성 | 등록자 |
|----|---------|----------|------|--------|--------|

---

## 🔄 IN PROGRESS

| ID | 우선순위 | assignee | 제목 | 시작일 | 메모 |
|----|---------|----------|------|--------|------|
| T-019 | P1 | @backend/Scott | Google OAuth 운영 설정 검증 (Supabase Provider + Client ID/Secret + profiles) | 2026-05-29 | 운영 Google 버튼 클릭 정상, 기존 google/admin profile 확인. 남은 확인: 현 배포 기준 실제 Google 로그인 완료 |

---

## ✅ DONE

| ID | assignee | 제목 | 완료일 | 비고 |
|----|----------|------|--------|------|
| T-001 | @dev | DB 스키마 + 기반 세팅 | 2026-02-25 | migrations 001~003 |
| T-002 | @backend | API Routes 전체 구현 | 2026-02-25 | public + admin |
| T-003a | @frontend | Phase 1 페이지 전체 구현 | 2026-02-25 | 63 files |
| T-003b | @qa | 테스트 인프라 + 유닛 테스트 30개 | 2026-02-25 | vitest + playwright |
| T-007 | @frontend | FeaturedSpeakerCard 컴포넌트 | 2026-03-18 | 번호 제거 fix: 070c192 |
| T-009 | @frontend | /insights/featured 페이지 | 2026-03-18 | 커밋 84c7ec3 |
| T-010 | @frontend | FeaturedSection 홈 연동 | 2026-03-18 | graceful fallback 포함 |
| T-011 | @frontend | SpeakerTabs "지금 뜨는" featured 연동 | 2026-03-18 | featured → trendingForTabs |
| T-012 | @frontend | 어드민 /mong-bab/featured-speakers | 2026-03-18 | CRUD + sort_order + 노출 토글 |
| T-008 | Scott | Supabase migration 007+008+011 적용 (insights + trgm + featured_speakers) | 2026-05-18 | DB 테이블 확인 완료 |
| T-013 | @dev | 이달의 강사 B-3: seed 5명 | 2026-05-18 | featured_speakers 5명 확인 |
| T-014 | @dev | insights seed: 이 강사 어때요(서은국) + 오늘의 이슈 샘플 | 2026-05-18 | pick 1건 + published issue 15건 확인 |
| T-015 | @dev | insights seed: 강연 스토리 3건 | 2026-05-18 | report 3건 확인 |
| T-006 | @frontend/@backend | Google OAuth 버튼 + callback route 코드 반영 | 2026-05-29 | `/api/auth/callback`, `GoogleLoginButton` 존재. 운영 Provider 설정은 T-019로 분리 |
| T-017 | @backend | `/api/admin/**` 권한 보호 재점검/보강 | 2026-05-29 | middleware matcher + legacy admin write API `requireAdmin()` 적용 + 유닛 테스트 추가 |
| T-016 | @dev | lint 실패 47 errors 정리 | 2026-06-06 | `npm run lint`: 0 errors / 19 warnings, exit 0. `npm test -- --run`: 36/36 PASS |
| T-018 | @dev | GitHub 이슈 상태 정리 (#1~#22) | 2026-06-06 | closed #1~#4, #6~#18, #20, #22. open #5, #19, #21 |
| T-004 | @dev | Vercel 환경변수 설정 + 최신 배포 상태 확인 | 2026-06-06 | Vercel check success on 48002cc, 운영 스모크 PASS, QA 인계 |
| T-003 | @qa | E2E 전체 실행 + 버그 리포트 | 2026-06-06 | 운영 Playwright E2E 66 passed / 2 skipped. `networkidle` 의존 제거로 speakers E2E 안정화 |

---

## 🧪 최신 상태 체크 로그

```
[2026-05-29] @dev 상태 재점검
  - main 1242715 == origin/main
  - 열린 PR: 0개
  - npm test: 30/30 PASS
  - npm run lint: FAIL (47 errors / 19 warnings)
  - GitHub issue: #1~#22 중 다수 open. 코드 완료 상태와 이슈 상태 불일치
  - STATUS.md 최신화 완료

[2026-05-29] @backend T-017 완료
  - /api/admin/:path* middleware matcher 추가
  - /api/mong-bab/:path*도 admin API로 분류되도록 보강
  - src/app/api/admin/** route.ts 18개 모두 requireAdmin() 호출 확인
  - legacy admin write API requireAdmin() 적용: featured-speakers POST/DELETE/PATCH, insights POST/PATCH/DELETE, upload POST, speaker-applications GET/PATCH
  - 비관리자 403 유닛 테스트 추가
  - npm test -- --run: 36/36 PASS
  - npx eslint src/middleware.ts src/tests/unit/admin-auth.test.ts: PASS

[2026-05-29] @backend T-019 진행
  - /auth/login Google 버튼이 없는 /api/auth/google로 POST하던 문제 수정: GoogleLoginButton 재사용
  - /api/auth/callback: exchangeCodeForSession + profiles upsert 확인
  - DB trigger handle_new_user(): auth.users 생성 시 profiles row 생성 확인
  - docs/google-oauth-ops.md 운영 체크리스트 추가
  - npm test -- --run: 36/36 PASS
  - npx eslint src/app/auth/login/page.tsx src/components/auth/GoogleLoginButton.tsx: PASS
  - 남은 확인: Scott이 Supabase Google Provider enabled, Client ID/Secret, redirect allow list, Google Console redirect URI 확인 필요

[2026-06-06] @dev T-016/T-018 완료
  - npm run lint: PASS (0 errors / 19 warnings)
  - npm test -- --run: 36/36 PASS
  - GitHub issue 정리: 완료 구현 이슈 close, open #5/#16/#17/#19/#21 유지
  - STATUS.md 최신화 완료

[2026-06-06] @dev T-004 사전 점검
  - 코드상 Vercel 필요 env 재산출 완료
  - `.env.example`에 ANTHROPIC_API_KEY, CRON_SECRET, GITHUB_ACTIONS_TOKEN 누락 보완
  - 실제 Vercel Dashboard 설정/재배포는 여전히 직접 확인 필요

[2026-06-06] @dev T-004 배포 전 로컬 게이트 확인
  - npm run build: 최초 실패 원인 수정 후 PASS
  - 수정: API route 내 requireAdmin()의 error와 Supabase error 중복 선언 제거
  - npm run lint: PASS (0 errors / 19 warnings)
  - npm test -- --run: 36/36 PASS
  - 남은 작업: Vercel Dashboard env 확인 + git push 기반 자동 배포 확인

[2026-06-06] @dev T-004 자동 배포 트리거/운영 스모크
  - 커밋/push: 4af0792 `fix: clear deployment blockers` → origin/main
  - Vercel CLI 사용 안 함. git push 기반 자동 배포만 사용
  - 운영 `/`, `/api/speakers?limit=1`, `/api/featured-speakers?limit=1`, `/auth/login`, `/mong-bab/dashboard` 확인
  - `/auth/login`: 이전 `/api/auth/google` POST 폼 제거된 최신 배포 반영 확인
  - `/api/cron/trend-briefing`: 무인증 401 확인 → CRON_SECRET 적용 상태로 판단
  - GitHub commit status: 48002cc Vercel success 확인
  - T-004 done 처리, QA에게 E2E 재개 요청

[2026-06-06] @qa T-003 운영 E2E 완료
  - 최초 운영 E2E: 60 passed / 2 skipped / 6 failed
  - 실패 원인: 기능 장애가 아니라 chromium desktop에서 `page.waitForLoadState('networkidle')`가 장기 요청 때문에 timeout
  - 수정: speakers E2E를 사용자 가시 DOM 기준 대기로 변경 (`domcontentloaded` + 강사 상세 링크 렌더링)
  - 회귀 확인: `npx playwright test src/tests/e2e/speakers.spec.ts --project=chromium` PASS 12/12
  - 최종 운영 E2E: `PLAYWRIGHT_BASE_URL=https://choisunhwa-dot-com.vercel.app npm run test:e2e` PASS 66/66, skipped 2
  - lint: PASS (0 errors / 19 warnings)

[2026-06-06] @dev PR #25 리뷰
  - 코드 리뷰: `networkidle` 제거와 DOM 기준 대기 전환 승인
  - Gemini 리뷰 코멘트 반영: `expectSpeakerResultsVisible` 중복 href 조회 제거
  - 재검증: speakers chromium E2E 12/12 PASS, lint 0 errors / 19 warnings
  - PR #25 squash merge 완료: main `209ffd5`
  - GitHub #16/#17 completed로 close

[2026-06-06] @dev T-019 부분 확인
  - Supabase Auth Google authorize endpoint 확인: 302 → accounts.google.com
  - 의미: Provider enabled + Client ID 설정은 동작
  - 남은 확인: 실제 Google 계정 로그인 완료, callback session 교환, profiles row 생성

[2026-06-07] @dev T-019 브라우저 확인
  - Playwright로 운영 `/auth/login` Google 버튼 클릭 확인
  - 결과: accounts.google.com 로그인 화면으로 이동
  - 의미: 운영 프론트 버튼 + Supabase OAuth 시작 경로 정상
  - 남은 확인: 실제 Google 계정 로그인 완료, `/api/auth/callback` session 교환, profiles row 생성

[2026-06-07] @dev T-019 profiles 확인
  - `profiles`에서 provider=google + last_login_at 존재 row 확인: 2건
  - 최신 google profile: status=active, role=admin, last_login_at=2026-03-26T14:48:39.052Z
  - 의미: profiles의 google/admin 데이터 구조는 존재
  - 남은 확인: 현재 운영 배포 기준으로 실제 Google 로그인 재수행 후 last_login_at 갱신 확인
```

---

## 📬 인계 메시지 로그

```
[2026-02-25] @qa → @dev
  T-004: Vercel 환경변수 설정 필요
  E2E 실행 결과: 40/40 실패 (배포 문제, 코드 아님)
  로컬 빌드 정상 확인됨. 재배포 후 @qa에게 알려줄 것.
  직접 호출: sessions_send sessionKey=agent:qa:telegram:group:-5179474606

[2026-02-25] @frontend → @qa
  Phase 1 구현 완료. E2E 시작 요청.
  미완: 어드민 편집 폼, Google OAuth 라우트

[2026-03-02] @frontend → @dev
  홈화면 F-A~E 전부 완료 배포. 커밋: 9c9fa58
  - F-A: 히어로 카피 교체
  - F-B: 신뢰 지표 배너 추가 (하드코딩, B-A 준비되면 API 연동 예정)
  - F-C: 프로세스 4단계 섹션 추가
  - F-D/E: 인사이트 섹션 DB 데이터 없을 때 자동 숨김
```

---

## 🔑 에이전트 세션 키 (직접 호출용)

> `tools.sessions.visibility=all` 설정 필요 (현재 미설정)

| 에이전트 | 세션 키 |
|----------|---------|
| @dev | `agent:dev:telegram:group:-5179474606` |
| @backend | `agent:backend:telegram:group:-5179474606` |
| @frontend | `agent:frontend:telegram:group:-5179474606` |
| @qa | `agent:qa:telegram:group:-5179474606` |
| @po | `agent:po:telegram:group:-5179474606` |

---

## 🤖 에이전트별 Heartbeat 체크 주기

각 에이전트 `HEARTBEAT.md`에 아래 항목 추가:

```
1. TASKS.md 열기
2. 내 이름이 assignee이고 status=OPEN인 태스크 있는지 확인
3. 있으면 즉시 작업 시작 (status → in_progress)
4. 완료 시 TASKS.md 업데이트 → 다음 에이전트 sessions_send
```
