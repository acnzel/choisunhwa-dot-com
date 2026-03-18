# TASKS.md — 에이전트 공유 태스크 큐
> **규칙:** 작업 받으면 status를 `in_progress`로, 완료하면 `done`으로 바꾸고 다음 에이전트에게 sessions_send로 알릴 것.
> 모든 에이전트는 heartbeat마다 이 파일을 체크한다.

---

## 🔴 OPEN (미착수)

| ID | 우선순위 | assignee | 제목 | 의존성 | 등록자 |
|----|---------|----------|------|--------|--------|
| T-006 | P1 | @backend | Google OAuth `/api/auth/google` 라우트 추가 | T-004 | @frontend |
| T-008 | P0 | Scott | Supabase migration 007+008+011 적용 (insights + trgm + featured_speakers) | — | @dev |
| T-013 | P1 | @dev | 이달의 강사 B-3: seed 5명 (migration 011 적용 후) | T-008 | @dev |
| T-014 | P1 | @dev | insights seed: 이 강사 어때요(서은국) + 오늘의 이슈 샘플 (migration 007 후) | T-008 | @dev |
| T-015 | P1 | @dev | insights seed: 강연 스토리 3건 (migration 007 후) | T-008 | @dev |

---

## 🔄 IN PROGRESS

| ID | 우선순위 | assignee | 제목 | 시작일 | 메모 |
|----|---------|----------|------|--------|------|
| T-004 | P0 | @dev | Vercel 환경변수 설정 + 재배포 트리거 | 2026-02-25 | 블로커: Vercel 로그인 필요 + 실제 키값 필요 |
| T-003 | P0 | @qa | E2E 전체 실행 + 버그 리포트 | 2026-02-25 | T-004 해결 후 재개 |

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
