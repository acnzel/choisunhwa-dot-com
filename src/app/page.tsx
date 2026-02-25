import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Speaker, Lecture } from '@/types'
import { SPEAKER_FIELDS } from '@/constants'

async function getFeaturedSpeakers(): Promise<Speaker[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('speakers')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })
    .limit(4)
  return (data as Speaker[]) ?? []
}

async function getFeaturedLectures(): Promise<(Lecture & { speaker: Pick<Speaker, 'name' | 'title'> })[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lectures')
    .select('*, speaker:speakers(name, title)')
    .eq('is_visible', true)
    .limit(4)
  return (data as (Lecture & { speaker: Pick<Speaker, 'name' | 'title'> })[]) ?? []
}

const VALUES = [
  {
    icon: '🎯',
    title: '정확한 매칭',
    desc: '기업의 목적과 대상에 맞는 강사를 정확하게 연결합니다.',
  },
  {
    icon: '✅',
    title: '검증된 강사진',
    desc: '직접 검증한 전문 강사들과 실제 강연 이력을 투명하게 공개합니다.',
  },
  {
    icon: '📊',
    title: '성과 중심',
    desc: '강연 후 피드백과 성과 데이터로 지속적인 품질을 보장합니다.',
  },
]

const FIELD_MAP: Record<string, string> = Object.fromEntries(
  SPEAKER_FIELDS.map((f) => [f.value, f.label])
)

export default async function HomePage() {
  const [speakers, lectures] = await Promise.all([
    getFeaturedSpeakers(),
    getFeaturedLectures(),
  ])

  return (
    <div>
      {/* 히어로 섹션 */}
      <section className="relative bg-[#1a1a2e] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] opacity-90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-blue-300 tracking-widest uppercase mb-4">
              강연 기획의 새로운 기준
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              올바른 강사와의<br />
              <span className="text-blue-300">정확한 연결</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-xl">
              최선화닷컴은 기업과 검증된 강사를 연결하는 강연 기획 전문 플랫폼입니다.
              강연 기획부터 강사 섭외, 사후 관리까지 원스톱으로 제공합니다.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/speakers"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#1a1a2e] font-semibold rounded-full hover:bg-gray-100 transition-colors text-sm"
              >
                강사 찾아보기 →
              </Link>
              <Link
                href="/inquiry"
                className="inline-flex items-center justify-center px-6 py-3 border border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-colors text-sm"
              >
                강연 문의하기
              </Link>
            </div>
          </div>
        </div>
        {/* 데코 */}
        <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block opacity-10">
          <div className="w-full h-full bg-gradient-to-l from-blue-400 to-transparent" />
        </div>
      </section>

      {/* 핵심 가치 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">
              왜 최선화닷컴인가요?
            </h2>
            <p className="mt-3 text-gray-500 text-sm">
              단순 소개를 넘어, 교육 효과를 설계합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map(({ icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <span className="text-3xl">{icon}</span>
                <h3 className="mt-4 text-lg font-semibold text-[#1a1a2e]">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 주요 강사 */}
      <section className="py-20 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">주요 강사</h2>
              <p className="mt-2 text-sm text-gray-500">검증된 전문가들을 만나보세요</p>
            </div>
            <Link href="/speakers" className="text-sm text-gray-500 hover:text-[#1a1a2e] transition-colors hidden sm:block">
              전체 보기 →
            </Link>
          </div>

          {speakers.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">등록된 강사가 없습니다.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {speakers.map((speaker) => (
                <Link
                  key={speaker.id}
                  href={`/speakers/${speaker.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[4/3] bg-gray-100">
                    {speaker.photo_url ? (
                      <Image
                        src={speaker.photo_url}
                        alt={speaker.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {speaker.fields.slice(0, 2).map((f) => (
                        <span key={f} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                          {FIELD_MAP[f] ?? f}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-semibold text-[#1a1a2e] group-hover:text-blue-800 transition-colors">
                      {speaker.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{speaker.title}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{speaker.bio_short}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link href="/speakers" className="text-sm text-gray-500 hover:text-[#1a1a2e] transition-colors">
              전체 강사 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* 추천 강연 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">추천 강연</h2>
              <p className="mt-2 text-sm text-gray-500">기업이 선택하는 검증된 커리큘럼</p>
            </div>
            <Link href="/lectures" className="text-sm text-gray-500 hover:text-[#1a1a2e] transition-colors hidden sm:block">
              전체 보기 →
            </Link>
          </div>

          {lectures.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">등록된 강연이 없습니다.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {lectures.map((lecture) => (
                <Link
                  key={lecture.id}
                  href={`/lectures/${lecture.id}`}
                  className="group flex gap-4 p-5 bg-[#fafafa] rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                    {lecture.thumbnail_url ? (
                      <Image
                        src={lecture.thumbnail_url}
                        alt={lecture.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {lecture.fields.slice(0, 2).map((f) => (
                        <span key={f} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                          {FIELD_MAP[f] ?? f}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-semibold text-[#1a1a2e] group-hover:text-blue-800 transition-colors line-clamp-1">
                      {lecture.title}
                    </h3>
                    {lecture.speaker && (
                      <p className="text-xs text-gray-500 mt-0.5">{lecture.speaker.name}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{lecture.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 문의 CTA */}
      <section className="py-20 bg-[#1a1a2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            어떤 강연이 필요하신가요?
          </h2>
          <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-lg mx-auto">
            강연 주제, 대상, 예산을 알려주시면
            맞춤 강사를 1~2 영업일 내에 제안해드립니다.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/inquiry/lecture"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#1a1a2e] font-semibold rounded-full hover:bg-gray-100 transition-colors text-sm"
            >
              강연 기획 문의 →
            </Link>
            <Link
              href="/inquiry/register"
              className="inline-flex items-center justify-center px-6 py-3 border border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-colors text-sm"
            >
              강사 등록 문의
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
