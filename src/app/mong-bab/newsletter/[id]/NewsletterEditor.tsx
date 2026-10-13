'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { NewsletterContent } from '@/lib/newsletter/generate'
import { renderHtml, renderText } from '@/lib/newsletter/render'

interface Props {
  id: string
  initialContent: NewsletterContent
  initialComment: string
  siteUrl: string
}

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e] bg-white'

export default function NewsletterEditor({ id, initialContent, initialComment, siteUrl }: Props) {
  const router = useRouter()
  const [content, setContent] = useState(initialContent)
  const [comment, setComment] = useState(initialComment)
  const [savedComment, setSavedComment] = useState(initialComment)
  const [dirty, setDirty] = useState(false)
  const [status, setStatus] = useState('')

  const set = <K extends keyof NewsletterContent>(key: K, value: NewsletterContent[K]) => {
    setContent(prev => ({ ...prev, [key]: value }))
    setDirty(true)
  }
  const setModule = (i: number, key: 'theme' | 'connection', value: string) => {
    setContent(prev => ({ ...prev, modules: prev.modules.map((m, j) => (j === i ? { ...m, [key]: value } : m)) }))
    setDirty(true)
  }

  async function save() {
    setStatus('저장 중…')
    const res = await fetch(`/api/mong-bab/newsletter/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, comment }),
    })
    if (res.ok) {
      setDirty(false)
      setSavedComment(comment)
      setStatus('저장했습니다.')
    } else {
      setStatus('저장 실패')
    }
  }

  async function remove() {
    if (!confirm('이 초안을 삭제할까요?')) return
    const res = await fetch(`/api/mong-bab/newsletter/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/mong-bab/newsletter')
    else setStatus('삭제 실패')
  }

  // 내보내기는 한 마디가 저장된 뒤에만 연다. 저장 안 된 수정본이 나가는 것을 막는다.
  const canExport = savedComment.trim() !== '' && !dirty

  async function copy(kind: 'html' | 'text') {
    if (kind === 'html') {
      const html = renderHtml(content, comment, siteUrl, id)
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([renderText(content, comment, siteUrl, id)], { type: 'text/plain' }),
        }),
      ])
      setStatus('메일용으로 복사했습니다. 메일 본문에 붙여 넣으세요.')
    } else {
      await navigator.clipboard.writeText(renderText(content, comment, siteUrl, id))
      setStatus('텍스트로 복사했습니다.')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
      <div className="space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-gray-600">메일 제목</span>
          <input className={inputClass} value={content.subject} onChange={e => set('subject', e.target.value)} />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-600">이슈 요약 (한 줄에 하나)</span>
          <textarea
            className={`${inputClass} resize-y`}
            rows={3}
            value={content.issue_summary.join('\n')}
            onChange={e => set('issue_summary', e.target.value.split('\n'))}
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-600">왜 지금인가</span>
          <textarea className={`${inputClass} resize-y`} rows={3} value={content.why_now} onChange={e => set('why_now', e.target.value)} />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <label className="block sm:col-span-3">
            <span className="text-xs font-medium text-gray-600">프로그램 이름</span>
            <input className={inputClass} value={content.program_title} onChange={e => set('program_title', e.target.value)} />
          </label>
          <label className="block sm:col-span-1">
            <span className="text-xs font-medium text-gray-600">대상</span>
            <input className={inputClass} value={content.target} onChange={e => set('target', e.target.value)} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-gray-600">형식</span>
            <input className={inputClass} value={content.format} onChange={e => set('format', e.target.value)} />
          </label>
        </div>

        {content.modules.map((m, i) => (
          <div key={m.part} className="p-3 border border-gray-100 rounded-xl bg-gray-50 space-y-2">
            <p className="text-xs text-gray-500">
              {m.part}부 · <span className="font-medium text-[#1a1a2e]">{m.lecture_title}</span> — {m.speaker_name}
            </p>
            <input className={inputClass} value={m.theme} onChange={e => setModule(i, 'theme', e.target.value)} placeholder="이 부의 주제" />
            <textarea
              className={`${inputClass} resize-y`}
              rows={2}
              value={m.connection}
              onChange={e => setModule(i, 'connection', e.target.value)}
              placeholder="이 강의가 이슈에 맞는 이유"
            />
          </div>
        ))}
        <p className="text-xs text-gray-400">강사와 강의 제목은 실제 강의 목록에서 검증한 값이라 여기서 바꾸지 않습니다. 바꾸려면 초안을 다시 만드세요.</p>

        <label className="block">
          <span className="text-xs font-medium text-gray-600">최선화의 한 마디 * (직접 작성, 저장해야 내보낼 수 있습니다)</span>
          <textarea
            className={`${inputClass} resize-y`}
            rows={4}
            value={comment}
            onChange={e => { setComment(e.target.value); setDirty(true) }}
            placeholder="이 프로그램을 왜 추천하는지, 현장에서 본 것을 적어 주세요."
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={save} disabled={!dirty} className="px-4 py-2 text-sm font-medium bg-[#1a1a2e] text-white rounded-xl disabled:opacity-40">저장</button>
          <button onClick={() => copy('html')} disabled={!canExport} className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl disabled:opacity-40">메일용 복사</button>
          <button onClick={() => copy('text')} disabled={!canExport} className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl disabled:opacity-40">텍스트 복사</button>
          <button onClick={remove} className="ml-auto px-3 py-2 text-xs text-gray-400 hover:text-red-500">삭제</button>
        </div>
        {status && <p className="text-xs text-gray-500" role="status">{status}</p>}
      </div>

      <div>
        <p className="text-xs font-medium text-gray-600 mb-2">미리보기</p>
        <div className="p-5 bg-white border border-gray-100 rounded-xl">
          <p className="text-base font-bold text-[#1a1a2e] mb-3">{content.subject}</p>
          <div dangerouslySetInnerHTML={{ __html: renderHtml(content, comment || '(아직 작성하지 않았습니다)', siteUrl, id) }} />
        </div>
      </div>
    </div>
  )
}
