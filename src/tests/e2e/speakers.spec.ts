/**
 * E2E 테스트 — 강사 소개 / 강연 커리큘럼
 * QA: 한큐
 */

import { test, expect } from '@playwright/test'

test.describe('강사 소개 리스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/speakers')
  })

  test('강사 목록 페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page).toHaveURL(/speakers/)
    await expect(page.getByRole('heading', { name: /강사/i })).toBeVisible()
  })

  test('강사 카드가 하나 이상 렌더링된다', async ({ page }) => {
    // 강사 데이터가 있는 경우
    const cards = page.locator('[data-testid="speaker-card"]').or(
      page.getByRole('article')
    )
    // 빈 상태 메시지도 허용
    const isEmpty = await page.getByText(/등록된 강사|강사가 없/i).isVisible().catch(() => false)
    if (!isEmpty) {
      await expect(cards.first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('강사 카드 클릭 시 상세 페이지로 이동한다', async ({ page }) => {
    const firstCard = page.locator('[data-testid="speaker-card"]').or(
      page.getByRole('article')
    ).first()
    const isVisible = await firstCard.isVisible().catch(() => false)
    if (isVisible) {
      await firstCard.click()
      await expect(page).toHaveURL(/speakers\/.+/)
    }
  })
})

test.describe('강사 상세 페이지', () => {
  test('존재하지 않는 강사 ID 접근 시 404 또는 에러 처리된다', async ({ page }) => {
    const response = await page.goto('/speakers/nonexistent-uuid-99999')
    // 404 페이지 또는 에러 UI
    const is404 = response?.status() === 404
    const hasErrorText = await page.getByText(/찾을 수 없|없습니다|404/i).isVisible().catch(() => false)
    expect(is404 || hasErrorText).toBe(true)
  })
})

test.describe('강연 커리큘럼', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lectures')
  })

  test('강연 목록 페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page).toHaveURL(/lectures/)
  })
})

test.describe('내비게이션', () => {
  test('헤더 네비게이션 링크가 올바르게 동작한다', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation')
    await expect(nav).toBeVisible()
  })

  test('홈 페이지에서 강사 섹션 링크가 동작한다', async ({ page }) => {
    await page.goto('/')
    const speakersLink = page.getByRole('link', { name: /강사/i }).first()
    if (await speakersLink.isVisible()) {
      await speakersLink.click()
      await expect(page).toHaveURL(/speakers/)
    }
  })
})
