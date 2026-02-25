# HANDOFF.md — 에이전트 간 작업 인계서

> 작업이 끝나면 이 파일을 업데이트하고, 다음 담당 에이전트를 그룹챗에 멘션할 것.
> 규칙: **완료 → 파일 업데이트 → 멘션** 순서 반드시 지킬 것.

---

## 현재 작업 상태

| 파트 | 담당 | 상태 | 메모 |
|------|------|------|------|
| DB 스키마 + 기반 세팅 | @dev | ✅ 완료 | migrations 001~003, supabase 클라이언트, 타입, 미들웨어 |
| 백엔드 API Routes | @backend | ✅ 완료 | public + admin API 전체, tsc 에러 0 |
| **프론트엔드 페이지** | @frontend | 🔄 시작 가능 | 아래 프론트 섹션 참고 |
| QA 테스트 | @qa | ⏳ 대기 | 프론트 완료 후 시작 |

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

## 🔄 시작 가능: @frontend — 페이지 구현

### 담당 범위

**Public 페이지**
- `/` — 홈 (히어로, 강사 추천, 강연 추천, CTA)
- `/speakers` — 강사 리스트 (`GET /api/speakers`)
- `/speakers/:id` — 강사 상세 (`GET /api/speakers/:id`)
- `/lectures` — 강연 목록 (`GET /api/lectures`)
- `/lectures/:id` — 강연 상세 (`GET /api/lectures/:id`)
- `/inquiry` — 문의 유형 선택
- `/inquiry/lecture` — 강연기획/강사섭외 문의 (`POST /api/inquiries`)
- `/inquiry/register` — 강사등록 문의 (`POST /api/inquiries`)
- `/support/faq` — FAQ (`GET /api/support/faq`)
- `/support/notice` — 공지사항 (`GET /api/support/notices`)
- `/support/notice/:id` — 공지 상세 (`GET /api/support/notices/:id`)
- `/support/about` — 회사소개 (정적)
- `/auth/signup` — 이메일 회원가입
- `/auth/login` — 로그인 (이메일 + 구글)

**어드민 페이지**
- `/mong-bab/login` — 어드민 로그인
- `/mong-bab/dashboard` — 대시보드 (`GET /api/admin/dashboard`)
- `/mong-bab/speakers` — 강사 관리
- `/mong-bab/lectures` — 강연 관리
- `/mong-bab/inquiries` — 문의 관리
- `/mong-bab/members` — 회원 관리
- `/mong-bab/support` — FAQ/공지 관리

### 공통 컴포넌트 (우선 작업 권장)
- Header (네비게이션, 로그인 상태)
- Footer
- AdminSidebar
- 공통 UI: Button, Input, Badge, Card, Modal, Pagination

### 완료 후 → @qa_cshdotcom_bot 멘션

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

| 날짜 | 에이전트 | 이슈 | 상태 |
|------|----------|------|------|
| - | - | - | - |

---

## 미결 사항

- [x] 강연료 정보 → 문의 후 안내
- [x] 강사 리뷰 → Phase 1 포함
- [x] 이메일 서비스 → Resend
- [x] 파일 스토리지 → Supabase Storage (`public-assets` bucket)
