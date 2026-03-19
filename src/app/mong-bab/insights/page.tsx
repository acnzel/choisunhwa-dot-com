import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import type { Insight } from '@/types'

const TYPE_LABEL: Record<string, string> = {
  issue:  '인사이트',
  report: '강연 현장',
  pick:   '에디터 픽',
}
const STATUS_LABEL: Record<string, string> = {
  draft:     '임시저장',
  pending:   '발행 대기',
  published: '발행됨',
}
const STATUS_COLOR: Record<string, string> = {
  draft:     '#9ca3af',
  pending:   '#f59e0b',
  published: '#10b981',
}

async function getInsights(): Promise<Insight[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('insights')
    .select('id, type, title, status, home_featured, published_at, created_at')
    .order('created_at', { ascending: false })
    .limit(100)
  return (data as Insight[]) ?? []
}

export default async function InsightsAdminPage() {
  const insights = await getInsights()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>인사이트 관리</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            인사이트 · 현장 스토리 · 에디터 픽
          </p>
        </div>
        <Link
          href="/mong-bab/insights/new"
          style={{
            padding: '8px 18px', background: '#1a1a2e', color: '#fff',
            borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}
        >
          + 새 콘텐츠
        </Link>
      </div>

      {/* 필터 탭 - TODO: 클라이언트 컴포넌트로 분리 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['all', 'issue', 'report', 'pick'] as const).map(t => (
          <span key={t} style={{
            padding: '4px 14px', borderRadius: 20,
            background: t === 'all' ? '#1a1a2e' : '#f3f4f6',
            color: t === 'all' ? '#fff' : '#374151',
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
          }}>
            {t === 'all' ? '전체' : TYPE_LABEL[t]}
          </span>
        ))}
      </div>

      {insights.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 0',
          color: '#9ca3af', fontSize: 14,
        }}>
          아직 등록된 인사이트가 없습니다.<br />
          <Link href="/mong-bab/insights/new" style={{ color: '#1a1a2e', marginTop: 8, display: 'inline-block' }}>
            첫 콘텐츠 등록하기 →
          </Link>
        </div>
      ) : (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['유형', '제목', '상태', '홈 노출', '등록일', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {insights.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: idx < insights.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: item.type === 'issue' ? '#eff6ff' : item.type === 'report' ? '#f0fdf4' : '#fdf4ff',
                      color: item.type === 'issue' ? '#1d4ed8' : item.type === 'report' ? '#15803d' : '#7e22ce',
                    }}>
                      {TYPE_LABEL[item.type]}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 500, color: '#1a1a2e', maxWidth: 300 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ color: STATUS_COLOR[item.status], fontWeight: 600, fontSize: 12 }}>
                      ● {STATUS_LABEL[item.status]}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    {item.home_featured ? '✅' : '—'}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: 12 }}>
                    {new Date(item.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Link
                      href={`/mong-bab/insights/${item.id}/edit`}
                      style={{ color: '#1a1a2e', fontSize: 12, fontWeight: 600 }}
                    >
                      수정
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
