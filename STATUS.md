# 최선화닷컴 — 작업 현황판

> 기준: 2026-05-29 00:35 KST / `main` = `1242715` = `origin/main`
> 배포는 Vercel CLI 금지. `git push origin main` 자동 배포만 사용.

---

## 현재 결론

MVP 기능은 대부분 구현 완료. 공개 사이트, 어드민, 매칭, 인사이트, 추천 강사, 트렌드 브리핑 자동화까지 `main`에 반영되어 있다.

현재 남은 핵심은 운영 안정화다.

1. Google OAuth 운영 설정/검증
2. lint 실패 정리
3. 배포 환경변수와 E2E 전체 재검증
4. GitHub 이슈 상태 정리

---

## 검증 결과

| 항목 | 상태 | 비고 |
|------|------|------|
| 로컬 브랜치 | ✅ | `main` |
| 원격 동기화 | ✅ | `HEAD == origin/main` |
| 열린 PR | ✅ | 0개 |
| 유닛 테스트 | ✅ | `npm test -- --run` → 36/36 통과 |
| lint | ❌ | `npm run lint` → 47 errors / 19 warnings |
| GitHub CLI | ⚠️ | 로컬 `gh` 미로그인. GitHub connector로 확인 |
| GitHub Actions | ⚠️ | `gh` 미로그인으로 run 상태 직접 확인 불가 |

---

## 구현 완료

### 인프라 / 데이터

| 항목 | 상태 | 비고 |
|------|------|------|
| GitHub 레포 | ✅ | `acnzel/choisunhwa-dot-com` |
| Vercel 배포 구조 | ✅ | git push 기반 자동 배포 |
| Supabase 연결 | ✅ | 프로젝트 ref `ahcrxdegumqfdwvafhvc` |
| DB 마이그레이션 파일 | ✅ | `001`~`013` 존재 |
| Storage/업로드 유틸 | ✅ | `src/app/api/upload`, `src/app/api/admin/upload` |
| Resend 이메일 유틸 | ✅ | `src/lib/email.ts` |

### 공개 사이트

| 영역 | 상태 | 비고 |
|------|------|------|
| 홈 | ✅ | Hero, 강사 롤링, 추천/신뢰 섹션 반영 |
| 강사 라인업 | ✅ | 리스트/상세, 필터, 검색, 5열 카드 디자인 반영 |
| 강연/인사이트 | ✅ | `/lectures`는 `/insights/issue`로 전환됨 |
| 문의 | ✅ | 강연 문의, 강사 등록 문의, 성공 플로우 |
| 강사 매칭 | ✅ | 4단계 wizard + 결과/문의 연동 |
| 고객지원 | ✅ | FAQ, 공지, 회사소개 |
| 인증 UI | ✅ | 이메일 로그인/회원가입, Google 버튼 존재 |

### 어드민 `/mong-bab`

| 영역 | 상태 | 비고 |
|------|------|------|
| 어드민 레이아웃 | ✅ | 퍼블릭 Header/Footer 제외 처리 |
| 대시보드 | ✅ | `/mong-bab/dashboard` |
| 강사 관리 | ✅ | 리스트, 신규, 수정, 노출/BEST/featured/trending 토글 |
| 강연 관리 | ✅ | 리스트, 신규, 수정 |
| 문의 관리 | ✅ | 리스트, 상세, 메모 |
| 회원 관리 | ✅ | `/mong-bab/members` |
| FAQ/공지 관리 | ✅ | CRUD UI/API |
| 인사이트 관리 | ✅ | CRUD + Tiptap editor |
| 추천 강사 관리 | ✅ | `/mong-bab/featured-speakers` |
| 트렌드 브리핑 pending | ✅ | 수동 실행 버튼 포함 |
| 강사 지원 관리 | ✅ | `/mong-bab/speaker-applications` |

### API

| 영역 | 상태 | 비고 |
|------|------|------|
| Public API | ✅ | speakers, lectures, inquiries, matching, insights, support |
| Admin API | ✅ | `/api/admin/**` matcher + legacy admin write API `requireAdmin()` 적용 |
| OAuth callback | ✅ | `/api/auth/callback`, `/auth/callback` 존재 |
| Trend briefing API | ✅ | `/api/cron/trend-briefing`, `/api/mong-bab/trend-briefing/*` |
| Featured speakers API | ✅ | `/api/featured-speakers` |
| Speaker applications API | ✅ | `/api/speaker-applications` |

### 콘텐츠 자동화

| 항목 | 상태 | 비고 |
|------|------|------|
| RSS 수집 | ✅ | `src/lib/trend-briefing/collector.ts` |
| AI 요약 | ✅ | Claude Sonnet 계열로 개선된 기록 있음 |
| Pipeline | ✅ | `scripts/run-pipeline.ts` |
| GitHub Actions cron | ✅ | `.github/workflows/trend-briefing.yml` |
| 수동 실행 | ✅ | workflow_dispatch + 어드민 버튼 |

---

## 남은 작업

| 우선순위 | 항목 | 담당 | 상태 | 메모 |
|----------|------|------|------|------|
| P0 | lint 실패 정리 | @dev | 🔴 필요 | 현재 CI/품질 게이트 리스크 |
| P0 | Vercel 환경변수/최신 배포 확인 | @dev/Scott | 🟡 확인 필요 | 실제 운영 키/배포 상태 확인 필요 |
| P0 | E2E 전체 재실행 | @qa | 🟡 대기 | env/배포 확인 후 실행 |
| P1 | Google OAuth 운영 설정 | @backend/Scott | 🟡 진행 필요 | Supabase Provider, Google Client ID/Secret, profiles 생성 검증 |
| P1 | GitHub 이슈 정리 | @dev | 🟡 필요 | 완료된 오래된 #1~#17 이슈가 다수 open |
| P2 | STATUS/TASKS 운영 규칙 정리 | @dev | 🟡 필요 | 상태판과 GitHub issue를 한 기준으로 맞춰야 함 |

---

## GitHub 이슈 상태 메모

GitHub connector 기준 열린 이슈가 아직 다수 존재한다.

- 신규/실제 미결 성격: `#18`~`#22`
- 오래된 Phase 1 이슈 중 코드상 완료된 항목도 open 상태로 남아 있음: `#1`~`#17` 일부
- 열린 PR은 없음

이슈 상태는 코드 상태와 불일치하므로, 다음 단계에서 완료된 이슈를 닫고 실제 미결만 남기는 정리가 필요하다.

---

## lint 실패 요약

`npm run lint` 실패:

- `scripts/*.js`: CommonJS `require()` 금지 규칙 다수
- `src/app/SpeakerTabs.tsx`: React Compiler memoization / setState in effect 규칙
- `src/app/mong-bab/AdminSidebar.tsx`: setState in effect, render 중 컴포넌트 선언
- `src/app/mong-bab/speakers/SpeakerFilterTable.tsx`: `useMemo` 안에서 setState
- 일부 JSX 텍스트 quote escape / `prefer-const`

유닛 테스트는 정상:

- `src/tests/unit/types.test.ts`: 6개 통과
- `src/tests/unit/validations.test.ts`: 24개 통과

---

## 다음 액션

1. @dev: lint P0 정리 브랜치 생성
2. Scott: 운영 Google OAuth Client ID/Secret 및 Supabase Provider 설정 여부 확인
3. @qa: 배포/env 확인 후 E2E 전체 실행
4. @dev: GitHub 이슈 close/comment 정리

---

_최종 업데이트: 2026-05-29 00:50 KST | 업데이트 담당: @backend_cshdotcom_bot_
