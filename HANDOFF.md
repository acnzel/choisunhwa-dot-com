# HANDOFF.md — 에이전트 간 작업 인계서

> 작업이 끝나면 이 파일을 업데이트하고, 다음 담당 에이전트를 그룹챗에 멘션할 것.
> 규칙: **완료 → 파일 업데이트 → 멘션** 순서 반드시 지킬 것.

---

## 현재 작업 상태

| 파트 | 담당 | 상태 | 메모 |
|------|------|------|------|
| DB 스키마 + 기반 세팅 | @dev | ✅ 완료 | migrations 001~003, supabase 클라이언트, 타입, 미들웨어 |
| 백엔드 API Routes | @backend | ✅ 완료 | public + admin API 전체, tsc 에러 0 |
| **프론트엔드 페이지** | @frontend | ✅ 완료 | Phase 1 전체 완료, 빌드 통과, Vercel 배포 중 |
| QA 테스트 | @qa | 🔴 블로커 | Vercel 배포 실패로 E2E 불가. 로컬 빌드 정상 확인. 배포 수정 후 즉시 재개 |

---

## 환경 정보

```
Project: choisunhwa-dot-com
Path: /Users/com/.openclaw/workspace-dev/choisunhwa-dot-com/
Supabase URL: https://ahcrxdegumqfdwvafhvc.supabase.co
Vercel URL: https://choisunhwa-dot-com.vercel.app
```

### 환경변수 (.env.local 필요)
```
NEXT_PUBLIC_SUPABASE_URL=https://ahcrxdegumqfdwvafhvc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
RESEND_API_KEY=<resend key>
EMAIL_FROM=noreply@choisunhwa.com
NEXT_PUBLIC_SITE_URL=https://choisunhwa-dot-com.vercel.app
```

---

## ✅ 완료: @dev — DB 기반 세팅
- `supabase/migrations/001_initial_schema.sql` — 전체 테이블 스키마
- `supabase/migrations/002_reviews_table.sql` — 강사 후기 테이블
- `src/lib/supabase/client.ts` — 브라우저 클라이언트
- `src/lib/supabase/server.ts` — 서버 클라이언트
- `src/lib/supabase/admin.ts` — 서비스 롤 클라이언트
- `src/middleware.ts` — 어드민 라우트 보호
- `src/types/index.ts` — 전체 TypeScript 타입
- `src/constants/index.ts` — 공통 상수
- `src/lib/email.ts` — Resend 이메일 유틸
- `src/app/api/admin/upload/route.ts` — 범용 이미지 업로드

---

## ✅ 완료: @backend — API Routes

### 추가 파일
- `supabase/migrations/003_admin_role.sql` — admin role 컬럼 + RLS 정책
- `src/lib/validations/index.ts` — Zod 검증 스키마 전체
- `src/lib/auth.ts` — 어드민 인증 헬퍼 (requireAdmin)

### Public API (인증 불필요)
| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/speakers` | GET | 강사 리스트 (필터, 페이지네이션) |
| `/api/speakers/:id` | GET | 강사 상세 (강연 목록, 후기 포함) |
| `/api/lectures` | GET | 강연 목록 (필터, 페이지네이션) |
| `/api/lectures/:id` | GET | 강연 상세 (관련 강연 포함) |
| `/api/inquiries` | POST | 문의 접수 + Resend 확인 이메일 |
| `/api/support/faq` | GET | FAQ 카테고리 + 항목 |
| `/api/support/notices` | GET | 공지사항 목록 |
| `/api/support/notices/:id` | GET | 공지사항 상세 (이전/다음 네비) |
| `/api/auth/callback` | GET | OAuth/이메일 인증 콜백 |

### Admin API (어드민 인증 필요)
| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/admin/dashboard` | GET | 통계 + 최근 문의/회원 |
| `/api/admin/speakers` | GET, POST | 강사 목록/추가 |
| `/api/admin/speakers/:id` | GET, PATCH, DELETE | 강사 상세/수정/삭제 |
| `/api/admin/lectures` | GET, POST | 강연 목록/추가 |
| `/api/admin/lectures/:id` | GET, PATCH, DELETE | 강연 상세/수정/삭제 |
| `/api/admin/inquiries` | GET | 문의 목록 (필터) |
| `/api/admin/inquiries/:id` | GET, PATCH | 문의 상세/상태변경+이메일알림 |
| `/api/admin/inquiries/:id/memos` | POST | 내부 메모 추가 |
| `/api/admin/members` | GET | 회원 목록 |
| `/api/admin/members/:id` | GET, PATCH | 회원 상세/상태변경 |
| `/api/admin/support/faq` | GET, POST | FAQ 목록/추가 |
| `/api/admin/support/faq/:id` | PATCH, DELETE | FAQ 수정/삭제 |
| `/api/admin/support/notices` | GET, POST | 공지사항 목록/추가 |
| `/api/admin/support/notices/:id` | GET, PATCH, DELETE | 공지사항 상세/수정/삭제 |
| `/api/admin/upload` | POST | 이미지 업로드 (Supabase Storage) |

---

## ✅ 완료: @frontend — 페이지 구현

**커밋:** `feat: Phase 1 프론트엔드 전체 구현` | 빌드 통과 ✅ | GitHub 푸시 완료

### 구현 완료 파일 (63 files, +4172 lines)

**Public 페이지** (Supabase SSR + Server Components)
- ✅ `/` — 홈 (히어로, 핵심가치 3개, 강사/강연 미리보기, CTA)
- ✅ `/speakers` — 강사 목록 (분야 필터, 키워드 검색, 카드 그리드)
- ✅ `/speakers/:id` — 강사 상세 (약력 타임라인, 커리큘럼 목록, 섭외 CTA)
- ✅ `/lectures` — 강연 목록 (분야 필터, 검색)
- ✅ `/lectures/:id` — 강연 상세 (목표/프로그램/기대효과, 관련 강연)
- ✅ `/inquiry` — 문의 유형 선택 카드
- ✅ `/inquiry/lecture` — 강연기획/강사섭외 문의 (Server Action + Resend)
- ✅ `/inquiry/register` — 강사등록 문의 폼
- ✅ `/inquiry/success` — 접수 완료 페이지
- ✅ `/support/faq` — FAQ 아코디언 (카테고리 탭 + 실시간 검색)
- ✅ `/support/notice` — 공지사항 목록 (핀 공지 상단 고정)
- ✅ `/support/notice/:id` — 공지사항 상세
- ✅ `/support/about` — 회사소개 정적 페이지
- ✅ `/auth/login` — 이메일 로그인 (5회 실패 잠금)
- ✅ `/auth/signup` — 회원가입 (비밀번호 강도 인디케이터)
- ✅ `/auth/callback` — OAuth 콜백

**어드민 페이지** (/mong-bab/)
- ✅ `/mong-bab/login` — 어드민 전용 로그인
- ✅ `/mong-bab/dashboard` — 통계 카드 + 최근 문의 목록
- ✅ `/mong-bab/speakers` — 강사 관리 테이블
- ✅ `/mong-bab/lectures` — 강연 관리 테이블
- ✅ `/mong-bab/inquiries` — 문의 관리 테이블
- ✅ `/mong-bab/members` — 회원 관리 테이블
- ✅ `/mong-bab/support` — FAQ + 공지사항 관리

**공통 컴포넌트**
- ✅ `Header.tsx` — 반응형 네비게이션 (모바일 햄버거 메뉴)
- ✅ `Footer.tsx`
- ✅ `AdminSidebar.tsx` — 어드민 사이드바

**SEO/인프라**
- ✅ `robots.ts`, `sitemap.ts` — 자동 생성
- ✅ `next.config.ts` — Supabase 이미지 도메인 설정

### ⚠️ @qa에게 알림

아래 항목 중 확인 필요한 것들:
1. **어드민 CRUD 편집 폼** — 강사/강연 상세 편집 페이지는 미완 (목록만 있음)
2. **구글 OAuth** — Supabase 대시보드에서 Google Provider 활성화 필요 (녹턴 킴께 확인)
3. **Supabase 구글 소셜 로그인** `/api/auth/google` POST route 필요 — backend에서 추가 가능

### 완료 → @qa_cshdotcom_bot 시작 요청

---

## ⏳ 대기: @qa — 테스트

### 담당 범위

**기능 테스트**
- [ ] 강사 리스트 — 필터(분야/강연료), 검색, 페이지네이션
- [ ] 강사 상세 — 데이터 정합성, 강연 목록, 후기
- [ ] 강연 목록/상세
- [ ] 문의 폼 — 필수 필드 검증, 제출, 이메일 발송 확인
- [ ] 회원가입 — 이메일 인증 플로우, 구글 OAuth
- [ ] 로그인 — 5회 실패 잠금, 자동 로그인
- [ ] 어드민 — 로그인, 강사/강연/문의/회원/FAQ/공지 CRUD
- [ ] 어드민 라우트 보호 — 미인증 접근 차단

**비기능 테스트**
- [ ] 반응형 — 320px / 768px / 1280px
- [ ] LCP — 2.5초 이하
- [ ] 이미지 alt 텍스트

**완료 후 → @dev_cshdotcom_bot 멘션 (최종 배포 확인)**

---

## 이슈 트래커

| 날짜 | 에이전트 | 이슈 | 심각도 | 상태 |
|------|----------|------|--------|------|
| 2026-02-25 | @qa | **[BLOCKER] Vercel 배포 실패** — 사이트가 기본 Next.js 템플릿("Create Next App") 반환 중. 로컬 빌드는 정상. Vercel 환경변수 누락 의심 (NEXT_PUBLIC_SUPABASE_URL 등) | P0 | 🔴 미해결 |
| 2026-02-25 | @qa | E2E 40개 전체 실패 — 배포 문제로 인한 연쇄 실패. 배포 수정 후 재실행 필요 | P0 | ⏳ 대기 |

---

## 미결 사항

- [x] 강연료 정보 → 문의 후 안내
- [x] 강사 리뷰 → Phase 1 포함
- [x] 이메일 서비스 → Resend
- [x] 파일 스토리지 → Supabase Storage (`public-assets` bucket)

---

## [2025-07] @frontend 추가 작업 완료

### 어드민 강사 CRUD 완성
- **문제**: `/mong-bab/speakers/[id]` 404 → 편집 페이지 신규 구현
- **문제**: 어드민 강사 목록에서 `is_visible=false` 강사가 안 보이는 버그 → `createAdminClient()` 로 RLS 우회
- **추가**: 인라인 공개 토글 스위치 (페이지 리로드 없이)
- **추가**: 신규 강사 등록 폼 (`/mong-bab/speakers/new`)
- **추가**: `src/app/actions/admin.ts` — Server Actions (upsertSpeaker, toggleVisibility, deleteSpeaker 등)

### F-4, F-5 완료
- F-4: `/inquiry/lecture` 로그인 시 이름/이메일 자동 채움
- F-5: `/auth/login`, `/auth/signup` 이미 로그인 상태면 홈 리디렉션

### 남은 작업
- 어드민 강연 편집 페이지 (`/mong-bab/lectures/[id]`) — 미완
- F-1/F-2 헤더 분리 — 백엔드에서 ConditionalLayout + 인증 상태 반영 이미 구현됨. 이슈 없으면 패스.
- F-3 어드민 로그인 레이아웃 — 현재 AdminSidebar가 login 페이지에서 null 반환. 정상 동작 중.

**→ @qa_cshdotcom_bot**: 강사 공개 토글 + 편집 저장 동작 테스트 부탁해

---

## ✅ 추가 완료: @backend — 강사 매칭 API (M-B1, M-B2)

커밋: `adea52d`

### 신규 파일
- `supabase/migrations/004_matching_and_best.sql` — `is_best` 컬럼 + `matching_sessions` 테이블
- `src/app/api/matching/route.ts` — GET /api/matching
- `src/app/api/matching/click/route.ts` — POST /api/matching/click

### GET /api/matching 스펙
```
Query: fields=leadership,motivation&topics=MZ세대&targets=팀장
Response: {
  data: [{id, name, title, company, photo_url, bio_short, fields, match_reasons, score}],
  total: number,
  fallback: boolean  // 매칭 결과 없을 때 추천 강사로 대체됐으면 true
}
```

### ⚠️ Supabase 마이그레이션 필요 (스캇 직접 실행)
`supabase/migrations/004_matching_and_best.sql` 내용을 Supabase SQL Editor에서 실행해야 함.
실행 전까지 matching_sessions 로그 저장 안 됨 (API 동작엔 영향 없음).

### @frontend 연동 사항
- Wizard 결과 → `GET /api/matching?fields=...&topics=...&targets=...`
- 강사 카드 클릭 → `POST /api/matching/click` (선택적 로그)
- `match_reasons` 배열 → 추천 이유 뱃지로 노출
- `fallback: true` → "맞춤 강사를 찾는 중이에요. 추천 강사를 소개해드릴게요." 문구
