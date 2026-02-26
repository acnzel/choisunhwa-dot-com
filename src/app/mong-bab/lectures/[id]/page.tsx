import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Lecture, Speaker } from '@/types'
import LectureEditForm from './LectureEditForm'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

type LectureWithSpeaker = Lecture & { speaker: Pick<Speaker, 'name'> | null }

async function getLecture(id: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('lectures')
    .select('*, speaker:speakers(name)')
    .eq('id', id)
    .single()
  return data as LectureWithSpeaker | null
}

async function getSpeakers() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('speakers')
    .select('id, name')
    .order('sort_order', { ascending: true })
  return (data as Pick<Speaker, 'id' | 'name'>[]) ?? []
}

export default async function AdminLectureDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { saved } = await searchParams
  const [lecture, speakers] = await Promise.all([getLecture(id), getSpeakers()])
  if (!lecture) notFound()

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/mong-bab/lectures" className="text-sm text-gray-400 hover:text-gray-600">
          ← 강연 목록
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-bold text-[#1a1a2e] line-clamp-1">{lecture.title}</h1>
      </div>

      {saved && (
        <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
          ✅ 저장되었습니다.
        </div>
      )}

      <LectureEditForm lecture={lecture} speakers={speakers} />
    </div>
  )
}
