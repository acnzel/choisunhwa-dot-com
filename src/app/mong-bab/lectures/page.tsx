import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import type { Lecture, Speaker } from '@/types'
import { SPEAKER_FIELDS, LECTURE_DURATIONS } from '@/constants'
import LectureFilterTable from './LectureFilterTable'

const FIELD_MAP     = Object.fromEntries(SPEAKER_FIELDS.map((f) => [f.value, f.label]))
const DURATION_MAP  = Object.fromEntries(LECTURE_DURATIONS.map((d) => [d.value, d.label]))

type LectureWithSpeaker = Lecture & { speaker: Pick<Speaker, 'name'> }

async function getLectures(): Promise<LectureWithSpeaker[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('lectures')
    .select('*, speaker:speakers(name)')
    .order('created_at', { ascending: false })
  return (data as LectureWithSpeaker[]) ?? []
}

export default async function AdminLecturesPage() {
  const lectures = await getLectures()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">강연 관리</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            총 {lectures.length}건 (공개: {lectures.filter(l => l.is_visible).length}건)
          </p>
        </div>
        <Link
          href="/mong-bab/lectures/new"
          className="px-4 py-2 bg-[#1a1a2e] text-white text-sm font-medium rounded-xl hover:bg-[#16213e] transition-colors"
        >
          + 강연 등록
        </Link>
      </div>

      <LectureFilterTable lectures={lectures} fieldMap={FIELD_MAP} durationMap={DURATION_MAP} />
    </div>
  )
}
