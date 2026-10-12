import { readFileSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

// e2e 는 로컬 Supabase(`supabase start`)를 대상으로 돈다. .env.test 를 읽어
// 테스트 러너와 웹서버 양쪽에 같은 값을 넣는다. (운영 키가 든 .env.local 은 쓰지 않는다)
const testEnv = Object.fromEntries(
  readFileSync('.env.test', 'utf8')
    .split('\n')
    .filter((line) => /^[A-Z_]+=/.test(line))
    .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)])
)
for (const [k, v] of Object.entries(testEnv)) process.env[k] ??= v

const E2E_PORT = 3100

export default defineConfig({
  testDir: './src/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${E2E_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  // PLAYWRIGHT_BASE_URL 을 지정하면 외부 서버를 쓰고 로컬 서버는 띄우지 않는다
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        // NODE_ENV=test 이면 Next.js 가 .env.local 대신 .env.test 를 읽는다
        command: `npx next dev -p ${E2E_PORT}`,
        url: `http://localhost:${E2E_PORT}`,
        env: { ...process.env, ...testEnv, NODE_ENV: 'test' } as Record<string, string>,
        reuseExistingServer: false,
        timeout: 120_000,
      },
})
