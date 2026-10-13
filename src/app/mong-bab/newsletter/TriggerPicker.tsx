'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Article {
  id: string
  title: string
  summary: string | null
  source_name: string | null
  created_at: string
  meta: { tags?: string[] } | null
}

interface Season {
  key: string
  title: string
  description: string
}

type Trigger = { trigger_type: 'article'; insight_id: string } | { trigger_type: 'season'; season_key: string }

export default function TriggerPicker({ articles, seasons }: { articles: Article[]; seasons: Season[] }) {
  const router = useRouter()
  const [running, setRunning] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function generate(key: string, trigger: Trigger) {
    setRunning(key)
    setError('')
    try {
      const res = await fetch('/api/mong-bab/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trigger),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? `생성 실패 (${res.status})`)
        return
      }
      router.push(`/mong-bab/newsletter/${data.id}`)
    } finally {
      setRunning(null)
    }
  }

  const button = (key: string, trigger: Trigger) => (
    <button
      onClick={() => generate(key, trigger)}
      disabled={running !== null}
      className="shrink-0 px-3 py-1.5 text-xs font-medium bg-[#1a1a2e] text-white rounded-lg hover:bg-[#16213e] disabled:opacity-40"
    >
      {running === key ? '만드는 중… (최대 1분)' : '초안 만들기'}
    </button>
  )

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3 whitespace-pre-line">{error}</p>}

      {seasons.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">이번 달 계절 이슈</h2>
          <ul className="space-y-2">
            {seasons.map(s => (
              <li key={s.key} className="flex items-start justify-between gap-3 p-4 bg-white border border-gray-100 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-[#1a1a2e]">{s.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
                </div>
                {button(`season-${s.key}`, { trigger_type: 'season', season_key: s.key })}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">최근 14일 수집 기사 ({articles.length})</h2>
        {articles.length === 0 ? (
          <p className="text-sm text-gray-400">최근 수집된 기사가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {articles.map(a => (
              <li key={a.id} className="flex items-start justify-between gap-3 p-4 bg-white border border-gray-100 rounded-xl">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1a1a2e]">{a.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.summary}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {a.source_name} · {new Date(a.created_at).toLocaleDateString('ko-KR')}
                    {a.meta?.tags?.length ? ` · ${a.meta.tags.join(', ')}` : ''}
                  </p>
                </div>
                {button(`article-${a.id}`, { trigger_type: 'article', insight_id: a.id })}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
