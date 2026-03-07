'use client'

import { useEffect, useRef, useState } from 'react'

interface Stat {
  number: string  // e.g. "500건+", "200곳+", "98%"
  label: string
  highlight?: boolean
}

function parseNumber(raw: string): { prefix: string; value: number; suffix: string } {
  const match = raw.match(/^([^\d]*)(\d+)(.*)$/)
  if (!match) return { prefix: '', value: 0, suffix: raw }
  return { prefix: match[1], value: parseInt(match[2], 10), suffix: match[3] }
}

function useCountUp(target: number, duration = 1400, active = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let start: number | null = null
    const startVal = 0
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(startVal + (target - startVal) * eased))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, target, duration])
  return count
}

function StatItem({ stat, index, active }: { stat: Stat; index: number; active: boolean }) {
  const { prefix, value, suffix } = parseNumber(stat.number)
  const count = useCountUp(value, 1400, active)
  const display = `${prefix}${count}${suffix}`

  return (
    <div
      className="trust-item"
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 900,
        fontSize: 'clamp(36px, 4.5vw, 64px)',
        letterSpacing: '-0.03em', lineHeight: 1,
        color: stat.highlight ? '#c4724a' : 'var(--color-ink)',
        marginBottom: '8px',
        transition: 'color 0.2s',
      }}>
        {active ? display : stat.number}
      </div>
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 400,
        color: 'var(--color-subtle)', letterSpacing: '0.04em',
      }}>
        {stat.label}
      </div>
    </div>
  )
}

export default function TrustStats({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect() } },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="trust-grid">
      {stats.map((stat, i) => (
        <StatItem key={stat.label} stat={stat} index={i} active={active} />
      ))}
    </div>
  )
}
