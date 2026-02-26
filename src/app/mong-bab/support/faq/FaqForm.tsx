'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Faq, FaqCategory } from '@/types'

interface Props {
  faq?: Faq
  categories: FaqCategory[]
}

export default function FaqForm({ faq, categories }: Props) {
  const router = useRouter()
  const isEdit = !!faq
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    category_id: faq?.category_id ?? (categories[0]?.id ?? ''),
    question: faq?.question ?? '',
    answer: faq?.answer ?? '',
    is_visible: faq?.is_visible ?? false,
    sort_order: faq?.sort_order ?? 0,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.question.trim()) { setError('질문을 입력해주세요'); return }
    setLoading(true)
    setError(null)

    const payload = {
      category_id: form.category_id || null,
      question: form.question.trim(),
      answer: form.answer.trim(),
      is_visible: form.is_visible,
      sort_order: form.sort_order,
    }

    try {
      const url = isEdit
        ? `/api/admin/support/faq/${faq!.id}`
        : '/api/admin/support/faq'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '저장 실패')
        return
      }

      const result = await res.json()
      const id = isEdit ? faq!.id : (result.data?.id ?? result.id)
      router.push(`/mong-bab/support/faq/${id}?saved=1`)
      router.refresh()
    } catch {
      setError('서버 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!faq || !confirm(`이 FAQ를 삭제하시겠습니까?`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/support/faq/${faq.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/mong-bab/support')
      } else {
        const data = await res.json()
        setError(data.error ?? '삭제 실패')
        setDeleting(false)
      }
    } catch {
      setError('서버 오류')
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-base font-semibold text-[#1a1a2e]">FAQ 내용</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">카테고리</label>
            {categories.length > 0 ? (
              <select
                value={form.category_id}
                onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white"
              >
                <option value="">카테고리 없음</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-gray-400 py-2">등록된 카테고리가 없습니다.</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">노출 순서</label>
            <input
              type="number"
              min={0}
              value={form.sort_order}
              onChange={(e) => setForm((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">질문 *</label>
          <input
            type="text"
            required
            autoFocus={!isEdit}
            value={form.question}
            onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
            placeholder="자주 묻는 질문을 입력하세요"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">답변</label>
          <textarea
            value={form.answer}
            onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))}
            rows={8}
            placeholder="답변을 입력하세요..."
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] resize-none"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, is_visible: !p.is_visible }))}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.is_visible ? 'bg-green-500' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${form.is_visible ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
          <span className="text-sm text-gray-700">{form.is_visible ? '🟢 공개' : '⚫️ 비공개'}</span>
        </label>
      </section>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{error}</p>
      )}

      <div className="flex items-center gap-3 pb-8">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 bg-[#1a1a2e] text-white text-sm font-semibold rounded-xl hover:bg-[#16213e] disabled:opacity-50 transition-colors"
        >
          {loading ? '저장 중...' : isEdit ? '수정하기' : '등록하기'}
        </button>
        <Link
          href="/mong-bab/support"
          className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          취소
        </Link>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2.5 border border-red-200 text-red-500 text-sm font-medium rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        )}
      </div>
    </form>
  )
}
