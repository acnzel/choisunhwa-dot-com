'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { FeaturedSpeakerItem } from '@/types'

// ── 강사 검색용 최소 타입 ───────────────────────────────────
interface SpeakerOption {
  id: string
  name: string
  title: string
  company: string
  photo_url: string | null
}

// ── 모달 상태 ─────────────────────────────────────────────
type ModalMode = 'add' | 'edit' | null

const INTRO_MAX = 80

const defaultForm = {
  speaker_id: '',
  intro: '',
  tags: [] as string[],
  is_visible: true,
  home_visible: false,
  sort_order: 1,
  start_date: '',
  end_date: '',
}

// ── API 헬퍼 ─────────────────────────────────────────────
async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export default function FeaturedSpeakersAdminPage() {
  const [items, setItems]         = useState<FeaturedSpeakerItem[]>([])
  const [speakers, setSpeakers]   = useState<SpeakerOption[]>([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<FeaturedSpeakerItem | null>(null)
  const [form, setForm]           = useState(defaultForm)
  const [speakerQuery, setSpeakerQuery] = useState('')
  const [saving, setSaving]       = useState(false)
  const [deleteId, setDeleteId]   = useState<string | null>(null)
  const [tagInput, setTagInput]   = useState('')
  const [error, setError]         = useState<string | null>(null)

  // ── 데이터 로드 ─────────────────────────────────────────
  const loadItems = useCallback(async () => {
    try {
      const data = await apiFetch('/api/featured-speakers?all=true')
      setItems(data)
    } catch {
      setError('이달의 강사 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSpeakers = useCallback(async () => {
    try {
      const res = await fetch('/api/speakers?limit=600')
      if (res.ok) {
        const data = await res.json()
        setSpeakers(data.speakers ?? data ?? [])
      }
    } catch { /* 무시 */ }
  }, [])

  useEffect(() => {
    loadItems()
    loadSpeakers()
  }, [loadItems, loadSpeakers])

  // ── 모달 열기 ─────────────────────────────────────────
  function openAdd() {
    setForm({ ...defaultForm, sort_order: items.length + 1 })
    setSpeakerQuery('')
    setTagInput('')
    setEditTarget(null)
    setModal('add')
  }

  function openEdit(item: FeaturedSpeakerItem) {
    setForm({
      speaker_id: item.speaker.id,
      intro: item.intro,
      tags: [...item.tags],
      is_visible: item.is_visible,
      home_visible: item.home_visible,
      sort_order: item.sort_order,
      start_date: item.start_date ?? '',
      end_date: item.end_date ?? '',
    })
    setSpeakerQuery(item.speaker.name)
    setTagInput('')
    setEditTarget(item)
    setModal('edit')
  }

  function closeModal() {
    setModal(null)
    setEditTarget(null)
    setError(null)
  }

  // ── 저장 ─────────────────────────────────────────────
  async function handleSave() {
    if (!form.speaker_id) { setError('강사를 선택해주세요.'); return }
    if (!form.intro.trim()) { setError('한줄 소개를 입력해주세요.'); return }
    setSaving(true)
    setError(null)
    try {
      const body = {
        ...form,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      }
      if (modal === 'add') {
        await apiFetch('/api/featured-speakers', { method: 'POST', body: JSON.stringify(body) })
      } else if (editTarget) {
        await apiFetch(`/api/featured-speakers/${editTarget.id}`, { method: 'PATCH', body: JSON.stringify(body) })
      }
      await loadItems()
      closeModal()
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  // ── 삭제 ─────────────────────────────────────────────
  async function handleDelete(id: string) {
    try {
      await apiFetch(`/api/featured-speakers/${id}`, { method: 'DELETE' })
      await loadItems()
    } catch {
      setError('삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleteId(null)
    }
  }

  // ── 빠른 토글 ────────────────────────────────────────
  async function toggleField(item: FeaturedSpeakerItem, field: 'is_visible' | 'home_visible') {
    try {
      await apiFetch(`/api/featured-speakers/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ [field]: !item[field] }),
      })
      await loadItems()
    } catch {
      setError('상태 변경 중 오류가 발생했습니다.')
    }
  }

  // ── 태그 추가/삭제 ───────────────────────────────────
  function addTag() {
    const t = tagInput.trim()
    if (t && form.tags.length < 4 && !form.tags.includes(t)) {
      setForm(f => ({ ...f, tags: [...f.tags, t] }))
    }
    setTagInput('')
  }

  // ── 강사 검색 필터 ──────────────────────────────────
  const filteredSpeakers = speakerQuery.length >= 1
    ? speakers
        .filter(s =>
          s.name.includes(speakerQuery) ||
          (s.company ?? '').includes(speakerQuery) ||
          (s.title ?? '').includes(speakerQuery)
        )
        .slice(0, 8)
    : []

  // ── 선택된 강사 ─────────────────────────────────────
  const selectedSpeaker = speakers.find(s => s.id === form.speaker_id) ?? null

  return (
    <div style={{ padding: '32px 28px', maxWidth: '900px' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>⭐ 이달의 강사</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
            홈 메인 및 인사이트 탭에 노출할 강사를 관리합니다.
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{
            padding: '10px 20px', fontSize: '13px', fontWeight: 600,
            background: '#1a1a2e', color: '#fff', border: 'none',
            borderRadius: '8px', cursor: 'pointer',
          }}
        >
          + 강사 추가
        </button>
      </div>

      {/* 에러 */}
      {error && !modal && (
        <div style={{
          padding: '12px 16px', marginBottom: '16px',
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '8px', fontSize: '13px', color: '#dc2626',
        }}>
          {error}
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <p style={{ fontSize: '14px', color: '#9ca3af', textAlign: 'center', padding: '60px 0' }}>
          불러오는 중…
        </p>
      )}

      {/* 목록 */}
      {!loading && items.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 0',
          border: '2px dashed #e5e7eb', borderRadius: '12px',
        }}>
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>등록된 이달의 강사가 없습니다.</p>
          <p style={{ fontSize: '13px', color: '#d1d5db', marginTop: '6px' }}>위의 "강사 추가" 버튼을 눌러 시작하세요.</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item) => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '16px 20px',
              background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: '12px',
            }}>
              {/* 순서 */}
              <span style={{
                fontSize: '12px', fontWeight: 700, color: '#9ca3af',
                width: '24px', flexShrink: 0, textAlign: 'center',
              }}>
                {item.sort_order}
              </span>

              {/* 사진 */}
              <div style={{
                width: '52px', height: '52px', flexShrink: 0,
                borderRadius: '6px', overflow: 'hidden',
                background: '#f3f4f6', position: 'relative',
              }}>
                {item.speaker.photo_url ? (
                  <Image src={item.speaker.photo_url} alt={item.speaker.name} fill style={{ objectFit: 'cover' }} sizes="52px" />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#d1d5db' }}>
                    {item.speaker.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* 정보 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a2e' }}>{item.speaker.name}</span>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {[item.speaker.title, item.speaker.company].filter(Boolean).join(' · ')}
                  </span>
                </div>
                <p style={{
                  fontSize: '12px', color: '#6b7280', marginTop: '4px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {item.intro}
                </p>
                {item.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {item.tags.map(t => (
                      <span key={t} style={{
                        fontSize: '10px', padding: '2px 7px',
                        background: '#f3f4f6', color: '#6b7280',
                        borderRadius: '4px',
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 토글: 노출 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', flexShrink: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', color: '#6b7280' }}>
                  <input
                    type="checkbox"
                    checked={item.is_visible}
                    onChange={() => toggleField(item, 'is_visible')}
                    style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                  />
                  인사이트 노출
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', color: '#6b7280' }}>
                  <input
                    type="checkbox"
                    checked={item.home_visible}
                    onChange={() => toggleField(item, 'home_visible')}
                    style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                  />
                  홈 노출
                </label>
              </div>

              {/* 버튼 */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => openEdit(item)}
                  style={{
                    padding: '7px 14px', fontSize: '12px', fontWeight: 600,
                    background: '#f3f4f6', color: '#374151',
                    border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer',
                  }}
                >
                  수정
                </button>
                <button
                  onClick={() => setDeleteId(item.id)}
                  style={{
                    padding: '7px 14px', fontSize: '12px', fontWeight: 600,
                    background: '#fff', color: '#ef4444',
                    border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer',
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 삭제 확인 다이얼로그 ── */}
      {deleteId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '28px 32px',
            width: '360px', textAlign: 'center',
          }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px' }}>
              삭제하시겠습니까?
            </p>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>
              이달의 강사에서 제거됩니다.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: '10px 24px', fontSize: '13px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', background: '#fff', color: '#374151' }}>
                취소
              </button>
              <button onClick={() => handleDelete(deleteId)} style={{ padding: '10px 24px', fontSize: '13px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: '#ef4444', color: '#fff', fontWeight: 600 }}>
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 추가/수정 모달 ── */}
      {modal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '32px',
            width: '100%', maxWidth: '540px',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '24px' }}>
              {modal === 'add' ? '이달의 강사 추가' : '이달의 강사 수정'}
            </h2>

            {/* 에러 */}
            {error && (
              <div style={{ padding: '10px 14px', marginBottom: '16px', background: '#fef2f2', borderRadius: '8px', fontSize: '13px', color: '#dc2626' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* 강사 선택 */}
              <div>
                <label style={labelStyle}>강사 선택 *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="이름 또는 소속으로 검색"
                    value={speakerQuery}
                    onChange={e => { setSpeakerQuery(e.target.value); if (!e.target.value) setForm(f => ({ ...f, speaker_id: '' })) }}
                    style={inputStyle}
                  />
                  {filteredSpeakers.length > 0 && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                      background: '#fff', border: '1px solid #e5e7eb', borderTop: 'none',
                      borderRadius: '0 0 8px 8px', maxHeight: '200px', overflowY: 'auto',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}>
                      {filteredSpeakers.map(s => (
                        <button
                          key={s.id}
                          onClick={() => { setForm(f => ({ ...f, speaker_id: s.id })); setSpeakerQuery(s.name) }}
                          style={{
                            width: '100%', textAlign: 'left', padding: '10px 14px',
                            border: 'none', background: form.speaker_id === s.id ? '#f0f9ff' : '#fff',
                            cursor: 'pointer', fontSize: '13px', color: '#1a1a2e',
                            borderBottom: '1px solid #f3f4f6',
                          }}
                        >
                          <strong>{s.name}</strong>
                          <span style={{ color: '#9ca3af', marginLeft: '8px', fontSize: '12px' }}>
                            {[s.title, s.company].filter(Boolean).join(' · ')}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedSpeaker && (
                  <p style={{ fontSize: '12px', color: '#059669', marginTop: '6px' }}>
                    ✓ {selectedSpeaker.name} — {[selectedSpeaker.title, selectedSpeaker.company].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>

              {/* 한줄 소개 */}
              <div>
                <label style={labelStyle}>한줄 소개 * <span style={{ fontWeight: 400, color: form.intro.length > INTRO_MAX ? '#ef4444' : '#9ca3af' }}>({form.intro.length}/{INTRO_MAX}자)</span></label>
                <textarea
                  rows={3}
                  placeholder="이 강사만이 줄 수 있는 가치를 한 문장으로"
                  value={form.intro}
                  onChange={e => setForm(f => ({ ...f, intro: e.target.value.slice(0, INTRO_MAX) }))}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                />
              </div>

              {/* 태그 */}
              <div>
                <label style={labelStyle}>태그 (최대 4개)</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="태그 입력 후 Enter 또는 추가"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button onClick={addTag} style={{ padding: '10px 14px', fontSize: '12px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    추가
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {form.tags.map(t => (
                    <span key={t} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '4px 10px', background: '#1a1a2e', color: '#fff',
                      fontSize: '12px', borderRadius: '6px',
                    }}>
                      {t}
                      <button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', opacity: 0.7, padding: 0, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 순서 */}
              <div>
                <label style={labelStyle}>표시 순서</label>
                <input
                  type="number"
                  min={1}
                  value={form.sort_order}
                  onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                  style={{ ...inputStyle, width: '80px' }}
                />
              </div>

              {/* 노출 기간 */}
              <div>
                <label style={labelStyle}>노출 기간 (빈 칸 = 무기한)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                  <span style={{ color: '#9ca3af', fontSize: '13px' }}>~</span>
                  <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                </div>
              </div>

              {/* 노출 여부 */}
              <div style={{ display: 'flex', gap: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                  <input type="checkbox" checked={form.is_visible} onChange={e => setForm(f => ({ ...f, is_visible: e.target.checked }))} style={{ width: '16px', height: '16px' }} />
                  인사이트 페이지 노출
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                  <input type="checkbox" checked={form.home_visible} onChange={e => setForm(f => ({ ...f, home_visible: e.target.checked }))} style={{ width: '16px', height: '16px' }} />
                  홈 메인 노출
                </label>
              </div>
            </div>

            {/* 버튼 */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '28px' }}>
              <button onClick={closeModal} style={{ padding: '11px 24px', fontSize: '13px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', background: '#fff', color: '#374151' }}>
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ padding: '11px 28px', fontSize: '13px', fontWeight: 600, border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', background: '#1a1a2e', color: '#fff', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? '저장 중…' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 600,
  color: '#374151', marginBottom: '6px', letterSpacing: '0.02em',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', fontSize: '13px',
  border: '1px solid #e5e7eb', borderRadius: '8px',
  background: '#fff', color: '#1a1a2e',
  outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
}
