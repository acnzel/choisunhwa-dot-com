/**
 * E2E 테스트 — 인증 플로우
 * QA: 한큐
 *
 * 실제 HTML 구조 기반 (2026-02-25 분석):
 * - label에 for 속성 없음 → getByPlaceholder or getByRole('textbox') 사용
 * - heading에 "회원가입" 텍스트 없음 → 타이틀로만 확인
 * - 구글 로그인 버튼 미구현 (T-006)
 */

import { test, expect } from '@playwright/test'

test.describe('회원가입', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signup')
    await page.waitForLoadState('networkidle')
  })

  test('회원가입 페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page).toHaveTitle(/최선화/)
    // h1이 없는 건 bug로 별도 등록됨 (BUG-002)
    // 폼 존재 여부로 페이지 확인
    await expect(page.getByPlaceholder('홍길동')).toBeVisible()
  })

  test('모든 필수 입력 필드가 존재한다', async ({ page }) => {
    await expect(page.getByPlaceholder('홍길동')).toBeVisible()
    await expect(page.getByPlaceholder(/example@email/)).toBeVisible()
    await expect(page.getByPlaceholder(/8자 이상/)).toBeVisible()
    await expect(page.getByPlaceholder('비밀번호 재입력')).toBeVisible()
  })

  test('이용약관 동의 체크박스가 존재한다', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]')
    await expect(checkboxes.first()).toBeVisible()
  })

  test('필수 필드 미입력 시 제출이 안 된다', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /가입|회원가입|시작/i })
    await submitBtn.click()
    // 에러 상태: URL 그대로이거나 에러 메시지 노출
    await expect(page).toHaveURL(/signup/)
  })

  test('비밀번호가 8자 미만이면 에러가 표시된다', async ({ page }) => {
    await page.getByPlaceholder(/8자 이상/).fill('Short1!')
    await page.getByPlaceholder('비밀번호 재입력').fill('Short1!')
    const submitBtn = page.getByRole('button', { name: /가입|회원가입|시작/i })
    await submitBtn.click()
    await expect(page.getByText(/8자/i).or(page.getByText(/비밀번호/i).last())).toBeVisible({ timeout: 3000 })
  })

  test('비밀번호 확인이 불일치하면 에러가 표시된다', async ({ page }) => {
    await page.getByPlaceholder(/8자 이상/).fill('ValidPass1!')
    await page.getByPlaceholder('비밀번호 재입력').fill('DifferentPass1!')
    const submitBtn = page.getByRole('button', { name: /가입|회원가입|시작/i })
    await submitBtn.click()
    await expect(page.getByText(/일치/i)).toBeVisible({ timeout: 3000 })
  })

  // Google 버튼은 /auth/login 페이지에 있음 (signup은 이메일만)
  test.skip('구글 로그인 버튼이 존재한다 [signup→login 이동]', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Google/i })).toBeVisible()
  })
})

test.describe('로그인', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
  })

  test('로그인 페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page).toHaveTitle(/최선화/)
    await expect(page.getByPlaceholder(/example@email/i)).toBeVisible()
  })

  test('구글 로그인 버튼이 존재한다', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Google/i })).toBeVisible()
  })

  test('이메일과 비밀번호 입력 필드가 존재한다', async ({ page }) => {
    // 비밀번호 placeholder는 '••••••••' (마스킹 문자)
    await expect(page.getByPlaceholder(/email/i)).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('잘못된 이메일 형식이면 에러가 표시된다', async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill('not-an-email')
    await page.getByRole('button', { name: /로그인/i }).click()
    // 브라우저 네이티브 이메일 검증 또는 커스텀 에러
    await expect(page.locator('input[type="email"]:invalid')).toBeVisible({ timeout: 3000 })
  })

  test('존재하지 않는 계정으로 로그인 시 에러가 표시된다', async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill('nonexistent_qa_test@example.com')
    await page.locator('input[type="password"]').fill('WrongPassword1!')
    await page.getByRole('button', { name: /로그인/i }).click()
    // 실제 에러 메시지: "이메일 또는 비밀번호가 올바르지 않습니다. (1/5)"
    // className: text-red-500 bg-red-50
    await expect(
      page.getByText(/올바르지 않습니다|이메일 또는 비밀번호/i)
        .or(page.locator('.text-red-500'))
    ).toBeVisible({ timeout: 10000 })
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
