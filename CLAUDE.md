# CLAUDE.md

## E2E 테스트

E2E 는 로컬 Supabase(Docker)가 필요하다. `npm run test:e2e` 는 Next.js 테스트 서버만 띄우고 Supabase 는 띄우지 않는다.

- 실행 전에 `supabase start` 가 되어 있는지 확인한다. 안 되어 있으면 먼저 켠다.
- 강사 목록·문의 제출 테스트가 "0명" 이나 URL 불일치로 실패하면 코드 버그를 의심하기 전에 로컬 Supabase 가 떠 있는지부터 본다.
- 처음 쓰는 컴퓨터라면 Docker Desktop, Supabase CLI, `npm install`, `npx playwright install chromium` 이 필요하다. 자세한 순서는 README 의 "E2E 테스트" 절.
- 운영 DB(`.env.local`)를 대상으로 e2e 를 돌리지 않는다.
