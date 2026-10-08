'use client'

import { usePathname } from 'next/navigation'

// 상세 글(/insights/{type}/{id})에서는 글 제목이 H1 이므로 히어로 문구를 <p> 로 낮춘다.
export default function InsightsHeroTitle({ style, children }: { style: React.CSSProperties; children: React.ReactNode }) {
  const pathname = usePathname()
  const isDetail = pathname.split('/').filter(Boolean).length >= 3
  const Tag = isDetail ? 'p' : 'h1'
  return <Tag style={style}>{children}</Tag>
}
