import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import Image from 'next/image'
import type { Speaker } from '@/types'
import { SPEAKER_FIELDS } from '@/constants'
import ToggleVisible from './ToggleVisible'
import ClickableRow from '@/components/admin/ClickableRow'

export const dynamic = 'force-dynamic'

const FIELD_MAP = Object.fromEntries(SPEAKER_FIELDS.map((f) => [f.value, f.label]))

async function getSpeakers(): Promise<Speaker[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('speakers')
    .select('*')
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
          <p className="text-sm text-gray-400 mt-0.5">총 {speakers.length}명 (공개: {speakers.filter(s => s.is_visible).length}명)</p>
        </div>
        <Link
          href="/mong-bab/speakers/new"
          className="px-4 py-2 bg-[#1a1a2e] text-white text-sm font-medium rounded-xl hover:bg-[#16213e] transition-colors"
        >
          + 강사 등록
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">강사</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">분야</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 w-20">공개</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 w-20">순서</th>
              <th className="px-4 py-3 w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {speakers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  등록된 강사가 없습니다.
                </td>
              </tr>
            ) : (
              speakers.map((s) => (
                <ClickableRow key={s.id} href={`/mong-bab/speakers/${s.id}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {s.photo_url ? (
                          <Image src={s.photo_url} alt={s.name} fill className="object-cover" sizes="36px" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs font-bold">
                            {s.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.title}{s.company ? ` · ${s.company}` : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.fields.slice(0, 2).map((f) => (
                        <span key={f} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                          {FIELD_MAP[f] ?? f}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ToggleVisible speakerId={s.id} isVisible={s.is_visible} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-center">{s.sort_order}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-[#1a1a2e]">→ 편집</span>
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
