'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { InquiryMemo } from '@/types'
import { INQUIRY_STATUSES } from '@/constants'

const STATUS_COLOR: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-orange-100 text-orange-700',
  done: 'bg-green-100 text-green-700',
}

interface Props {
  inquiryId: string
  currentStatus: string
  memos: InquiryMemo[]
  statusMap: Record<string, string>
}

export default function InquiryDetail({ inquiryId, currentStatus, memos: initialMemos, statusMap }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [memos, setMemos] = useState<InquiryMemo[]>(initialMemos)
  const [memoText, setMemoText] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)
  const [addingMemo, setAddingMemo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStatusChange(newStatus: string) {
    if (newStatus === status) return
    setSavingStatus(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? '상태 변경 실패')
        return
      }
      setStatus(newStatus)
      router.refresh()
    } catch {
      setError('서버 오류')
    } finally {
      setSavingStatus(false)
    }
  }

  async function handleAddMemo(e: React.FormEvent) {
    e.preventDefault()
    if (!memoText.trim()) return
    setAddingMemo(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}/memos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: memoText.trim() }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? '메모 추가 실패')
        return
      }
      const { data } = await res.json()
      setMemos((prev) => [...prev, data as InquiryMemo])
      setMemoText('')
    } catch {
      setError('서버 오류')
    } finally {
      setAddingMemo(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* 상태 변경 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">처리 상태</h2>
        <div className="flex flex-wrap gap-2">
          {INQUIRY_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => handleStatusChange(s.value)}
              disabled={savingStatus}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                status === s.value
                  ? `${STATUS_COLOR[s.value]} border-transparent font-semibold`
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              } disabled:opacity-50`}
            >
              {s.label}
            </button>
          ))}
        </div>
        {savingStatus && <p className="text-xs text-gray-400 mt-2">저장 중...</p>}
      </div>

      {/* 메모 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">내부 메모 ({memos.length})</h2>

        {memos.length === 0 ? (
          <p className="text-xs text-gray-400 mb-4">메모가 없습니다.</p>
        ) : (
          <div className="space-y-3 mb-4">
            {memos.map((memo) => (
              <div key={memo.id} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">{memo.admin_name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(memo.created_at).toLocaleString('ko-KR')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{memo.content}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddMemo} className="space-y-2">
          <textarea
            value={memoText}
            onChange={(e) => setMemoText(e.target.value)}
            rows={2}
            placeholder="메모를 입력하세요..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 resize-none"
          />
          <button
            type="submit"
            disabled={addingMemo || !memoText.trim()}
            className="px-4 py-1.5 bg-[#1a1a2e] text-white text-xs font-medium rounded-lg hover:bg-[#16213e] transition-colors disabled:opacity-50"
          >
            {addingMemo ? '추가 중...' : '메모 추가'}
          </button>
        </form>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
      )}
    </div>
  )
}
