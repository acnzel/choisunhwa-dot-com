'use client'

import { useState, useMemo } from 'react'
import type { Faq, FaqCategory } from '@/types'

interface Props {
  faqs: (Faq & { category: FaqCategory })[]
  categories: FaqCategory[]
}

export default function FaqAccordion({ faqs, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return faqs.filter((f) => {
      const matchCat = activeCategory === 'all' || f.category_id === activeCategory
      const q = search.toLowerCase()
      const matchSearch = !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [faqs, activeCategory, search])

  return (
    <div>
      {/* 검색 */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="질문 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-[#1a1a2e] bg-white"
        />
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${activeCategory === 'all' ? 'bg-[#1a1a2e] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${activeCategory === cat.id ? 'bg-[#1a1a2e] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 아코디언 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {search ? '검색 결과가 없습니다.' : '등록된 FAQ가 없습니다.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((faq) => (
            <div key={faq.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                aria-expanded={openId === faq.id}
              >
                <span className="text-sm font-medium text-[#1a1a2e] pr-4">{faq.question}</span>
                <svg
                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${openId === faq.id ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openId === faq.id && (
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3 whitespace-pre-line">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
