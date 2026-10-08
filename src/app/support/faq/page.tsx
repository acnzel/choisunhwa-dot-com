import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import type { Faq, FaqCategory } from '@/types'
import FaqAccordion from './FaqAccordion'
import JsonLd from '@/components/seo/JsonLd'
import { pageMeta } from '@/lib/seo'

// 공개 페이지 ISR — 관리자 수정 시 revalidatePublicPages() 로 즉시 갱신
export const revalidate = 86400

export const metadata: Metadata = pageMeta({
  title: '자주 묻는 질문',
  description: '최선화닷컴 강연 기획·강사 섭외 서비스에 대해 자주 묻는 질문과 답변.',
  path: '/support/faq',
})

async function getFaqs() {
  const supabase = createPublicClient()
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

  const faqJsonLd = faqs.length > 0 && {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  return (
    <div className="min-h-screen">
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
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
