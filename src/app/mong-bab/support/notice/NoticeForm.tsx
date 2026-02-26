'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Notice } from '@/types'

interface Props {
  notice?: Notice
}

export default function NoticeForm({ notice }: Props) {
  const router = useRouter()
  const isEdit = !!notice
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: notice?.title ?? '',
    content: notice?.content ?? '',
    is_pinned: notice?.is_pinned ?? false,
    is_visible: notice?.is_visible ?? false,
    published_at: notice?.published_at
      ? notice.published_at.substring(0, 10)
      : new Date().toISOString().substring(0, 10),
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('제목을 입력해주세요'); return }
    setLoading(true)
    setError(null)

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      is_pinned: form.is_pinned,
      is_visible: form.is_visible,
      published_at: new Date(form.published_at).toISOString(),
    }

    try {
      const url = isEdit
        ? `/api/admin/support/notices/${notice!.id}`
        : '/api/admin/support/notices'
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
      const id = isEdit ? notice!.id : (result.data?.id ?? result.id)
      router.push(`/mong-bab/support/notice/${id}?saved=1`)
      router.refresh()
    } catch {
      setError('서버 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!notice || !confirm(`'${notice.title}' 공지사항을 삭제하시겠습니까?`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/support/notices/${notice.id}`, { method: 'DELETE' })
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
        <h2 className="text-base font-semibold text-[#1a1a2e]">공지사항 내용</h2>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">제목 *</label>
          <input
            type="text"
            required
            autoFocus={!isEdit}
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="공지사항 제목"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">내용</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            rows={10}
            placeholder="공지사항 내용을 입력하세요..."
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">게시일</label>
          <input
            type="date"
            value={form.published_at}
            onChange={(e) => setForm((p) => ({ ...p, published_at: e.target.value }))}
            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e]"
          />
        </div>

        <div className="flex items-center gap-6 pt-1">
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

          <label className="flex items-center gap-2 cursor-pointer">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, is_pinned: !p.is_pinned }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.is_pinned ? 'bg-[#1a1a2e]' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${form.is_pinned ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-sm text-gray-700">{form.is_pinned ? '📌 상단 고정' : '상단 고정 없음'}</span>
          </label>
        </div>
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
