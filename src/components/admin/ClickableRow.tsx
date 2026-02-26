'use client'

import { useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'

interface Props {
  href: string
  children: React.ReactNode
  className?: string
}

/**
 * 테이블 행 전체를 클릭하면 href로 이동.
 * 행 내부의 <button>, <a>, <input> 클릭은 버블링 차단하여 독립 동작 유지.
 */
export default function ClickableRow({ href, children, className = '' }: Props) {
  const router = useRouter()

  function handleClick(e: MouseEvent<HTMLTableRowElement>) {
    const target = e.target as HTMLElement
    if (target.closest('button, a, input')) return
    router.push(href)
  }

  return (
    <tr
      onClick={handleClick}
      className={`cursor-pointer hover:bg-blue-50/60 transition-colors ${className}`}
    >
      {children}
    </tr>
  )
}
