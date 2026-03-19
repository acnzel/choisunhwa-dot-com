import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import InsightCard from '@/components/insights/InsightCard'
import type { Insight, InsightMetaReport } from '@/types'

export const metadata: Metadata = {
  title: '현장 스토리',
  description: '실제 진행된 강연의 현장 리포트 — 최선화닷컴이 함께한 현장 스토리',
}

async function getReports(): Promise<Insight[]> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('insights')
      .select('*')
      .eq('type', 'report')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    if (error) throw error
    return (data as Insight[]) ?? []
  } catch {
    return []
  }
}

export default async function ReportPage() {
  const items = await getReports()

  if (items.length === 0) return null

  return (
    <section style={{ padding: 'clamp(28px, 4vw, 44px) var(--space-page)' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 20,
      }}>
        {items.map(item => {
          const meta = item.meta as InsightMetaReport
          const companyLabel = meta?.company_visibility === 'anonymous'
            ? '익명 기업'
            : meta?.company_visibility === 'industry_only'
              ? `${meta?.company ?? ''} 업종`
              : meta?.company

          return (
            <div key={item.id} style={{ position: 'relative' }}>
              <InsightCard insight={item} href={`/insights/report/${item.id}`} />
              {companyLabel && (
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  fontSize: 11, fontWeight: 600,
                  background: 'rgba(26,26,46,0.85)',
                  color: '#fff',
                  padding: '3px 10px',
                  backdropFilter: 'blur(4px)',
                }}>
                  {companyLabel}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
