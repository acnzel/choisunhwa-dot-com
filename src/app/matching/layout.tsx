import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'

// page.tsx 가 클라이언트 컴포넌트라 metadata 를 export 할 수 없어 레이아웃에서 지정한다.
export const metadata: Metadata = pageMeta({
  title: '강사 매칭 신청',
  description: '강연 목적, 대상, 분야, 예산을 입력하면 조건에 맞는 강사를 추천해 드립니다. 최선화닷컴 강사 매칭.',
  path: '/matching',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
