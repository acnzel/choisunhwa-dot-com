import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Notice } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

async function getNotice(id: string): Promise<Notice | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('notices')
    .select('*')
    .eq('id', id)
    .eq('is_visible', true)
    .single()
  return (data as Notice) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const notice = await getNotice(id)
  return { title: notice?.title ?? '공지사항' }
}

export default async function NoticeDetailPage({ params }: Props) {
  const { id } = await params
  const notice = await getNotice(id)
  if (!notice) notFound()

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/support/notice" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← 공지사항 목록
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <article>
          <header className="mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              {notice.is_pinned && (
                <span className="text-xs font-bold text-white bg-[#1a1a2e] px-2 py-0.5 rounded-full">
                  공지
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">{notice.title}</h1>
            <time className="text-sm text-gray-400 mt-2 block">
              {new Date(notice.published_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </header>

          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {notice.content}
          </div>
        </article>

        <div className="mt-12 pt-6 border-t border-gray-100">
          <Link
            href="/support/notice"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1a1a2e] transition-colors"
          >
            ← 목록으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
