import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Speaker } from '@/types'
import NewLectureForm from './NewLectureForm'

async function getSpeakers(): Promise<Pick<Speaker, 'id' | 'name'>[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('speakers')
    .select('id, name')
    .order('sort_order', { ascending: true })
  return (data as Pick<Speaker, 'id' | 'name'>[]) ?? []
}

export default async function NewLecturePage() {
  const speakers = await getSpeakers()

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/mong-bab/lectures" className="text-sm text-gray-400 hover:text-gray-600">
          ← 강연 목록
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-bold text-[#1a1a2e]">새 강연 등록</h1>
      </div>
      <NewLectureForm speakers={speakers} />
    </div>
  )
}
