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
