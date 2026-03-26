'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface PendingItem {
  id: string
  title: string
  summary: string
  content_html: string
  source_name: string
  source_url: string
  created_at: string
  meta: { tags?: string[] }
}

interface Props {
  items: PendingItem[]
}

export default function PendingList({ items: initial }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(initial)
  const [preview, setPreview] = useState<PendingItem | null>(null)
  const [isPending, startTransition] = useTransition()
  const [processing, setProcessing] = useState<string | null>(null)

  async function handlePublish(id: string) {
    setProcessing(id)
    try {
      const res = await fetch(`/api/mong-bab/trend-briefing/${id}`, { method: 'PATCH' })
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id))
        startTransition(() => router.refresh())
      } else {
        alert('게시 실패')
      }
    } finally {
      setProcessing(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('삭제하시겠습니까?')) return
    setProcessing(id)
    try {
      const res = await fetch(`/api/mong-bab/trend-briefing/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id))
      } else {
        alert('삭제 실패')
      }
    } finally {
      setProcessing(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg font-medium">대기 중인 트렌드 브리핑이 없습니다.</p>
        <p className="text-sm mt-2">매일 오전 10시에 자동 수집됩니다.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {items.map((item) => {
          const tags = item.meta?.tags ?? []
          const isProcessing = processing === item.id || isPending
          const date = new Date(item.created_at).toLocaleString('ko-KR', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })

          return (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start gap-4">
                {/* 콘텐츠 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {item.source_name}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{date} 수집</span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-base leading-snug mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3">
                    {item.summary}
                  </p>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map(tag => (
                        <span key={tag}
                          className="text-xs px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => setPreview(item)}
                    className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600"
                  >
                    미리보기
                  </button>
                  <button
                    onClick={() => handlePublish(item.id)}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm font-bold bg-[#1D4229] text-white rounded-xl hover:bg-[#163520] disabled:opacity-50 transition-colors"
                  >
                    {processing === item.id ? '처리 중…' : '✅ 게시'}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm font-medium text-red-500 border border-red-100 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    🗑 삭제
                  </button>
                </div>
              </div>

              {/* 원문 링크 */}
              <div className="mt-3 pt-3 border-t border-gray-50">
                <a href={item.source_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline truncate block max-w-xs">
                  원문 보기 →
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {/* 미리보기 모달 */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-base">{preview.title}</h2>
              <button onClick={() => setPreview(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                ✕
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                {preview.summary}
              </p>
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: preview.content_html }}
              />
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 rounded-b-2xl border-t border-gray-100">
              <button
                onClick={() => { handlePublish(preview.id); setPreview(null) }}
                className="flex-1 py-2.5 bg-[#1D4229] text-white font-bold rounded-xl text-sm hover:bg-[#163520] transition-colors"
              >
                ✅ 게시하기
              </button>
              <button
                onClick={() => setPreview(null)}
                className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-100 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
