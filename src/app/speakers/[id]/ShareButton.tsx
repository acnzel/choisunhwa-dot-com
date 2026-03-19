'use client'

import { useState } from 'react'

export default function ShareButton() {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href

    // ── Web Share API: 모바일에서 기본 공유 시트 열기 ──
    if (navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      try {
        await navigator.share({ url })
        return
      } catch {
        // 취소 또는 실패 → clipboard로 폴백
      }
    }

    // ── Clipboard API ──
    try {
      await navigator.clipboard.writeText(url)
      showCopied()
      return
    } catch {
      // 권한 없거나 미지원 → execCommand 폴백
    }

    // ── Legacy fallback (IE/구형 브라우저) ──
    try {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      showCopied()
    } catch {
      // 모두 실패 시 prompt로라도 보여주기
      window.prompt('URL을 복사하세요', url)
    }
  }

  function showCopied() {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 16px',
        border: copied ? '1px solid #2C6B5A' : '1px solid #e5e7eb',
        borderRadius: 999,
        background: copied ? '#f0faf6' : 'transparent',
        color: copied ? '#2C6B5A' : '#555',
        fontSize: 14, fontWeight: 500,
        cursor: 'pointer',
        transition: 'all .2s',
        fontFamily: 'var(--font-body)',
        whiteSpace: 'nowrap',
      }}
      aria-label="URL 복사"
    >
      {copied ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          복사됨!
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          공유
        </>
      )}
    </button>
  )
}
