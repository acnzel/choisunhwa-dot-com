import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Faq, FaqCategory } from '@/types'
import FaqAccordion from './FaqAccordion'

export const metadata: Metadata = {
  title: 'FAQ',
  description: '자주 묻는 질문을 확인해보세요.',
}

async function getFaqs() {
  const supabase = await createClient()
  const [{ data: faqs }, { data: categories }] = await Promise.all([
    supabase
      .from('faqs')
      .select('*, category:faq_categories(id, name, sort_order)')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('faq_categories')
      .select('*')
      .order('sort_order', { ascending: true }),
  ])
  return {
    faqs: (faqs as (Faq & { category: FaqCategory })[]) ?? [],
    categories: (categories as FaqCategory[]) ?? [],
  }
}

export default async function FaqPage() {
  const { faqs, categories } = await getFaqs()

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-[#1a1a2e]">자주 묻는 질문</h1>
          <p className="mt-2 text-gray-500 text-sm">궁금한 점을 빠르게 찾아보세요.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FaqAccordion faqs={faqs} categories={categories} />
      </div>
    </div>
  )
}
