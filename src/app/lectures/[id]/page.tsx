import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Lecture, Speaker } from '@/types'
import { SPEAKER_FIELDS, LECTURE_DURATIONS } from '@/constants'

const FIELD_MAP: Record<string, string> = Object.fromEntries(
  SPEAKER_FIELDS.map((f) => [f.value, f.label])
)
const DURATION_MAP: Record<string, string> = Object.fromEntries(
  LECTURE_DURATIONS.map((d) => [d.value, d.label])
)

type LectureWithSpeaker = Lecture & { speaker: Speaker }

interface Props {
  params: Promise<{ id: string }>
}

async function getLecture(id: string): Promise<LectureWithSpeaker | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lectures')
    .select('*, speaker:speakers(*)')
    .eq('id', id)
    .eq('is_visible', true)
    .single()
  return (data as LectureWithSpeaker) ?? null
}

async function getRelatedLectures(lectureId: string, fields: string[]): Promise<Lecture[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lectures')
    .select('*')
    .eq('is_visible', true)
    .neq('id', lectureId)
    .overlaps('fields', fields)
    .limit(4)
  return (data as Lecture[]) ?? []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const lecture = await getLecture(id)
  if (!lecture) return { title: '강연을 찾을 수 없습니다' }
  return {
    title: lecture.title,
    description: lecture.summary,
    openGraph: {
      title: `${lecture.title} | 최선화닷컴`,
      description: lecture.summary,
      images: lecture.thumbnail_url ? [lecture.thumbnail_url] : [],
    },
  }
}

export default async function LectureDetailPage({ params }: Props) {
  const { id } = await params
  const lecture = await getLecture(id)
  if (!lecture) notFound()

  const related = await getRelatedLectures(id, lecture.fields)

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {lecture.fields.map((f) => (
              <span key={f} className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                {FIELD_MAP[f] ?? f}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-[#1a1a2e] leading-tight">{lecture.title}</h1>
              <div className="flex gap-4 mt-3 text-sm text-gray-500">
                <span>{DURATION_MAP[lecture.duration] ?? lecture.duration}</span>
                {lecture.target && <span>· 대상: {lecture.target}</span>}
              </div>
              {lecture.speaker && (
                <Link href={`/speakers/${lecture.speaker.id}`} className="flex items-center gap-2 mt-4 group">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-100">
                    {lecture.speaker.photo_url ? (
                      <Image src={lecture.speaker.photo_url} alt={lecture.speaker.name} fill className="object-cover" sizes="36px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1a1a2e] group-hover:underline">{lecture.speaker.name}</p>
                    <p className="text-xs text-gray-400">{lecture.speaker.title}</p>
                  </div>
                </Link>
              )}
            </div>
            <div>
              <Link
                href={`/inquiry/lecture?lecture=${encodeURIComponent(lecture.title)}&speaker=${encodeURIComponent(lecture.speaker?.name ?? '')}`}
                className="block w-full text-center py-3 bg-[#1a1a2e] text-white text-sm font-semibold rounded-xl hover:bg-[#16213e] transition-colors"
              >
                이 강연 문의하기
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 강연 개요 */}
            <section className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-[#1a1a2e] mb-3">강연 개요</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{lecture.summary}</p>
            </section>

            {/* 강연 목표 */}
            {lecture.goals && lecture.goals.length > 0 && (
              <section className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-[#1a1a2e] mb-4">강연 목표</h2>
                <ul className="space-y-2">
                  {lecture.goals.map((goal, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1a1a2e] text-white text-xs flex items-center justify-center mt-0.5 font-bold">
                        {idx + 1}
                      </span>
                      {goal}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 프로그램 구성 */}
            {lecture.program && lecture.program.length > 0 && (
              <section className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-[#1a1a2e] mb-4">프로그램 구성</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 pr-4 text-gray-400 font-medium w-24">시간</th>
                        <th className="text-left py-2 text-gray-400 font-medium">내용</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lecture.program.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-50 last:border-0">
                          <td className="py-3 pr-4 text-gray-500 font-medium align-top">{item.time}</td>
                          <td className="py-3 text-gray-700">{item.content}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* 기대 효과 */}
            {lecture.effects && lecture.effects.length > 0 && (
              <section className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-[#1a1a2e] mb-4">기대 효과</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lecture.effects.map((effect, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-blue-50 rounded-xl">
                      <span className="text-blue-500 flex-shrink-0">✓</span>
                      <p className="text-sm text-blue-800">{effect}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 강사 소개 (간략) */}
            {lecture.speaker && (
              <section className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-[#1a1a2e] mb-4">담당 강사</h2>
                <div className="flex gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {lecture.speaker.photo_url ? (
                      <Image src={lecture.speaker.photo_url} alt={lecture.speaker.name} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-200">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1a1a2e]">{lecture.speaker.name}</h3>
                    <p className="text-xs text-gray-500">{lecture.speaker.title}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{lecture.speaker.bio_short}</p>
                    <Link
                      href={`/speakers/${lecture.speaker.id}`}
                      className="inline-block mt-2 text-xs text-[#1a1a2e] hover:underline"
                    >
                      강사 프로필 더보기 →
                    </Link>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-4">
            <div className="sticky top-20">
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-[#1a1a2e] mb-1">이 강연이 궁금하다면?</h3>
                <p className="text-xs text-gray-500 mb-4">담당자가 1~2 영업일 내 연락드립니다.</p>
                <Link
                  href={`/inquiry/lecture?lecture=${encodeURIComponent(lecture.title)}&speaker=${encodeURIComponent(lecture.speaker?.name ?? '')}`}
                  className="block w-full text-center py-2.5 bg-[#1a1a2e] text-white text-sm font-semibold rounded-xl hover:bg-[#16213e] transition-colors mb-2"
                >
                  강연 문의하기
                </Link>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• 강연 시간: {DURATION_MAP[lecture.duration] ?? lecture.duration}</p>
                  {lecture.target && <p>• 대상: {lecture.target}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 관련 강연 */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-[#1a1a2e] mb-5">관련 강연</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/lectures/${r.id}`}
                  className="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-shadow"
                >
                  <div className="flex flex-wrap gap-1 mb-2">
                    {r.fields.slice(0, 1).map((f) => (
                      <span key={f} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                        {FIELD_MAP[f] ?? f}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-sm font-semibold text-[#1a1a2e] group-hover:text-blue-800 line-clamp-2 transition-colors">
                    {r.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
