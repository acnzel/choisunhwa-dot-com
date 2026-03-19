import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import type { Speaker } from '@/types'
import { SPEAKER_FIELDS } from '@/constants'
import SpeakerFilterTable from './SpeakerFilterTable'

export const dynamic = 'force-dynamic'

const FIELD_MAP = Object.fromEntries(SPEAKER_FIELDS.map((f) => [f.value, f.label]))

async function getSpeakers(): Promise<Speaker[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('speakers')
    .select('id, name, title, company, photo_url, fields, is_visible, is_best, is_trending, sort_order')
    .order('sort_order', { ascending: true })
  return (data as Speaker[]) ?? []
}

export default async function AdminSpeakersPage() {
  const speakers = await getSpeakers()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">강사 관리</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            총 {speakers.length}명 (공개: {speakers.filter(s => s.is_visible).length}명)
          </p>
        </div>
        <Link
          href="/mong-bab/speakers/new"
          className="px-4 py-2 bg-[#1a1a2e] text-white text-sm font-medium rounded-xl hover:bg-[#16213e] transition-colors"
        >
          + 강사 등록
        </Link>
      </div>

      <SpeakerFilterTable speakers={speakers} fieldMap={FIELD_MAP} />
    </div>
  )
}
