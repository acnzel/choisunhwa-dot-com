import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Notice } from '@/types'

export const metadata: Metadata = {
  title: '공지사항',
}

async function getNotices(): Promise<Notice[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('notices')
    .select('*')
    .eq('is_visible', true)
    .lte('published_at', new Date().toISOString())
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
  return (data as Notice[]) ?? []
}

export default async function NoticePage() {
  const notices = await getNotices()

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-[#1a1a2e]">공지사항</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {notices.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">공지사항이 없습니다.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notices.map((notice) => (
              <Link
                key={notice.id}
                href={`/support/notice/${notice.id}`}
                className="flex items-start justify-between py-4 hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors group"
              >
                <div className="flex items-start gap-3">
                  {notice.is_pinned && (
                    <span className="mt-0.5 flex-shrink-0 text-xs font-bold text-white bg-[#1a1a2e] px-2 py-0.5 rounded-full">
                      공지
                    </span>
                  )}
                  <span className={`text-sm font-medium group-hover:text-[#1a1a2e] transition-colors ${notice.is_pinned ? 'text-[#1a1a2e]' : 'text-gray-700'}`}>
                    {notice.title}
                  </span>
                </div>
                <time className="text-xs text-gray-400 flex-shrink-0 ml-4">
                  {new Date(notice.published_at).toLocaleDateString('ko-KR')}
                </time>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
