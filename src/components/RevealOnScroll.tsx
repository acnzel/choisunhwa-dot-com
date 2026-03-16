'use client'

import { useEffect } from 'react'

/**
 * RevealOnScroll — taste-skill scroll interaction system
 *
 * Observes:
 *   .reveal         — fadeUp (기본)
 *   .reveal-left    — 왼쪽에서 진입
 *   .reveal-right   — 오른쪽에서 진입
 *   .reveal-scale   — 스케일 + 위로
 *   .reveal-stagger — 자식들 순차 스태거
 *   .stagger-grid   — 카드 그리드 스태거
 *   [data-parallax] — 패럴랙스 오프셋
 */
export default function RevealOnScroll() {
  useEffect(() => {
    // prefers-reduced-motion 체크 — 모션 감소 설정 시 아무것도 안 함
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    /* ── Intersection Observer ── */
    const SELECTORS =
      '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger, .stagger-grid'

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          const el = entry.target as HTMLElement
          el.classList.add('visible')

          // reveal-stagger: 자식들을 70ms 간격으로 순차 진입
          if (el.classList.contains('reveal-stagger')) {
            Array.from(el.children).forEach((child, i) => {
              setTimeout(() => {
                ;(child as HTMLElement).classList.add('stagger-in')
              }, i * 75)
            })
          }

          observer.unobserve(el)
        })
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -48px 0px', // 뷰포트 하단 48px 전에 트리거
      }
    )

    document.querySelectorAll(SELECTORS).forEach((el) => observer.observe(el))

    /* ── SPEAK 워터마크 패럴랙스 ── */
    const watermark = document.querySelector('[data-parallax="speak"]') as HTMLElement | null
    let rafId = 0

    const onScroll = () => {
      if (!watermark) return
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY
        // 스크롤 내릴수록 워터마크가 위로 이동 (속도 0.22배 — 너무 과하지 않게)
        watermark.style.transform = `translate(-50%, calc(-50% + ${y * 0.22}px))`
      })
    }

    if (watermark) {
      window.addEventListener('scroll', onScroll, { passive: true })
    }

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return null
}
