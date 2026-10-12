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

// 실제로 DB 에 문의를 쓰는 테스트. 로컬 Supabase 로 띄운 e2e 서버에서만 실행한다.
// 외부 서버(PLAYWRIGHT_BASE_URL)나 로컬이 아닌 Supabase 를 가리키면 건너뛴다 — 운영 DB 에 테스트 문의가 쌓이는 것을 막는다.
const supabaseHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').hostname } catch { return '' }
})()
const canWriteDb = !process.env.PLAYWRIGHT_BASE_URL && ['127.0.0.1', 'localhost'].includes(supabaseHost)

test.describe('문의 제출 성공 플로우', () => {
  test.skip(!canWriteDb, '로컬 Supabase 가 아닌 환경에서는 DB 쓰기 테스트를 건너뜀')

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

    // 성공 시 서버 액션이 /inquiry/success 로 redirect 한다.
    // "접수" 같은 단어로만 판정하면 실패 문구("문의 접수에 실패했습니다")에도 통과하므로 이동한 페이지로 확인한다.
    await expect(page).toHaveURL(/\/inquiry\/success/, { timeout: 15000 })
    await expect(page.getByRole('heading', { name: '문의가 접수되었습니다!' })).toBeVisible()
  })
})

test.describe('교육 기획안 요청', () => {
  test('기획안 3문항과 연락처 필드가 존재한다', async ({ page }) => {
    await page.goto('/inquiry/plan')
    await expect(page.getByRole('heading', { name: '교육 기획안 무료로 받기' })).toBeVisible()
    for (const name of ['attendee_count', 'target', 'concern', 'name', 'company', 'email', 'phone', 'privacy_agree']) {
      await expect(page.locator(`[name="${name}"]`)).toBeVisible()
    }
  })

  test('기획안 요청 제출 후 기획안 완료 페이지로 이동한다', async ({ page }) => {
    test.skip(!canWriteDb, '로컬 Supabase 가 아닌 환경에서는 DB 쓰기 테스트를 건너뜀')

    await page.goto('/inquiry/plan')
    await page.locator('[name="attendee_count"]').fill('120')
    await page.locator('[name="target"]').selectOption({ label: '팀장 / 중간 관리자' })
    await page.locator('[name="concern"]').fill('QA 자동화 테스트입니다. 신임 팀장 면담 역량이 고민입니다.')
    await page.locator('[name="name"]').fill('김담당자')
    await page.locator('[name="company"]').fill('QA테스트컴퍼니')
    await page.locator('[name="email"]').fill(`qa_plan_${Date.now()}@test.com`)
    await page.locator('[name="phone"]').fill('010-0000-0000')
    await page.locator('[name="privacy_agree"]').check()

    await page.getByRole('button', { name: '기획안 무료로 신청하기' }).click()

    await expect(page).toHaveURL(/\/inquiry\/success\?type=plan/, { timeout: 15000 })
    await expect(page.getByRole('heading', { name: '기획안 요청이 접수되었습니다!' })).toBeVisible()
  })
})
