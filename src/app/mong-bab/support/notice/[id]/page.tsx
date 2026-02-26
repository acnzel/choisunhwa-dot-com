import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Notice } from '@/types'
import NoticeForm from '../NoticeForm'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

export default async function EditNoticePage({ params, searchParams }: Props) {
  const { id } = await params
  const { saved } = await searchParams

  const supabase = createAdminClient()
  const { data } = await supabase.from('notices').select('*').eq('id', id).single()
  const notice = data as Notice | null
  if (!notice) notFound()

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/mong-bab/support" className="text-sm text-gray-400 hover:text-gray-600">
          ← FAQ & 공지사항
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-bold text-[#1a1a2e]">공지사항 편집</h1>
      </div>

      {saved && (
        <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
          ✅ 저장되었습니다.
        </div>
      )}

      <NoticeForm notice={notice} />
    </div>
  )
}
