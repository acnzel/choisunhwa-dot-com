import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Speaker } from '@/types'
import SpeakerEditForm from './SpeakerEditForm'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

async function getSpeaker(id: string): Promise<Speaker | null> {
  const supabase = createAdminClient()
  const { data } = await supabase.from('speakers').select('*').eq('id', id).single()
  return (data as Speaker) ?? null
}

export default async function AdminSpeakerDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { saved } = await searchParams
  const speaker = await getSpeaker(id)
  if (!speaker) notFound()

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/mong-bab/speakers" className="text-sm text-gray-400 hover:text-gray-600">
          ← 강사 목록
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-bold text-[#1a1a2e]">{speaker.name} 편집</h1>
      </div>

      {saved && (
        <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
          ✅ 저장되었습니다.
        </div>
      )}

      <SpeakerEditForm speaker={speaker} />
    </div>
  )
}
