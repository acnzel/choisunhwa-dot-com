'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ManualTrigger() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleRun() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/cron/trend-briefing', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setResult(`✅ 완료 — 수집 ${data.collected}건 / 저장 ${data.saved}건`)
        router.refresh()
      } else {
        setResult(`❌ 오류: ${data.error ?? '알 수 없음'}`)
      }
    } catch {
      setResult('❌ 네트워크 오류')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleRun}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-gray-600 transition-colors flex items-center gap-2"
      >
        {loading ? (
          <><span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full" />수집 중…</>
        ) : '🤖 수동 수집 실행'}
      </button>
      {result && (
        <p className="text-xs text-gray-500">{result}</p>
      )}
    </div>
  )
}
