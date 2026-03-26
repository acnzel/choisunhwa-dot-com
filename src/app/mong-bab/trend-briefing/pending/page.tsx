import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import PendingList from './PendingList'
import ManualTrigger from './ManualTrigger'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '트렌드 브리핑 관리 | 어드민',
}

async function getPending() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('insights')
    .select('id, title, summary, content_html, source_name, source_url, created_at, meta')
    .eq('auto_generated', true)
    .eq('status', 'draft')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function TrendBriefingPendingPage() {
  const items = await getPending()

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">트렌드 브리핑 관리</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            자동 수집된 인사이트 검토 후 게시
            {items.length > 0 && (
              <span className="ml-2 font-semibold text-[#1D4229]">
                {items.length}건 대기 중
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <ManualTrigger />
          <Link
            href="/mong-bab/insights"
            className="px-4 py-2 text-sm font-medium bg-[#1a1a2e] text-white rounded-xl hover:bg-[#16213e] transition-colors"
          >
            전체 인사이트 →
          </Link>
        </div>
      </div>

      <PendingList items={items} />
    </div>
  )
}
