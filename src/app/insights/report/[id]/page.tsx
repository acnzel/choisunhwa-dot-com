import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import InsightDetail from '@/components/insights/InsightDetail'
import { insightMetadata } from '@/components/insights/insightMetadata'
import type { Insight } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return insightMetadata(id, 'report', '현장 스토리')
}

export default async function ReportDetailPage({ params }: Props) {
  const { id } = await params
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('insights')
    .select('*')
    .eq('id', id)
    .eq('type', 'report')
    .eq('status', 'published')
    .single()

  if (error || !data) notFound()

  return <InsightDetail insight={data as Insight} />
}
