'use client'

/**
 * ScrollToTop
 *
 * 경로(pathname) 또는 검색 파라미터(searchParams)가 바뀔 때마다
 * 스크롤을 즉시 최상단으로 이동시킵니다.
 *
 * 처리하는 케이스:
 * - 새 페이지로 이동 (/speakers → /lectures)
 * - 같은 경로에서 파라미터 변경 (/speakers?page=1 → /speakers?page=2)
 *
 * behavior: 'instant' 을 명시해 CSS scroll-behavior: smooth 가 개입하지 않도록 합니다.
 * body에 overflow-x: hidden 이 걸려 있는 환경을 위해 세 가지 방법을 모두 호출합니다.
 */

import { Suspense, useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function ScrollToTopInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const key = `${pathname}?${searchParams.toString()}`
  const prevKey = useRef<string | null>(null)

  useEffect(() => {
    // 최초 마운트는 건너뜀 — 페이지 진입 시 초기 위치 유지
    if (prevKey.current === null) {
      prevKey.current = key
      return
    }
    // 이전 키와 다를 때만 스크롤 리셋
    if (prevKey.current !== key) {
      prevKey.current = key
      try {
        // 1순위: window.scrollTo (대부분 브라우저)
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      } catch {
        // fallback: behavior 옵션 미지원 브라우저
        window.scrollTo(0, 0)
      }
      // body 또는 documentElement 가 실제 scroll container 인 경우 대비
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
  }, [key])

  return null
}

// useSearchParams()는 Suspense boundary 안에서만 사용 가능 (Next.js 요구사항)
export default function ScrollToTop() {
  return (
    <Suspense fallback={null}>
      <ScrollToTopInner />
    </Suspense>
  )
}
