# Google OAuth 운영 검증 체크리스트

T-019 기준 점검 결과.

## 코드 상태

- 공개 로그인 페이지 `/auth/login`은 `GoogleLoginButton`을 사용한다.
- 어드민 로그인 페이지 `/mong-bab/login`도 같은 `GoogleLoginButton`을 사용한다.
- Google OAuth 시작은 Supabase client `signInWithOAuth({ provider: 'google' })`로 처리한다.
- OAuth callback은 `/api/auth/callback`에서 `exchangeCodeForSession()`으로 세션을 만든다.
- 신규 auth user는 `supabase/migrations/003_admin_users.sql`의 `handle_new_user()` trigger로 `profiles`에 생성된다.
- `/api/auth/callback`은 로그인 성공 후 `profiles`를 upsert해서 `provider`, `status`, `last_login_at`을 갱신한다.

## 확인 완료

2026-06-07 기준, 실제 Google 계정 로그인 전 단계까지 확인했다.

- Supabase Auth authorize endpoint: `302` → `accounts.google.com`
- 운영 `/auth/login` Google 버튼 클릭: `accounts.google.com` 로그인 화면으로 이동
- 의미: Google Provider enabled + Client ID 설정 + 운영 프론트 OAuth 시작 경로는 정상

## Supabase Dashboard 확인 필요

Supabase Dashboard의 `Authentication > Providers > Google`에서 최종값을 확인한다.
현재 앱 코드는 Google Client ID/Secret을 직접 읽지 않는다. 운영값은 Next.js/Vercel 환경변수가 아니라 Supabase Auth Provider 설정에 있어야 한다.

- Client Secret 설정됨
- Site URL: `https://choisunhwa-dot-com.vercel.app`
- Redirect allow list에 다음 URL 포함
  - `https://choisunhwa-dot-com.vercel.app/api/auth/callback`
  - `https://choisunhwa-dot-com.vercel.app/auth/callback`

## Google Cloud Console 확인 필요

Google OAuth Client의 Authorized redirect URI에 Supabase callback URL이 있어야 한다.

- `https://ahcrxdegumqfdwvafhvc.supabase.co/auth/v1/callback`

## 운영 스모크 테스트

1. `/auth/login`에서 Google 로그인 클릭 — 확인 완료
2. Google 로그인 화면 진입 확인 — 확인 완료
3. 실제 Google 계정으로 로그인 후 `/` 또는 `next` 경로 복귀 확인
4. Supabase `profiles`에서 해당 유저 row 생성 확인
5. 해당 row의 `provider = 'google'`, `status = 'active'`, `last_login_at IS NOT NULL` 확인
6. `/mong-bab/login`에서 관리자 Google 계정 로그인 시 `/mong-bab/dashboard` 접근 확인
