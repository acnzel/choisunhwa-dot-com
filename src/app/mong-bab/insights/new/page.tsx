import InsightForm from '../InsightForm'
import Link from 'next/link'

export default function NewInsightPage() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/mong-bab/insights" style={{ color: '#6b7280', fontSize: 13 }}>← 인사이트 목록</Link>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>새 콘텐츠 등록</h1>
      </div>
      <InsightForm mode="new" />
    </div>
  )
}
