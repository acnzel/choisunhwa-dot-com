import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import type { Lecture, Speaker } from '@/types'
import { SPEAKER_FIELDS, LECTURE_DURATIONS } from '@/constants'
import ClickableRow from '@/components/admin/ClickableRow'

const FIELD_MAP = Object.fromEntries(SPEAKER_FIELDS.map((f) => [f.value, f.label]))
const DURATION_MAP = Object.fromEntries(LECTURE_DURATIONS.map((d) => [d.value, d.label]))

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
        <h1 className="text-2xl font-bold text-[#1a1a2e]">강연 관리</h1>
        <Link
          href="/mong-bab/lectures/new"
          className="px-4 py-2 bg-[#1a1a2e] text-white text-sm font-medium rounded-xl hover:bg-[#16213e] transition-colors"
        >
          + 강연 등록
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">강연명</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">강사</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">분야</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">시간</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">공개</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {lectures.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  등록된 강연이 없습니다.
                </td>
              </tr>
            ) : (
              lectures.map((l) => (
                <ClickableRow key={l.id} href={`/mong-bab/lectures/${l.id}`}>
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-xs">
                    <p className="line-clamp-1">{l.title}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{l.speaker?.name ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {l.fields.slice(0, 2).map((f) => (
                        <span key={f} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                          {FIELD_MAP[f] ?? f}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{DURATION_MAP[l.duration] ?? l.duration}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${l.is_visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {l.is_visible ? '공개' : '비공개'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#1a1a2e]">→ 편집</span>
                  </td>
                </ClickableRow>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
