'use client'

import { useState } from 'react'

interface Props {
  speakerId: string
  isFeatured: boolean
  onToggle: (speakerId: string, newValue: boolean) => void
}

export default function ToggleFeatured({ speakerId, isFeatured, onToggle }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleToggle(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    setLoading(true)
    try {
      if (isFeatured) {
        // 에디터 픽 해제
        await fetch(`/api/featured-speakers?speaker_id=${speakerId}`, { method: 'DELETE' })
        onToggle(speakerId, false)
      } else {
        // 에디터 픽 추가 (intro 빈칸으로 — 나중에 상세 편집 가능)
        await fetch('/api/featured-speakers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ speaker_id: speakerId, intro: '', tags: [], is_visible: true, home_visible: false }),
        })
        onToggle(speakerId, true)
      }
    } catch {
      // 무시
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isFeatured ? '에디터 픽 해제' : '에디터 픽 추가'}
      style={{
        background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '18px', opacity: loading ? 0.4 : 1, padding: '2px 4px',
        transition: 'transform 0.15s',
      }}
    >
      {isFeatured ? '⭐' : '☆'}
    </button>
  )
}
