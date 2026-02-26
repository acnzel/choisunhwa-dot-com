import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Speaker, Lecture } from '@/types'
import { SPEAKER_FIELDS } from '@/constants'
import ShareButton from './ShareButton'

const FIELD_MAP: Record<string, string> = Object.fromEntries(
  SPEAKER_FIELDS.map((f) => [f.value, f.label])
)

interface Props {
  params: Promise<{ id: string }>
}

async function getSpeaker(id: string): Promise<Speaker | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('speakers')
    .select('*')
    .eq('id', id)
    .eq('is_visible', true)
    .single()
  return (data as Speaker) ?? null
}

async function getSpeakerLectures(speakerId: string): Promise<Lecture[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lectures')
    .select('*')
    .eq('speaker_id', speakerId)
    .eq('is_visible', true)
  return (data as Lecture[]) ?? []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const speaker = await getSpeaker(id)
  if (!speaker) return { title: '강사를 찾을 수 없습니다' }
  return {
    title: `${speaker.name} — ${speaker.title}`,
    description: speaker.bio_short,
    openGraph: {
      title: `${speaker.name} | 최선화닷컴`,
      description: speaker.bio_short,
      images: speaker.photo_url ? [speaker.photo_url] : [],
    },
  }
}

export default async function SpeakerDetailPage({ params }: Props) {
  const { id } = await params
  const [speaker, lectures] = await Promise.all([
    getSpeaker(id),
    getSpeakerLectures(id),
  ])

  if (!speaker) notFound()

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* 헤더 히어로 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* 사진 */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
              {speaker.photo_url ? (
                <Image
                  src={speaker.photo_url}
                  alt={speaker.name}
                  fill
                  className="object-cover"
                  sizes="160px"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-200">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* 기본 정보 */}
            <div className="flex-1">
              {/* 분야 태그 */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {speaker.fields.map((f) => (
                  <span key={f} className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                    {FIELD_MAP[f] ?? f}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl font-bold text-[#1a1a2e]">{speaker.name}</h1>
              <p className="text-gray-500 mt-1">
                {speaker.title}{speaker.company ? ` · ${speaker.company}` : ''}
              </p>
              <p className="text-gray-600 mt-3 text-sm leading-relaxed max-w-lg">{speaker.bio_short}</p>

              {/* CTA */}
              <div className="flex gap-3 mt-5">
                <Link
                  href={`/inquiry/lecture?speaker=${encodeURIComponent(speaker.name)}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1a2e] text-white text-sm font-semibold rounded-full hover:bg-[#16213e] transition-colors"
                >
                  강사 섭외 문의
                </Link>
                <ShareButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 상세 소개 */}
            {speaker.bio_full && (
              <section className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-[#1a1a2e] mb-4">강사 소개</h2>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {speaker.bio_full}
                </div>
              </section>
            )}

            {/* 약력 */}
            {speaker.careers && speaker.careers.length > 0 && (
              <section className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-[#1a1a2e] mb-5">약력</h2>
                <ol className="relative border-l border-gray-200 space-y-4 ml-2">
                  {speaker.careers.map((career, idx) => (
                    <li key={idx} className="ml-5">
                      <span className="absolute -left-2 w-4 h-4 rounded-full bg-[#1a1a2e] border-2 border-white mt-0.5" />
                      <time className="text-xs font-semibold text-gray-400">{career.year}</time>
                      <p className="text-sm text-gray-700 mt-0.5">{career.content}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* 주요 강연 이력 */}
            {speaker.lecture_histories && speaker.lecture_histories.length > 0 && (
              <section className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-[#1a1a2e] mb-4">주요 강연 이력</h2>
                <div className="flex flex-wrap gap-3">
                  {speaker.lecture_histories.map((h, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                      {h.logo_url && (
                        <Image src={h.logo_url} alt={h.org_name} width={20} height={20} className="rounded" />
                      )}
                      <span className="text-sm text-gray-700">{h.org_name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 미디어 */}
            {speaker.media_links && speaker.media_links.length > 0 && (
              <section className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-[#1a1a2e] mb-4">미디어</h2>
                <div className="space-y-3">
                  {speaker.media_links.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
                      </svg>
                      YouTube 영상 {idx + 1}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* 커리큘럼 */}
            {lectures.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-[#1a1a2e] mb-5">보유 커리큘럼</h2>
                <div className="space-y-3">
                  {lectures.map((lecture) => (
                    <Link
                      key={lecture.id}
                      href={`/lectures/${lecture.id}`}
                      className="group block bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex flex-wrap gap-1 mb-2">
                        {lecture.fields.slice(0, 2).map((f) => (
                          <span key={f} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                            {FIELD_MAP[f] ?? f}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-semibold text-[#1a1a2e] group-hover:text-blue-800 transition-colors">
                        {lecture.title}
                      </h3>
                      <div className="flex gap-3 mt-1.5 text-xs text-gray-500">
                        <span>{lecture.duration === '1h' ? '1시간' : lecture.duration === '2h' ? '2시간' : lecture.duration === 'half_day' ? '반일' : '하루'}</span>
                        {lecture.target && <span>· {lecture.target}</span>}
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{lecture.summary}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-4">
            {/* 문의 카드 */}
            <div className="sticky top-20 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-[#1a1a2e] mb-1">{speaker.name} 강사 섭외</h3>
              <p className="text-xs text-gray-500 mb-4">문의 후 1~2 영업일 내 연락드립니다.</p>
              <Link
                href={`/inquiry/lecture?speaker=${encodeURIComponent(speaker.name)}`}
                className="block w-full text-center py-2.5 bg-[#1a1a2e] text-white text-sm font-semibold rounded-xl hover:bg-[#16213e] transition-colors"
              >
                섭외 문의하기
              </Link>
            </div>

            {/* 분야 */}
            {speaker.fields.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">강연 분야</h3>
                <div className="flex flex-wrap gap-1.5">
                  {speaker.fields.map((f) => (
                    <span key={f} className="text-xs px-2.5 py-1 bg-gray-50 text-gray-600 rounded-full border border-gray-100">
                      {FIELD_MAP[f] ?? f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
