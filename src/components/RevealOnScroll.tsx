'use client'

import { useEffect } from 'react'

/**
 * RevealOnScroll — taste-skill upgrade
 * Observes all `.reveal` elements and adds `.visible` when they enter the viewport.
 * Render this once at the top of any page (server component friendly).
 */
export default function RevealOnScroll() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.07 }
    )

    const els = document.querySelectorAll('.reveal')
    els.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return null
}
