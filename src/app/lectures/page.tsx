import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Lecture, Speaker } from '@/types'
import LectureList from './LectureList'

export const metadata: Metadata = {
  title: '강연 매거진',
  description: '최선화닷컴이 엄선한 강연 매거진 — 에디터 픽부터 현장 리포트까지.',
}

type LectureWithSpeaker = Lecture & { speaker: Pick<Speaker, 'id' | 'name' | 'title'> }

async function getLectures(): Promise<LectureWithSpeaker[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lectures')
    .select('*, speaker:speakers(id, name, title)')
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
  return (data as LectureWithSpeaker[]) ?? []
}

export default async function LecturesPage() {
  const lectures = await getLectures()

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-[#1a1a2e]">강연 매거진</h1>
          <p className="mt-2 text-gray-500 text-sm">
            기업이 선택하는 검증된 강연 프로그램을 찾아보세요.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <LectureList lectures={lectures} />
      </div>
    </div>
  )
}
