import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { seasonTriggersFor } from '@/lib/newsletter/seasons'
import TriggerPicker from './TriggerPicker'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '이슈 뉴스레터 | 어드민',
}

const RECENT_DAYS = 14

async function getData() {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const [articles, drafts] = await Promise.all([
    supabase
      .from('insights')
      .select('id, title, summary, source_name, created_at, meta')
      .eq('auto_generated', true)
      .gte('created_at', since)
      .order('created_at', { ascending: false }),
    supabase
      .from('newsletter_drafts')
      .select('id, trigger_title, content, comment, created_at')
      .order('created_at', { ascending: false })
      .limit(30),
  ])
  return { articles: articles.data ?? [], drafts: drafts.data ?? [] }
}

export default async function NewsletterPage() {
  const { articles, drafts } = await getData()
  const month = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', month: 'numeric' }).format(new Date()))
  const seasons = seasonTriggersFor(month).map(({ key, title, description }) => ({ key, title, description }))

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">이슈 뉴스레터</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          이슈 하나를 고르면 강사 3명의 실제 강의를 이어 붙인 3부 프로그램 초안을 만듭니다.
        </p>
      </div>

      {drafts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">만든 초안</h2>
          <ul className="space-y-2">
            {drafts.map(d => (
              <li key={d.id}>
                <Link
                  href={`/mong-bab/newsletter/${d.id}`}
                  className="flex items-center justify-between gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-300"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1a1a2e] truncate">{d.content?.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {d.trigger_title} · {new Date(d.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${d.comment ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {d.comment ? '내보내기 가능' : '한 마디 필요'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <TriggerPicker articles={articles} seasons={seasons} />
    </div>
  )
}
