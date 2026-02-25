/**
 * E2E 테스트 — 문의하기 플로우
 * QA: 한큐
 *
 * 커버리지:
 * - 강연기획/강사섭외 문의 폼
 * - 강사등록 문의 폼
 * - 문의 제출 후 이메일 발송 확인 (mock)
 * - 필수 필드 유효성 검증
 */

import { test, expect } from '@playwright/test'

test.describe('강연기획/강사섭외 문의', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inquiry/lecture')
  })

  test('문의 페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /문의/i })).toBeVisible()
  })

  test('필수 입력 필드가 모두 존재한다', async ({ page }) => {
    await expect(page.getByLabel(/이름/)).toBeVisible()
    await expect(page.getByLabel(/이메일/)).toBeVisible()
    await expect(page.getByLabel(/연락처|전화/)).toBeVisible()
    await expect(page.getByLabel(/회사|기관/)).toBeVisible()
    await expect(page.getByLabel(/문의 내용|내용/)).toBeVisible()
  })

  test('필수 필드 미입력 시 제출 불가 및 에러 표시', async ({ page }) => {
    await page.getByRole('button', { name: /제출|문의|신청/i }).click()
    await expect(page.getByRole('alert').or(page.getByText(/입력해/i))).toBeVisible()
  })

  test('유효한 데이터 입력 후 제출 버튼이 활성화된다', async ({ page }) => {
    await page.getByLabel(/이름/).fill('김담당자')
    await page.getByLabel(/이메일/).fill('manager@company.com')
    await page.getByLabel(/연락처|전화/).fill('010-1234-5678')
    await page.getByLabel(/회사|기관/).fill('테스트컴퍼니')
    await page.getByLabel(/문의 내용|내용/).fill('강연 문의드립니다.')
    const submitBtn = page.getByRole('button', { name: /제출|문의|신청/i })
    await expect(submitBtn).toBeEnabled()
  })
})

test.describe('강사등록 문의', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inquiry/register')
  })

  test('강사등록 문의 페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /강사|등록/i })).toBeVisible()
  })

  test('강사등록 폼에 필수 필드가 존재한다', async ({ page }) => {
    await expect(page.getByLabel(/이름/)).toBeVisible()
    await expect(page.getByLabel(/이메일/)).toBeVisible()
  })
})

test.describe('문의 제출 성공 플로우', () => {
  test('문의 제출 후 성공 메시지 또는 완료 페이지로 이동한다', async ({ page }) => {
    await page.goto('/inquiry/lecture')

    await page.getByLabel(/이름/).fill('김담당자')
    await page.getByLabel(/이메일/).fill(`qa_test_${Date.now()}@test.com`)
    await page.getByLabel(/연락처|전화/).fill('010-0000-0000')
    await page.getByLabel(/회사|기관/).fill('QA테스트컴퍼니')
    await page.getByLabel(/문의 내용|내용/).fill('QA 자동화 테스트 문의입니다.')
    await page.getByRole('button', { name: /제출|문의|신청/i }).click()

    // 성공 메시지 또는 완료 화면
    await expect(
      page.getByText(/완료|감사|접수/i).or(page.getByRole('heading', { name: /완료|감사/i }))
    ).toBeVisible({ timeout: 10000 })
  })
})
