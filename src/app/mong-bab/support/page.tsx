import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import type { Faq, Notice } from '@/types'

async function getData() {
  const supabase = createAdminClient()
  const [{ data: faqs }, { data: notices }] = await Promise.all([
    supabase.from('faqs').select('*, category:faq_categories(name)').order('sort_order', { ascending: true }).limit(10),
    supabase.from('notices').select('*').order('created_at', { ascending: false }).limit(10),
  ])
  return {
    faqs: (faqs as (Faq & { category: { name: string } })[]) ?? [],
    notices: (notices as Notice[]) ?? [],
  }
}

export default async function AdminSupportPage() {
  const { faqs, notices } = await getData()

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-[#1a1a2e]">FAQ & 공지사항 관리</h1>

      {/* FAQ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1a1a2e]">FAQ</h2>
          <Link
            href="/mong-bab/support/faq/new"
            className="px-3 py-1.5 bg-[#1a1a2e] text-white text-xs font-medium rounded-lg hover:bg-[#16213e] transition-colors"
          >
            + FAQ 추가
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {faqs.length === 0 ? (
              <p className="text-center py-8 text-sm text-gray-400">등록된 FAQ가 없습니다.</p>
            ) : (
              faqs.map((faq) => (
                <Link
                  key={faq.id}
                  href={`/mong-bab/support/faq/${faq.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-blue-50/60 transition-colors"
                >
                  <div>
                    <span className="text-xs text-gray-400 mr-2">[{faq.category?.name ?? '미분류'}]</span>
                    <span className="text-sm text-gray-700">{faq.question}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${faq.is_visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {faq.is_visible ? '공개' : '비공개'}
                    </span>
                    <span className="text-xs text-[#1a1a2e]">→ 편집</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 공지사항 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1a1a2e]">공지사항</h2>
          <Link
            href="/mong-bab/support/notice/new"
            className="px-3 py-1.5 bg-[#1a1a2e] text-white text-xs font-medium rounded-lg hover:bg-[#16213e] transition-colors"
          >
            + 공지 추가
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {notices.length === 0 ? (
              <p className="text-center py-8 text-sm text-gray-400">등록된 공지사항이 없습니다.</p>
            ) : (
              notices.map((n) => (
                <Link
                  key={n.id}
                  href={`/mong-bab/support/notice/${n.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-blue-50/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {n.is_pinned && (
                      <span className="text-xs font-bold text-white bg-[#1a1a2e] px-1.5 py-0.5 rounded">공지</span>
                    )}
                    <span className="text-sm text-gray-700">{n.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${n.is_visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {n.is_visible ? '공개' : '비공개'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(n.published_at).toLocaleDateString('ko-KR')}
                    </span>
                    <span className="text-xs text-[#1a1a2e]">→ 편집</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
