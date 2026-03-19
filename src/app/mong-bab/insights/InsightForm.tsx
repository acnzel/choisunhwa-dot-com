'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { Insight, InsightType } from '@/types'

// Tiptap은 SSR 불가 → dynamic import
const TiptapEditor = dynamic(
  () => import('@/components/editor/TiptapEditor'),
  { ssr: false, loading: () => <div style={{ padding: 16, color: '#9ca3af' }}>에디터 로딩 중...</div> }
)

interface Props {
  insight?: Partial<Insight>
  mode: 'new' | 'edit'
}

const TYPE_OPTIONS = [
  { value: 'issue',  label: '트렌드 브리핑' },
  { value: 'report', label: '강연 현장' },
  { value: 'pick',   label: '에디터 추천 강사' },
] as const

export default function InsightForm({ insight, mode }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [thumbnailUploading, setThumbnailUploading] = useState(false)

  const [form, setForm] = useState({
    type: (insight?.type ?? 'issue') as InsightType,
    title: insight?.title ?? '',
    summary: insight?.summary ?? '',
    thumbnail_url: insight?.thumbnail_url ?? '',
    status: insight?.status ?? 'draft',
    home_featured: insight?.home_featured ?? false,
    scheduled_at: insight?.scheduled_at ?? '',
    content_json: insight?.content_json ?? null,
    content_html: insight?.content_html ?? '',
    meta: insight?.meta ?? {},
  })

  const set = (key: string, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleThumbnailUpload = useCallback(async (file: File) => {
    setThumbnailUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('bucket', 'insights')
      fd.append('width', '1200')
      fd.append('crop', '16:9')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('업로드 실패')
      const { url } = await res.json()
      set('thumbnail_url', url)
    } catch (e) {
      alert('썸네일 업로드 실패: ' + (e as Error).message)
    } finally {
      setThumbnailUploading(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { alert('제목을 입력하세요'); return }
    setSaving(true)
    try {
      const url = mode === 'new' ? '/api/insights' : `/api/insights/${insight?.id}`
      const method = mode === 'new' ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? '저장 실패')
      }
      router.push('/mong-bab/insights')
      router.refresh()
    } catch (e) {
      alert('저장 실패: ' + (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0',
    borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block',
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

        {/* 메인 영역 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* 콘텐츠 유형 */}
          <div>
            <label style={labelStyle}>콘텐츠 유형 *</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {TYPE_OPTIONS.map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio" name="type" value={opt.value}
                    checked={form.type === opt.value}
                    onChange={e => set('type', e.target.value)}
                  />
                  <span style={{ fontSize: 13 }}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label style={labelStyle}>제목 *</label>
            <input
              style={inputStyle} value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="제목을 입력하세요"
              required
            />
          </div>

          {/* 요약 */}
          <div>
            <label style={labelStyle}>요약 (SEO 메타 설명)</label>
            <textarea
              style={{ ...inputStyle, height: 72, resize: 'vertical' }}
              value={form.summary}
              onChange={e => set('summary', e.target.value)}
              placeholder="검색 결과나 SNS 미리보기에 표시되는 한 줄 요약"
            />
          </div>

          {/* 본문 에디터 */}
          <div>
            <label style={labelStyle}>본문</label>
            <TiptapEditor
              content={form.content_json as object}
              onChange={(json, html) => { set('content_json', json); set('content_html', html) }}
              placeholder="내용을 입력하세요..."
            />
          </div>
        </div>

        {/* 사이드바 — 발행 설정 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* 발행 액션 */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>발행 설정</p>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>발행 상태</label>
              <select
                style={inputStyle} value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                <option value="draft">임시저장</option>
                <option value="pending">발행 대기</option>
                <option value="published">발행</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>예약 발행 일시</label>
              <input
                type="datetime-local" style={inputStyle}
                value={form.scheduled_at?.replace('Z', '') ?? ''}
                onChange={e => set('scheduled_at', e.target.value ? new Date(e.target.value).toISOString() : '')}
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox" checked={form.home_featured}
                onChange={e => set('home_featured', e.target.checked)}
              />
              <span style={{ fontSize: 13 }}>홈 화면 노출</span>
            </label>
          </div>

          {/* 썸네일 */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>썸네일 이미지</p>
            {form.thumbnail_url && (
              <img
                src={form.thumbnail_url} alt="썸네일"
                style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 6, marginBottom: 10 }}
              />
            )}
            <label style={{
              display: 'block', textAlign: 'center', padding: '10px',
              border: '2px dashed #d1d5db', borderRadius: 6, cursor: 'pointer',
              fontSize: 12, color: '#6b7280',
            }}>
              {thumbnailUploading ? '업로드 중...' : '이미지 선택 (16:9 자동 크롭)'}
              <input
                type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) handleThumbnailUpload(f)
                }}
                disabled={thumbnailUploading}
              />
            </label>
            <input
              style={{ ...inputStyle, marginTop: 8 }}
              value={form.thumbnail_url}
              onChange={e => set('thumbnail_url', e.target.value)}
              placeholder="또는 이미지 URL 직접 입력"
            />
          </div>

          {/* 저장 버튼 */}
          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%', padding: '12px', borderRadius: 8,
              background: saving ? '#9ca3af' : '#1a1a2e',
              color: '#fff', fontWeight: 700, fontSize: 14,
              border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? '저장 중...' : mode === 'new' ? '등록하기' : '수정 완료'}
          </button>

          {mode === 'edit' && insight?.id && (
            <button
              type="button"
              onClick={async () => {
                if (!confirm('삭제하시겠습니까?')) return
                const res = await fetch(`/api/insights/${insight.id}`, { method: 'DELETE' })
                if (res.ok) { router.push('/mong-bab/insights'); router.refresh() }
                else alert('삭제 실패')
              }}
              style={{
                width: '100%', padding: '10px', borderRadius: 8,
                background: 'transparent', color: '#ef4444',
                border: '1px solid #ef4444', fontSize: 13, cursor: 'pointer',
              }}
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
