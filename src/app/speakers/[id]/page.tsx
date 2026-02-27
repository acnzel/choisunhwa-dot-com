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
    title: `${speaker.name} — ${speaker.title} | 최선화닷컴`,
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

  // 약력 / 학력 분리 ([학력] 접두어 기준)
  type Career = { year: string; content: string }
  const allCareers = (speaker.careers as Career[]) ?? []
  const careers = allCareers.filter((c) => !c.content.startsWith('[학력]'))
  const education = allCareers
    .filter((c) => c.content.startsWith('[학력]'))
    .map((c) => ({ ...c, content: c.content.replace(/^\[학력\]\s*/, '') }))

  // 저서 = news_links 배열
  const books = (speaker.news_links ?? []).filter(Boolean)

  // 참고영상 = media_links (JSON "{title,url}" 또는 plain URL 둘 다 지원)
  type MediaItem = { title: string; url: string }
  const mediaLinks: MediaItem[] = (speaker.media_links ?? [])
    .filter(Boolean)
    .map((item) => {
      try {
        const parsed = JSON.parse(item)
        if (parsed.url) return { title: parsed.title ?? parsed.url, url: parsed.url }
      } catch { /* plain URL */ }
      return { title: item, url: item }
    })

  const hasContent = {
    bio: !!speaker.bio_full?.trim(),
    careers: careers.length > 0,
    education: education.length > 0,
    books: books.length > 0,
    media: mediaLinks.length > 0,

    lectures: lectures.length > 0,
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">

      {/* ── 히어로 헤더 ────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row gap-8 items-start">

            {/* 프로필 사진 */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
              {speaker.photo_url ? (
                <Image
                  src={speaker.photo_url}
                  alt={speaker.name}
                  fill
                  className="object-cover"
                  sizes="144px"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                  <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* 기본 정보 */}
            <div className="flex-1 min-w-0">
              {/* 분야 태그 */}
              {speaker.fields.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {speaker.fields.map((f) => (
                    <span key={f} className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                      {FIELD_MAP[f] ?? f}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] tracking-tight">{speaker.name}</h1>
              <p className="text-gray-500 mt-1.5 text-sm">
                {[speaker.title, speaker.company].filter(Boolean).join(' · ')}
              </p>

              {speaker.bio_short && (
                <p className="text-gray-600 mt-3 text-sm leading-relaxed max-w-xl">{speaker.bio_short}</p>
              )}

              {/* CTA */}
              <div className="flex flex-wrap gap-3 mt-5">
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

      {/* ── 본문 ────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">

            {/* 강사 소개 */}
            {hasContent.bio && (
              <Section title="강사 소개">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{speaker.bio_full}</p>
              </Section>
            )}

            {/* 약력 */}
            {hasContent.careers && (
              <Section title="약력">
                <ul className="space-y-3">
                  {careers.map((career, idx) => (
                    <li key={idx} className="flex gap-3 text-sm">
                      {career.year && (
                        <span className="text-gray-400 font-medium whitespace-nowrap w-14 flex-shrink-0">{career.year}</span>
                      )}
                      <span className="text-gray-700 leading-relaxed">{career.content}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* 학력 */}
            {hasContent.education && (
              <Section title="학력">
                <ul className="space-y-3">
                  {education.map((edu, idx) => (
                    <li key={idx} className="flex gap-3 text-sm">
                      {edu.year && (
                        <span className="text-gray-400 font-medium whitespace-nowrap w-14 flex-shrink-0">{edu.year}</span>
                      )}
                      <span className="text-gray-700 leading-relaxed">{edu.content}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* 저서 */}
            {hasContent.books && (
              <Section title="저서">
                <ul className="space-y-2">
                  {books.map((book, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-gray-300 mt-0.5 flex-shrink-0">📖</span>
                      <span>{book}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* 참고영상 */}
            {hasContent.media && (
              <Section title="참고영상">
                <div className="space-y-2">
                  {mediaLinks.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm group"
                    >
                      <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </span>
                      <span className="text-gray-700 group-hover:text-blue-600 group-hover:underline transition-colors">{item.title}</span>
                    </a>
                  ))}
                </div>
              </Section>
            )}

            {/* 커리큘럼 */}
            {hasContent.lectures && (
              <div>
                <h2 className="text-lg font-bold text-[#1a1a2e] mb-4">보유 커리큘럼</h2>
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
                      <h3 className="font-semibold text-[#1a1a2e] group-hover:text-blue-800 transition-colors text-sm leading-snug">
                        {lecture.title}
                      </h3>
                      {lecture.summary && (
                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{lecture.summary}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── 사이드바 ──────────────────────────── */}
          <div className="space-y-4 lg:mt-0">
            <div className="sticky top-20 space-y-4">
              {/* 문의 카드 */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-[#1a1a2e] text-sm mb-1">{speaker.name} 강사 섭외</h3>
                <p className="text-xs text-gray-400 mb-4">문의 후 1~2 영업일 내 연락드립니다.</p>
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
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">강연 분야</h3>
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
    </div>
  )
}

// ── 섹션 래퍼 컴포넌트 ─────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <h2 className="text-base font-bold text-[#1a1a2e] mb-4 pb-3 border-b border-gray-50">{title}</h2>
      {children}
    </div>
  )
}
