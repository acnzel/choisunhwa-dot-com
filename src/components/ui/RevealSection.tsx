'use client'

import { useEffect, useRef } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  delayMs?: number
  threshold?: number
}

/**
 * 스크롤 진입 시 reveal 애니메이션 래퍼
 * globals.css .reveal / .is-visible 클래스와 연동
 */
export default function RevealSection({
  children,
  className = '',
  delayMs = 0,
  threshold = 0.1,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          obs.unobserve(el)
        }
      },
      { threshold, rootMargin: '0px 0px -48px 0px' }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  )
}
