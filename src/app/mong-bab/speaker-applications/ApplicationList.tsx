'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/admin/AdminList'
import { APPLICATION_STATUS, type Application } from './status'

export default function ApplicationList({ items, emptyText }: { items: Application[]; emptyText: string }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Application | null>(null)
  const [note, setNote] = useState('')
  const [processing, setProcessing] = useState(false)

  async function handleAction(id: string, status: 'approved' | 'rejected') {
    setProcessing(true)
    await fetch(`/api/speaker-applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_note: note }),
    })
    setSelected(null)
    setNote('')
    setProcessing(false)
    router.refresh()
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {items.length === 0 ? (
          <p className="text-center py-12 text-sm text-gray-400">{emptyText}</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {items.map((item) => {
              const meta = APPLICATION_STATUS[item.status]
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(item)
                      setNote(item.admin_note ?? '')
                    }}
                    className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-blue-50/60 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium text-gray-800">{item.name}</span>
                        {item.title && <span className="text-gray-500 ml-2">{item.title}</span>}
                        {item.company && <span className="text-gray-500"> · {item.company}</span>}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {item.email}
                        {item.phone ? ` · ${item.phone}` : ''}
                        {item.fields.length > 0 && ` · ${item.fields.slice(0, 3).join(', ')}`}
                      </p>
                    </div>
                    <StatusBadge label={meta.label} tone={meta.tone} />
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center px-5 py-10 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null)
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 relative">
            <button
              onClick={() => setSelected(null)}
              aria-label="닫기"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xl font-bold text-[#1a1a2e]">{selected.name}</h2>
              <StatusBadge label={APPLICATION_STATUS[selected.status].label} tone={APPLICATION_STATUS[selected.status].tone} />
            </div>

            <dl className="space-y-2 text-sm mb-5">
              {(
                [
                  ['이메일', selected.email],
                  ['연락처', selected.phone],
                  ['직함', selected.title],
                  ['소속', selected.company],
                  ['강의료', selected.fee_range],
                  ['영상', selected.youtube_url],
                  ['학력', selected.education],
                  ['분야', selected.fields?.join(', ')],
                ] as const
              )
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="grid grid-cols-4 gap-2 border-b border-gray-50 pb-2">
                    <dt className="text-gray-400">{k}</dt>
                    <dd className="col-span-3 text-gray-700 break-all">{v}</dd>
                  </div>
                ))}
            </dl>

            {selected.bio_short && <p className="text-sm italic text-gray-600 mb-3">&quot;{selected.bio_short}&quot;</p>}
            {selected.bio_full && <p className="text-sm leading-relaxed text-gray-600 mb-3">{selected.bio_full}</p>}
            {selected.lecture_topics && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-400 mb-1">강의 주제</p>
                <p className="text-sm text-gray-600">{selected.lecture_topics}</p>
              </div>
            )}
            {selected.career && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-400 mb-1">주요 경력</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{selected.career}</p>
              </div>
            )}

            <label className="block text-xs font-semibold text-gray-400 mb-1.5">관리자 메모</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="검토 메모 (선택사항)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm min-h-[72px] resize-y focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 mb-5"
            />

            {selected.status === 'pending' ? (
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(selected.id, 'approved')}
                  disabled={processing}
                  className="flex-1 py-3 rounded-xl bg-[#1a1a2e] text-white text-sm font-semibold hover:bg-[#16213e] disabled:opacity-60"
                >
                  {processing ? '처리 중...' : '승인 (강사 DB에 등록)'}
                </button>
                <button
                  onClick={() => handleAction(selected.id, 'rejected')}
                  disabled={processing}
                  className="flex-1 py-3 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-60"
                >
                  거절
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center">이미 처리된 신청서입니다.</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
