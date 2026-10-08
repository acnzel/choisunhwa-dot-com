import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import InsightDetail from '@/components/insights/InsightDetail'
import { getPublishedInsight, insightMetadata } from '@/lib/insights'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return insightMetadata(id, 'report')
}

export default async function ReportDetailPage({ params }: Props) {
  const { id } = await params
  const insight = await getPublishedInsight(id, 'report')
  if (!insight) notFound()

  return <InsightDetail insight={insight} />
}
