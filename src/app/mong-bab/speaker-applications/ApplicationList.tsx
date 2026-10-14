'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/admin/AdminList'
import { APPLICATION_STATUS, type Application } from './status'

type Notice =
  | { kind: 'approved'; name: string; speakerId: string }
  | { kind: 'rejected'; name: string }
  | { kind: 'error'; message: string }

export default function ApplicationList({ items, emptyText }: { items: Application[]; emptyText: string }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Application | null>(null)
  const [note, setNote] = useState('')
  // 거절은 사유를 받은 뒤 한 번 더 확정한다
  const [confirmingReject, setConfirmingReject] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  function open(item: Application) {
    setSelected(item)
    setNote(item.admin_note ?? '')
    setConfirmingReject(false)
    setError(null)
  }

  function close() {
    setSelected(null)
    setConfirmingReject(false)
    setError(null)
  }

  async function review(app: Application, action: 'approve' | 'reject') {
    setProcessing(true)
    setError(null)
    try {
      const res = await fetch(`/api/speaker-applications/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, admin_note: note.trim() || undefined }),
      })
      const json = await res.json().catch(() => ({}))

      if (res.ok) {
        setNotice(
          action === 'approve'
            ? { kind: 'approved', name: app.name, speakerId: json.data.speaker_id }
            : { kind: 'rejected', name: app.name },
        )
        close()
        router.refresh()
        return
      }
      if (res.status === 409) {
        // 다른 곳에서 먼저 처리됨: 목록을 새로 고쳐 현재 상태를 보여 준다
        setNotice({ kind: 'error', message: `${app.name} 님의 신청서는 이미 처리되었습니다.` })
        close()
        router.refresh()
        return
      }
      setError(json.error ?? '처리하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } catch {
      setError('서버에 연결하지 못했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      {notice && (
        <div
          role="status"
          className={`mb-4 rounded-xl px-4 py-3 text-sm flex items-center gap-3 ${
            notice.kind === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'
          }`}
        >
          <span className="flex-1">
            {notice.kind === 'approved' && `${notice.name} 님을 비공개 강사로 등록했습니다. 검수한 뒤 공개로 바꿔주세요.`}
            {notice.kind === 'rejected' && `${notice.name} 님의 신청을 거절했습니다.`}
            {notice.kind === 'error' && notice.message}
          </span>
          {notice.kind === 'approved' && (
            <Link href={`/mong-bab/speakers/${notice.speakerId}`} className="font-semibold underline whitespace-nowrap">
              강사 정보 검수하기 →
            </Link>
          )}
          <button onClick={() => setNotice(null)} aria-label="알림 닫기" className="opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

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
                    onClick={() => open(item)}
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
            if (e.target === e.currentTarget && !processing) close()
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 relative">
            <button
              onClick={close}
              disabled={processing}
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

            {selected.status === 'pending' ? (
              <>
                <label htmlFor="admin-note" className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {confirmingReject ? '거절 사유 (필수)' : '관리자 메모 (선택)'}
                </label>
                <textarea
                  id="admin-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  autoFocus={confirmingReject}
                  placeholder={confirmingReject ? '거절 사유를 남겨주세요. 재신청이 오면 판단 근거로 씁니다.' : '검토 메모'}
                  className={`w-full border rounded-xl px-3 py-2 text-sm min-h-[72px] resize-y focus:outline-none focus:ring-2 mb-4 ${
                    confirmingReject ? 'border-red-200 focus:ring-red-200' : 'border-gray-200 focus:ring-[#1a1a2e]/20'
                  }`}
                />

                {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-4">{error}</p>}

                {confirmingReject ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => review(selected, 'reject')}
                      disabled={processing || !note.trim()}
                      className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                    >
                      {processing ? '처리 중...' : '거절 확정'}
                    </button>
                    <button
                      onClick={() => {
                        setConfirmingReject(false)
                        setError(null)
                      }}
                      disabled={processing}
                      className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-3">
                      <button
                        onClick={() => review(selected, 'approve')}
                        disabled={processing}
                        className="flex-1 py-3 rounded-xl bg-[#1a1a2e] text-white text-sm font-semibold hover:bg-[#16213e] disabled:opacity-60"
                      >
                        {processing ? '처리 중...' : '승인 (비공개 강사로 등록)'}
                      </button>
                      <button
                        onClick={() => {
                          setConfirmingReject(true)
                          setError(null)
                        }}
                        disabled={processing}
                        className="flex-1 py-3 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-60"
                      >
                        거절
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      승인하면 강사 관리에 비공개로 등록됩니다. 프로필을 검수한 뒤 강사 관리에서 공개로 바꿔주세요.
                    </p>
                  </>
                )}
              </>
            ) : (
              <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm">
                <p className="text-gray-500">
                  {APPLICATION_STATUS[selected.status].label} 처리됨
                  {selected.reviewed_at && ` · ${new Date(selected.reviewed_at).toLocaleString('ko-KR')}`}
                </p>
                {selected.admin_note && (
                  <p className="text-gray-700 mt-2 whitespace-pre-line">
                    <span className="text-xs font-semibold text-gray-400 mr-2">
                      {selected.status === 'rejected' ? '거절 사유' : '메모'}
                    </span>
                    {selected.admin_note}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
