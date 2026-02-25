# 최선화닷컴 QA 테스트 플랜
> 작성: 한큐 (QA Agent)  
> 스택: Next.js + Supabase + Vercel

---

## 1. 테스트 전략

| 레이어 | 도구 | 대상 |
|--------|------|------|
| 유닛 테스트 | Vitest + Testing Library | 타입, 유틸 함수, 컴포넌트 |
| 통합 테스트 | Vitest + Supabase Mock | API 라우트, DB 쿼리 |
| E2E 테스트 | Playwright | 사용자 플로우 전체 |

---

## 2. 테스트 파일 구조

```
src/tests/
├── setup.ts              # jest-dom 설정
├── unit/
│   └── types.test.ts     # 타입 유효성 ✅
├── e2e/
│   ├── auth.spec.ts      # 회원가입/로그인/어드민 접근 ✅
│   ├── inquiry.spec.ts   # 문의하기 폼 ✅
│   └── speakers.spec.ts  # 강사/강연 목록 ✅
└── fixtures/             # 테스트 픽스처 데이터
```

---

## 3. 핵심 테스트 시나리오

### 3.1 인증
- [x] 이메일 회원가입 — 정상 플로우
- [x] 비밀번호 유효성 (8자, 영문+숫자+특수문자)
- [x] 비밀번호 확인 불일치
- [x] 구글 소셜 로그인 버튼 존재 여부
- [x] 로그인 — 잘못된 계정 에러 처리
- [x] 어드민 `/mong-bab/` 비로그인 접근 → 리다이렉트

### 3.2 강사/강연
- [x] 강사 목록 로드
- [x] 강사 상세 페이지 접근
- [x] 존재하지 않는 강사 ID → 404 처리
- [x] 강연 목록 로드
- [ ] 강사 검색/필터 (컴포넌트 개발 후 추가)
- [ ] 강사 북마크 (로그인 필요, Phase 2)

### 3.3 문의하기
- [x] 강연기획 문의 폼 필수 필드 검증
- [x] 강사등록 문의 폼 접근
- [x] 문의 제출 → 성공 메시지
- [ ] 문의 제출 → Resend 이메일 발송 확인 (통합 테스트)
- [ ] 파일 첨부 (개발 후 추가)

### 3.4 어드민 (/mong-bab/)
- [x] 비로그인 접근 차단
- [ ] 어드민 로그인
- [ ] 회원 목록 조회/검색
- [ ] 강사 등록/수정/숨김 처리
- [ ] 문의 상태 변경 (new → confirmed → done)
- [ ] FAQ/공지사항 CRUD

---

## 4. 실행 방법

```bash
# 유닛 테스트
npm test

# 유닛 테스트 커버리지
npm run test:coverage

# E2E (로컬, 서버 실행 필요)
npm run dev  # 별도 터미널
npm run test:e2e

# E2E (배포 URL 대상)
PLAYWRIGHT_BASE_URL=https://choisunhwa-dot-com.vercel.app npm run test:e2e
```

---

## 5. 우선순위 (P0 → P3)

| 우선순위 | 기능 |
|----------|------|
| P0 | 어드민 인증/접근 제어 |
| P0 | 문의 폼 제출 + 이메일 발송 |
| P1 | 회원가입/로그인 |
| P1 | 강사 목록/상세 표시 |
| P2 | 강연 목록/상세 |
| P2 | FAQ/공지사항 |
| P3 | 북마크, 맞춤 추천 |

---

## 6. 알려진 리스크

1. **어드민 URL 노출**: `/mong-bab/` 경로가 미들웨어로만 보호됨 → role 기반 DB 검증 추가 필요
2. **Resend 이메일 실패 처리**: 문의 제출 시 이메일 실패해도 DB 저장은 되어야 함
3. **Supabase RLS**: Row Level Security 정책 설정 확인 필요
4. **Google OAuth 콜백**: `/auth/callback/google` 처리 누락 시 로그인 불가
