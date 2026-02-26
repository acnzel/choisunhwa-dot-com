import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import Image from 'next/image'
import type { Speaker } from '@/types'
import { SPEAKER_FIELDS } from '@/constants'

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
        <h1 className="text-2xl font-bold text-[#1a1a2e]">강사 관리</h1>
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
              <th className="text-left px-4 py-3 font-medium text-gray-500">공개 여부</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">노출 순서</th>
              <th className="px-4 py-3" />
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
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {s.photo_url ? (
                          <Image src={s.photo_url} alt={s.name} fill className="object-cover" sizes="36px" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">?</div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.title}</p>
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
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.is_visible ? '공개' : '비공개'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{s.sort_order}</td>
                  <td className="px-4 py-3">
                    <Link href={`/mong-bab/speakers/${s.id}`} className="text-xs text-[#1a1a2e] hover:underline">
                      수정
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
