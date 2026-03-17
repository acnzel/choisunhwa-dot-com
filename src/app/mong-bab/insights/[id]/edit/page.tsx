import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import InsightForm from '../../InsightForm'
import Link from 'next/link'
import type { Insight } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditInsightPage({ params }: Props) {
  const { id } = await params
  const admin = createAdminClient()
  const { data, error } = await admin.from('insights').select('*').eq('id', id).single()
  if (error || !data) notFound()

  const insight = data as Insight

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/mong-bab/insights" style={{ color: '#6b7280', fontSize: 13 }}>← 인사이트 목록</Link>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>인사이트 수정</h1>
      </div>
      <InsightForm mode="edit" insight={insight} />
    </div>
  )
}
