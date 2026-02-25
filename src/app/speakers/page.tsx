import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Speaker } from '@/types'
import SpeakerList from './SpeakerList'

export const metadata: Metadata = {
  title: '강사 소개',
  description: '최선화닷컴의 검증된 전문 강사들을 만나보세요.',
}

async function getSpeakers(): Promise<Speaker[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('speakers')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })
  return (data as Speaker[]) ?? []
}

export default async function SpeakersPage() {
  const speakers = await getSpeakers()

  return (
    <div className="min-h-screen">
      {/* 페이지 헤더 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-[#1a1a2e]">강사 소개</h1>
          <p className="mt-2 text-gray-500 text-sm">
            최선화닷컴이 직접 검증한 전문 강사들을 만나보세요.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SpeakerList speakers={speakers} />
      </div>
    </div>
  )
}
