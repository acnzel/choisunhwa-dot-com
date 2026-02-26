import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import type { FaqCategory } from '@/types'
import FaqForm from '../FaqForm'

async function getCategories(): Promise<FaqCategory[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('faq_categories')
    .select('*')
    .order('sort_order', { ascending: true })
  return (data as FaqCategory[]) ?? []
}

export default async function NewFaqPage() {
  const categories = await getCategories()

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/mong-bab/support" className="text-sm text-gray-400 hover:text-gray-600">
          ← FAQ & 공지사항
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-bold text-[#1a1a2e]">새 FAQ 등록</h1>
      </div>
      <FaqForm categories={categories} />
    </div>
  )
}
