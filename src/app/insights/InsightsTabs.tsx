'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/insights/issue',    label: '인사이트' },
  { href: '/insights/report',   label: '현장 스토리' },
  { href: '/insights/featured', label: '에디터 픽' },
]

export default function InsightsTabs() {
  const pathname = usePathname()

  return (
    <nav style={{
      display: 'flex',
      borderBottom: '1px solid var(--color-border)',
      padding: '0 var(--space-page)',
      overflowX: 'auto',
      scrollbarWidth: 'none',
    }}>
      <style>{`.insights-tab-nav::-webkit-scrollbar { display: none; }`}</style>
      {TABS.map(({ href, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: active ? 'var(--color-ink)' : 'var(--color-muted)',
              padding: '14px 0',
              marginRight: '28px',
              flexShrink: 0,
              borderBottom: active ? '2px solid var(--color-ink)' : '2px solid transparent',
              transition: 'color 0.2s',
              textDecoration: 'none',
            }}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
