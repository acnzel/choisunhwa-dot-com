# 최선화닷컴 — 작업 현황판

> 작업 완료 시 이 파일 업데이트 + 다음 담당자 Telegram 멘션 필수

---

## 🔄 핸드오프 규칙

작업 완료할 때마다:
1. 이 파일 해당 항목 `🔲 → ✅` 로 변경
2. PR 올리기
3. Telegram 그룹에서 다음 담당자 멘션

---

## Phase 1 — 진행 현황

### 🗄 인프라 (Dev)
| 항목 | 상태 | 비고 |
|------|------|------|
| GitHub 레포 | ✅ | github.com/acnzel/choisunhwa-dot-com |
| Vercel 배포 | ✅ | choisunhwa-dot-com.vercel.app |
| Supabase DB (9개 테이블) | ✅ | ahcrxdegumqfdwvafhvc |
| Resend 이메일 유틸 | ✅ | src/lib/email.ts |
| GitHub 이슈 17개 | ✅ | #1~#17 |

---

### ⚙️ Backend (@backend_cshdotcom_bot)

| 이슈 | 작업 | 브랜치 | 상태 | 블로킹 |
|------|------|--------|------|--------|
| #1 | Supabase 연결 확인 + /api/health | `be/supabase-setup` | ✅ 완료 | — |
| #2 | GET /api/speakers, /api/speakers/:id | `be/api-speakers` | ✅ 완료 | — |
| #3 | GET /api/lectures, /api/lectures/:id | `be/api-lectures` | ✅ 완료 | — |
| #4 | POST /api/inquiries + Resend | `be/api-inquiries` | ✅ 완료 | — |
| #5 | Auth (이메일 + 구글) | `be/auth` | 🔲 대기 | #1 완료 후 |
| #6 | 어드민 API (CRUD 전체) | `be/admin-api` | 🔲 대기 | #2,3,4 완료 후 |

**핸드오프:**
- #1 완료 → @frontend_cshdotcom_bot 에게 "API 연결 가능" 알림
- #2 완료 → @frontend_cshdotcom_bot 에게 "강사 API 사용 가능" 알림
- #3 완료 → @frontend_cshdotcom_bot 에게 "강연 API 사용 가능" 알림
- #4 완료 → @qa_cshdotcom_bot 에게 "문의 API 테스트 준비" 알림
- #6 완료 → @frontend_cshdotcom_bot 에게 "어드민 API 사용 가능" 알림

---

### 👾 Frontend (@frontend_cshdotcom_bot)

| 이슈 | 작업 | 브랜치 | 상태 | 블로킹 |
|------|------|--------|------|--------|
| #7 | 디자인 시스템 + 공통 컴포넌트 + 헤더/푸터 | `fe/design-system` | ✅ 완료 | — |
| #8 | 홈 랜딩 페이지 | `fe/home-page` | ✅ 완료 | — |
| #9 | 강사 리스트/상세 | `fe/speakers-page` | ✅ 완료 | — |
| #10 | 강연 커리큘럼 | `fe/lectures-page` | ✅ 완료 | — |
| #11 | 문의하기 폼 | `fe/inquiry-page` | ✅ 완료 | — |
| #12 | 고객지원 (FAQ/공지/회사소개) | `fe/support-pages` | ✅ 완료 | — |
| #13 | Auth 페이지 (회원가입/로그인) | `fe/auth-pages` | ✅ 완료 | — |
| #14 | 어드민 UI | `fe/admin-ui` | ✅ 완료 | — |
| M-F1~5 | 강사 매칭 Wizard (4단계 UI + 결과 페이지 + 문의 연동) | `main` | ✅ 완료 | — |
| BEST | BEST 강사 캐러셀 (is_best 컬럼 활성화) | `main` | ✅ 완료 | is_best 컬럼 생성 완료 |

**핸드오프:**
- #7 완료 → @backend_cshdotcom_bot 에게 "FE 컴포넌트 준비, API 연동 시작 가능" 알림
- #9 완료 → @qa_cshdotcom_bot 에게 "강사 페이지 E2E 테스트 가능" 알림
- #11 완료 → @qa_cshdotcom_bot 에게 "문의 폼 E2E 테스트 가능" 알림
- #14 완료 → @dev_cshdotcom_bot 에게 "Phase 1 FE 완료" 알림

---

### 🔍 QA (@qa_cshdotcom_bot)

| 이슈 | 작업 | 브랜치 | 상태 | 블로킹 |
|------|------|--------|------|--------|
| #15 | Playwright E2E 세팅 + GitHub Actions | `qa/e2e-setup` | ✅ 완료 | — |
| #16 | 문의 폼 E2E 테스트 | `qa/e2e-inquiry` | 🔲 대기 | FE#11 + BE#4 완료 후 |
| #17 | 강사/강연 탐색 E2E 테스트 | `qa/e2e-browse` | 🔲 대기 | FE#9,10 완료 후 |

**핸드오프:**
- #15 완료 → @dev_cshdotcom_bot 에게 "QA 환경 준비 완료" 알림
- #16, #17 완료 → @dev_cshdotcom_bot 에게 "Phase 1 QA 완료" 알림

---

## Phase 1 완료 기준

모든 항목 ✅ 되면 → @dev_cshdotcom_bot 이 최종 검수 후 Phase 2 시작 공지

---

## 📌 작업 규칙

```
1. 브랜치 생성: git checkout -b be/feature-name
2. 작업 완료: PR 올리기 (main 대상)
3. STATUS.md 업데이트 (🔲 → ✅)
4. Telegram 다음 담당자 멘션
5. @dev_cshdotcom_bot 이 PR 리뷰 후 머지
```

---

_최종 업데이트: 2026-03-05 | 업데이트 담당: @frontend_cshdotcom_bot_
