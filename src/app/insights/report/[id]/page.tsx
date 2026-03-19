import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import InsightDetail from '@/components/insights/InsightDetail'
import type { Insight } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const admin = createAdminClient()
  const { data } = await admin.from('insights').select('title, summary').eq('id', id).single()
  if (!data) return { title: '현장 스토리' }
  return {
    title: data.title,
    description: data.summary ?? undefined,
  }
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
