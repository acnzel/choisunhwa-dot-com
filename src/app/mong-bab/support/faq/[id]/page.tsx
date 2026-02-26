import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Faq, FaqCategory } from '@/types'
import FaqForm from '../FaqForm'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

export default async function EditFaqPage({ params, searchParams }: Props) {
  const { id } = await params
  const { saved } = await searchParams

  const supabase = createAdminClient()
  const [{ data: faqData }, { data: catData }] = await Promise.all([
    supabase.from('faqs').select('*').eq('id', id).single(),
    supabase.from('faq_categories').select('*').order('sort_order', { ascending: true }),
  ])

  const faq = faqData as Faq | null
  const categories = (catData as FaqCategory[]) ?? []
  if (!faq) notFound()

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/mong-bab/support" className="text-sm text-gray-400 hover:text-gray-600">
          ← FAQ & 공지사항
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-bold text-[#1a1a2e]">FAQ 편집</h1>
      </div>

      {saved && (
        <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
          ✅ 저장되었습니다.
        </div>
      )}

      <FaqForm faq={faq} categories={categories} />
    </div>
  )
}
