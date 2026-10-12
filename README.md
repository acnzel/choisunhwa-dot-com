# 최선화닷컴

AI 기반 기업교육 강사 매칭 플랫폼

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS |
| 인증/DB | Supabase (PostgreSQL + Auth + Storage) |
| 배포 | Vercel |

## 시작하기

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local에 Supabase 프로젝트 정보 입력

# 개발 서버 실행
npm run dev
```

## E2E 테스트

E2E 는 운영 DB 가 아니라 로컬 Supabase(Docker)를 대상으로 돈다. `.env.test` 가 로컬 DB 를 가리키며, `.env.local`(운영 키)은 읽지 않는다.

```bash
supabase start        # 로컬 DB 기동 + 마이그레이션·seed.sql 적용 (포트 554xx)
npm run test:e2e      # 포트 3100 에 테스트 서버를 띄워 실행
supabase db reset     # 테스트 데이터 초기화가 필요할 때
supabase stop
```

- 문의 제출처럼 DB 에 쓰는 테스트는 로컬 Supabase 일 때만 실행되고, `PLAYWRIGHT_BASE_URL` 로 외부 서버를 지정하면 건너뛴다.
- 테스트 환경에는 `RESEND_API_KEY` 가 없어 확인 메일이 발송되지 않는다.

## 프로젝트 구조

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # 퍼블릭 라우트
│   │   ├── speakers/             # 강사 리스트/상세
│   │   ├── lectures/             # 강연 커리큘럼
│   │   ├── inquiry/              # 문의하기
│   │   └── support/              # 고객지원
│   ├── auth/                     # 인증 라우트
│   └── mong-bab/                 # 어드민 (비공개 URL)
├── components/
│   ├── ui/                       # 공통 UI 컴포넌트
│   ├── layout/                   # 헤더, 푸터, 사이드바
│   ├── speakers/                 # 강사 관련 컴포넌트
│   ├── lectures/                 # 강연 관련 컴포넌트
│   ├── inquiry/                  # 문의 폼 컴포넌트
│   ├── support/                  # 고객지원 컴포넌트
│   └── admin/                    # 어드민 컴포넌트
├── lib/
│   ├── supabase/                 # Supabase 클라이언트
│   ├── utils/                    # 유틸리티 함수
│   ├── validations/              # Zod 스키마 검증
│   └── hooks/                    # 커스텀 훅
├── types/                        # TypeScript 타입 정의
└── constants/                    # 상수 정의
supabase/
└── migrations/                   # DB 마이그레이션 파일
```

## 주요 URL

| URL | 설명 |
|-----|------|
| `/` | 홈 |
| `/speakers` | 강사 소개 리스트 |
| `/speakers/:id` | 강사 상세 |
| `/lectures` | 강연 커리큘럼 |
| `/lectures/:id` | 강연 상세 |
| `/inquiry` | 문의하기 |
| `/support/faq` | FAQ |
| `/support/notice` | 공지사항 |
| `/mong-bab/` | 어드민 (비공개) |

## 개발 가이드

- [기획서](./docs/PRD.md) — 상세 기능 명세
- [DB 스키마](./supabase/migrations/) — 마이그레이션 파일

## 팀

| 역할 | 담당 |
|------|------|
| 개발 총괄 | @dev |
| 백엔드 | @backend |
| 프론트엔드 | @frontend |
| QA | @qa |
