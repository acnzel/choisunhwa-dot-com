/**
 * E2E 테스트 — 인증 플로우
 * QA: 한큐
 *
 * 커버리지:
 * - 이메일 회원가입 (happy path + validation)
 * - 이메일 로그인
 * - 구글 소셜 로그인 진입점
 * - 비밀번호 유효성 검증
 */

import { test, expect } from '@playwright/test'

test.describe('회원가입', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signup')
  })

  test('회원가입 페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page).toHaveTitle(/최선화/)
    await expect(page.getByRole('heading', { name: /회원가입/i })).toBeVisible()
  })

  test('모든 필수 입력 필드가 존재한다', async ({ page }) => {
    await expect(page.getByLabel(/이름/)).toBeVisible()
    await expect(page.getByLabel(/이메일/)).toBeVisible()
    await expect(page.getByLabel(/비밀번호/)).toBeVisible()
    await expect(page.getByLabel(/이용약관/)).toBeVisible()
  })

  test('필수 필드 미입력 시 에러 메시지가 표시된다', async ({ page }) => {
    await page.getByRole('button', { name: /가입/i }).click()
    await expect(page.getByText(/이름을 입력/i).or(page.getByRole('alert'))).toBeVisible()
  })

  test('비밀번호가 8자 미만이면 에러가 표시된다', async ({ page }) => {
    await page.getByLabel(/이메일/).fill('test@example.com')
    await page.getByLabel(/비밀번호/).first().fill('Short1!')
    await page.getByRole('button', { name: /가입/i }).click()
    await expect(page.getByText(/8자/i)).toBeVisible()
  })

  test('비밀번호 확인이 불일치하면 에러가 표시된다', async ({ page }) => {
    await page.getByLabel(/비밀번호/).first().fill('ValidPass1!')
    await page.getByLabel(/비밀번호 확인/).fill('DifferentPass1!')
    await page.getByRole('button', { name: /가입/i }).click()
    await expect(page.getByText(/일치/i)).toBeVisible()
  })

  test('구글 로그인 버튼이 존재한다', async ({ page }) => {
    await expect(page.getByRole('button', { name: /구글/i })).toBeVisible()
  })
})

test.describe('로그인', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
  })

  test('로그인 페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /로그인/i })).toBeVisible()
  })

  test('이메일과 비밀번호 입력 필드가 존재한다', async ({ page }) => {
    await expect(page.getByLabel(/이메일/)).toBeVisible()
    await expect(page.getByLabel(/비밀번호/)).toBeVisible()
  })

  test('잘못된 이메일 형식이면 에러가 표시된다', async ({ page }) => {
    await page.getByLabel(/이메일/).fill('not-an-email')
    await page.getByRole('button', { name: /로그인/i }).click()
    await expect(page.getByText(/이메일/i)).toBeVisible()
  })

  test('존재하지 않는 계정으로 로그인 시 에러가 표시된다', async ({ page }) => {
    await page.getByLabel(/이메일/).fill('nonexistent@example.com')
    await page.getByLabel(/비밀번호/).fill('WrongPassword1!')
    await page.getByRole('button', { name: /로그인/i }).click()
    // 에러 메시지 or 알림
    await expect(page.getByRole('alert').or(page.getByText(/오류|실패|찾을 수 없/i))).toBeVisible({ timeout: 5000 })
  })
})

test.describe('어드민 접근 제어', () => {
  test('비로그인 상태에서 /mong-bab/ 접근 시 로그인 페이지로 리다이렉트된다', async ({ page }) => {
    await page.goto('/mong-bab/dashboard')
    await expect(page).toHaveURL(/mong-bab\/login/)
  })

  test('어드민 로그인 페이지는 비로그인 상태에서 접근 가능하다', async ({ page }) => {
    await page.goto('/mong-bab/login')
    await expect(page).toHaveURL(/mong-bab\/login/)
  })
})
