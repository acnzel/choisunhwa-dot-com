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
    // 리디자인 후 (2026-03): spk-card-new 클래스 사용
    // 이전: data-testid="speaker-card" / role="article"
    // 현재: <a class="spk-card-new" href="/speakers/UUID">
    const cards = page.locator('a.spk-card-new')
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
  // /lectures는 2026-03 이후 /insights/issue로 리다이렉트됨 (라우트 삭제)
  // "강연 커리큘럼" → "강연 인사이트" 로 메뉴 구조 변경
  test.beforeEach(async ({ page }) => {
    await page.goto('/lectures')
  })

  test('강연 목록(/lectures)은 인사이트 페이지로 리다이렉트된다', async ({ page }) => {
    // /lectures 라우트 삭제됨 → /insights/issue 로 리다이렉트
    await expect(page).toHaveURL(/insights\/issue/)
  })
})

/**
 * BUG-N-014 회귀 테스트 — 인사이트 태그 → 강사 필터 라우팅
 * 태그 alias가 FIELD_ALIASES를 통해 올바른 강사 목록으로 연결되는지 검증
 * commit 28ad29e (fix) / QA 검수: 2025-03-19
 */
test.describe('BUG-N-014: 인사이트 태그 → 강사 필터 alias 라우팅', () => {
  const aliasCases: { tag: string; expectedField: string }[] = [
    { tag: '번아웃',  expectedField: '심리'   },  // FIELD_ALIASES['번아웃'] = '심리'
    { tag: '팀장',   expectedField: '리더십'  },  // FIELD_ALIASES['팀장']   = '리더십'
    { tag: 'MZ세대', expectedField: 'HR'     },  // FIELD_ALIASES['MZ세대'] = 'HR'
    { tag: '조직문화', expectedField: 'HR'   },  // FIELD_ALIASES['조직문화'] = 'HR'
  ]

  for (const { tag, expectedField } of aliasCases) {
    test(`"${tag}" 태그 → ${expectedField} 강사 목록 1명 이상 표시`, async ({ page }) => {
      await page.goto(`/speakers?category=${encodeURIComponent(tag)}`)
      await page.waitForLoadState('networkidle')

      // SpeakerList 카드는 <Link href="/speakers/[uuid]"> (= <a>) 구조
      // UUID 형식 href (/speakers/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx) 로 정확히 매칭
      const speakerCardLinks = await page.$$('a[href]')
      let count = 0
      for (const el of speakerCardLinks) {
        const href = await el.getAttribute('href')
        if (href && /^\/speakers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(href)) {
          count++
        }
      }

      expect(count).toBeGreaterThan(0)
    })
  }

  test('같은 alias 그룹은 동일 강사 세트 반환 — MZ세대=조직문화(HR)', async ({ page }) => {
    async function getSpeakerHrefs(tag: string): Promise<string[]> {
      await page.goto(`/speakers?category=${encodeURIComponent(tag)}`)
      await page.waitForLoadState('networkidle')
      const all = await page.$$('a[href]')
      const hrefs: string[] = []
      for (const el of all) {
        const href = await el.getAttribute('href')
        if (href && /^\/speakers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(href)) {
          hrefs.push(href)
        }
      }
      return hrefs
    }

    const mzHrefs  = await getSpeakerHrefs('MZ세대')
    const orgHrefs = await getSpeakerHrefs('조직문화')

    // 두 결과의 교집합이 존재해야 함 (같은 HR 필터 → 동일 강사 UUID)
    const intersection = mzHrefs.filter((h) => orgHrefs.includes(h))
    expect(intersection.length).toBeGreaterThan(0)
  })
})

test.describe('내비게이션', () => {
  test('헤더 네비게이션이 데스크탑에서 표시된다', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // 리디자인 후 (2026-03): aria-label 제거됨
    // nav는 <nav class="hidden md:flex"> 형태 — header 내부 nav로 셀렉팅
    const nav = page.locator('header nav')
    await expect(nav).toBeVisible()
  })

  test('홈 페이지에서 강사 섹션 링크가 동작한다', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const speakersLink = page.getByRole('link', { name: /강사/i }).first()
    if (await speakersLink.isVisible()) {
      await speakersLink.click()
      await expect(page).toHaveURL(/speakers/)
    }
  })
})
