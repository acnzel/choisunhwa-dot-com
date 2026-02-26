/**
 * E2E 테스트 — 문의하기 플로우
 * QA: 한큐
 *
 * 실제 HTML 구조 기반 (2026-02-25 분석):
 * - label에 for 속성 없음 (BUG-001) → name 속성으로 셀렉팅
 * - 라벨명: "담당자 이름 *", "연락처 *", "소속 기관/회사명 *"
 */

import { test, expect } from '@playwright/test'

test.describe('강연기획/강사섭외 문의', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inquiry/lecture')
    await page.waitForLoadState('networkidle')
  })

  test('문의 페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page).toHaveTitle(/최선화/)
    await expect(page.locator('[name="name"]')).toBeVisible()
  })

  test('필수 입력 필드가 모두 존재한다', async ({ page }) => {
    await expect(page.locator('[name="name"]')).toBeVisible()
    await expect(page.locator('[name="email"]')).toBeVisible()
    await expect(page.locator('[name="phone"]')).toBeVisible()
    await expect(page.locator('[name="company"]')).toBeVisible()
    await expect(page.locator('textarea[name="content"]')).toBeVisible()
  })

  test('개인정보 동의 체크박스가 존재한다', async ({ page }) => {
    await expect(page.locator('[name="privacy_agree"]')).toBeVisible()
  })

  test('필수 필드 미입력 시 제출 불가', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /제출|문의|신청/i })
    await submitBtn.click()
    await expect(page).toHaveURL(/inquiry\/lecture/)
  })

  test('유효한 데이터 입력 후 제출 버튼이 활성화된다', async ({ page }) => {
    await page.locator('[name="name"]').fill('김담당자')
    await page.locator('[name="email"]').fill('manager@company.com')
    await page.locator('[name="phone"]').fill('010-1234-5678')
    await page.locator('[name="company"]').fill('테스트컴퍼니')
    await page.locator('textarea[name="content"]').fill('강연 문의드립니다. 자세한 내용은 협의 원합니다.')
    const submitBtn = page.getByRole('button', { name: /제출|문의|신청/i })
    await expect(submitBtn).toBeEnabled()
  })
})

test.describe('강사등록 문의', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inquiry/register')
    await page.waitForLoadState('networkidle')
  })

  test('강사등록 문의 페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page).toHaveTitle(/최선화/)
  })

  test('강사등록 폼에 필수 필드가 존재한다', async ({ page }) => {
    await expect(page.locator('[name="name"]')).toBeVisible()
    await expect(page.locator('[name="email"]')).toBeVisible()
  })
})

test.describe('문의 제출 성공 플로우', () => {
  test('문의 제출 후 성공 메시지 또는 완료 페이지로 이동한다', async ({ page }) => {
    await page.goto('/inquiry/lecture')
    await page.waitForLoadState('networkidle')

    await page.locator('[name="name"]').fill('김담당자')
    await page.locator('[name="email"]').fill(`qa_test_${Date.now()}@test.com`)
    await page.locator('[name="phone"]').fill('010-0000-0000')
    await page.locator('[name="company"]').fill('QA테스트컴퍼니')
    await page.locator('textarea[name="content"]').fill('QA 자동화 테스트 문의입니다. 10자 이상입니다.')
    await page.locator('[name="privacy_agree"]').check()

    await page.getByRole('button', { name: /제출|문의|신청/i }).click()

    await expect(
      page.getByText(/완료|감사|접수/i)
        .or(page.getByRole('heading', { name: /완료|감사/i }))
        .or(page.locator('text=success'))
    ).toBeVisible({ timeout: 15000 })
  })
})
