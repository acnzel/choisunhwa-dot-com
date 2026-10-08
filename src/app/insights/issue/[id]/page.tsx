import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import InsightDetail from '@/components/insights/InsightDetail'
import { getPublishedInsight, insightMetadata } from '@/lib/insights'

// 공개 페이지 ISR — 관리자 수정 시 revalidatePublicPages() 로 즉시 갱신
export const revalidate = 86400

// 빌드 시 미리 만들지 않고 첫 요청 때 만들어 캐시한다
export function generateStaticParams() {
  return []
}

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return insightMetadata(id, 'issue')
}

export default async function IssueDetailPage({ params }: Props) {
  const { id } = await params
  const insight = await getPublishedInsight(id, 'issue')
  if (!insight) notFound()

  return <InsightDetail insight={insight} />
}
