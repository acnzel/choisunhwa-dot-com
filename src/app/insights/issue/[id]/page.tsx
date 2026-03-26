import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import InsightDetail from '@/components/insights/InsightDetail'
import type { Insight } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const admin = createAdminClient()
  const { data } = await admin.from('insights').select('title, summary').eq('id', id).single()
  if (!data) return { title: '인사이트' }
  return {
    title: data.title,
    description: data.summary ?? undefined,
  }
}

export default async function IssueDetailPage({ params }: Props) {
  const { id } = await params
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('insights')
    .select('*')
    .eq('id', id)
    .eq('type', 'issue')
    .eq('status', 'published')
    .single()

  if (error || !data) notFound()

  return <InsightDetail insight={data as Insight} />
}
