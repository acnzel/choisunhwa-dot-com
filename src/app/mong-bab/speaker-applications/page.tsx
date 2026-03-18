'use client'

import { useState, useEffect, useCallback } from 'react'

interface Application {
  id: string
  name: string
  email: string
  phone?: string
  title?: string
  company?: string
  fields: string[]
  bio_short?: string
  bio_full?: string
  lecture_topics?: string
  career?: string
  education?: string
  photo_url?: string
  youtube_url?: string
  fee_range?: string
  status: 'pending' | 'approved' | 'rejected'
  admin_note?: string
  created_at: string
}

const STATUS_LABEL: Record<string, string> = {
  pending: '검토 대기', approved: '승인', rejected: '거절',
}
const STATUS_COLOR: Record<string, string> = {
  pending: '#c4933f', approved: '#15803d', rejected: '#b91c1c',
}

export default function SpeakerApplicationsPage() {
  const [items, setItems]       = useState<Application[]>([])
  const [filter, setFilter]     = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<Application | null>(null)
  const [note, setNote]         = useState('')
  const [processing, setProcessing] = useState(false)
  const [total, setTotal]       = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/speaker-applications?status=${filter}&limit=100`)
    const json = await res.json()
    setItems(json.data ?? [])
    setTotal(json.meta?.total ?? 0)
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  async function handleAction(id: string, status: 'approved' | 'rejected') {
    setProcessing(true)
    await fetch(`/api/speaker-applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_note: note }),
    })
    setSelected(null)
    setNote('')
    await load()
    setProcessing(false)
  }

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 32px', borderBottom: '1px solid var(--color-border)',
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 24, letterSpacing: '-0.02em' }}>
            강사 등록 신청
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 4 }}>
            총 {total}건 · 승인하면 강사 DB에 자동 등록 (is_visible=false)
          </p>
        </div>
        {/* 필터 탭 */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['pending', 'approved', 'rejected', 'all'] as const).map(s => (
            <button key={s}
              onClick={() => setFilter(s)}
              style={{
                fontSize: 12, fontWeight: 600, padding: '7px 14px',
                border: '1px solid var(--color-border)',
                background: filter === s ? 'var(--color-ink)' : 'var(--color-bg)',
                color: filter === s ? 'var(--color-bg)' : 'var(--color-subtle)',
                cursor: 'pointer',
              }}
            >
              {s === 'all' ? '전체' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px 32px', textAlign: 'center', color: 'var(--color-muted)' }}>로딩 중...</div>
      ) : items.length === 0 ? (
        <div style={{ padding: '60px 32px', textAlign: 'center', color: 'var(--color-muted)' }}>
          {filter === 'pending' ? '검토 대기 신청서가 없습니다.' : '해당 항목이 없습니다.'}
        </div>
      ) : (
        <div>
          {items.map(item => (
            <div key={item.id}
              onClick={() => { setSelected(item); setNote(item.admin_note ?? '') }}
              style={{
                display: 'grid', gridTemplateColumns: '1fr auto',
                gap: 16, alignItems: 'center',
                padding: '18px 32px',
                borderBottom: '1px solid var(--color-border)',
                cursor: 'pointer',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface)')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{item.name}</span>
                  {item.title && <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>{item.title}</span>}
                  {item.company && <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>· {item.company}</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                  {item.email} {item.phone ? '· ' + item.phone : ''}
                  {item.fields.length > 0 && ' · ' + item.fields.slice(0, 3).join(', ')}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px',
                  color: STATUS_COLOR[item.status] || '#374151',
                  border: `1px solid ${STATUS_COLOR[item.status] || '#e5e7eb'}`,
                }}>
                  {STATUS_LABEL[item.status]}
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                  {new Date(item.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 상세 모달 */}
      {selected && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '40px 20px', overflowY: 'auto',
          }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
        >
          <div style={{
            background: 'var(--color-bg)', width: '100%', maxWidth: 640,
            padding: 32, position: 'relative',
          }}>
            <button
              onClick={() => setSelected(null)}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'none', border: 'none', fontSize: 20,
                cursor: 'pointer', color: 'var(--color-muted)',
              }}
            >✕</button>

            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, marginBottom: 20 }}>
              {selected.name}
              <span style={{
                marginLeft: 12, fontSize: 11, fontWeight: 700, padding: '3px 10px',
                color: STATUS_COLOR[selected.status],
                border: `1px solid ${STATUS_COLOR[selected.status]}`,
              }}>
                {STATUS_LABEL[selected.status]}
              </span>
            </h2>

            {/* 기본 정보 */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13 }}>
              <tbody>
                {[
                  ['이메일', selected.email],
                  ['연락처', selected.phone],
                  ['직함', selected.title],
                  ['소속', selected.company],
                  ['강의료', selected.fee_range],
                  ['영상', selected.youtube_url],
                  ['학력', selected.education],
                  ['분야', selected.fields?.join(', ')],
                ].filter(([,v]) => v).map(([k, v]) => (
                  <tr key={k as string} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '8px 0', color: 'var(--color-muted)', width: 80, fontWeight: 600 }}>{k}</td>
                    <td style={{ padding: '8px 0 8px 16px' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selected.bio_short && <p style={{ fontSize: 14, marginBottom: 12, fontStyle: 'italic', color: 'var(--color-subtle)' }}>"{selected.bio_short}"</p>}
            {selected.bio_full && <p style={{ fontSize: 13, lineHeight: 1.8, marginBottom: 12, color: 'var(--color-subtle)' }}>{selected.bio_full}</p>}
            {selected.lecture_topics && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted)', marginBottom: 4 }}>강의 주제</p>
                <p style={{ fontSize: 13, color: 'var(--color-subtle)' }}>{selected.lecture_topics}</p>
              </div>
            )}
            {selected.career && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted)', marginBottom: 4 }}>주요 경력</p>
                <p style={{ fontSize: 13, color: 'var(--color-subtle)', whiteSpace: 'pre-line' }}>{selected.career}</p>
              </div>
            )}

            {/* 관리자 메모 */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted)', display: 'block', marginBottom: 6 }}>
                관리자 메모
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', minHeight: 72,
                  border: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-body)', fontSize: 13,
                  resize: 'vertical', outline: 'none',
                  background: 'var(--color-bg)',
                }}
                placeholder="검토 메모 (선택사항)"
              />
            </div>

            {/* 액션 버튼 */}
            {selected.status === 'pending' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => handleAction(selected.id, 'approved')}
                  disabled={processing}
                  style={{
                    flex: 1, padding: '13px', border: 'none',
                    background: '#15803d', color: '#fff',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    opacity: processing ? 0.6 : 1,
                  }}
                >
                  {processing ? '처리 중...' : '✅ 승인 (강사 DB에 등록)'}
                </button>
                <button
                  onClick={() => handleAction(selected.id, 'rejected')}
                  disabled={processing}
                  style={{
                    flex: 1, padding: '13px', border: '1px solid #b91c1c',
                    background: 'var(--color-bg)', color: '#b91c1c',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    opacity: processing ? 0.6 : 1,
                  }}
                >
                  거절
                </button>
              </div>
            )}
            {selected.status !== 'pending' && (
              <p style={{ fontSize: 13, color: 'var(--color-muted)', textAlign: 'center' }}>
                이미 처리된 신청서입니다.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
