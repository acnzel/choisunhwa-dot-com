import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'

// page.tsx 가 클라이언트 컴포넌트라 metadata 를 export 할 수 없어 레이아웃에서 지정한다.
export const metadata: Metadata = pageMeta({
  title: '강사 등록 신청',
  description: '최선화닷컴에 강사로 등록하세요. 프로필과 강연 주제를 보내주시면 검토 후 연락드립니다.',
  path: '/apply',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
