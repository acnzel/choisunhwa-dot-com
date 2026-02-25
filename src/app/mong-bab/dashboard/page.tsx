import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

async function getDashboardStats() {
  const supabase = await createClient()

  const [
    { count: totalMembers },
    { count: totalSpeakers },
    { count: totalLectures },
    { count: totalInquiries },
    { count: newInquiries },
    { data: recentInquiries },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('speakers').select('*', { count: 'exact', head: true }),
    supabase.from('lectures').select('*', { count: 'exact', head: true }),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('inquiries').select('id, type, name, company, status, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  return {
    totalMembers: totalMembers ?? 0,
    totalSpeakers: totalSpeakers ?? 0,
    totalLectures: totalLectures ?? 0,
    totalInquiries: totalInquiries ?? 0,
    newInquiries: newInquiries ?? 0,
    recentInquiries: recentInquiries ?? [],
  }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: '신규', color: 'bg-blue-100 text-blue-700' },
  confirmed: { label: '확인', color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: '처리중', color: 'bg-orange-100 text-orange-700' },
  done: { label: '완료', color: 'bg-green-100 text-green-700' },
}

const TYPE_LABELS: Record<string, string> = {
  lecture_plan: '강연기획',
  recruitment: '강사섭외',
  speaker_register: '강사등록',
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const STAT_CARDS = [
    { label: '전체 회원', value: stats.totalMembers, href: '/mong-bab/members', icon: '👥' },
    { label: '등록 강사', value: stats.totalSpeakers, href: '/mong-bab/speakers', icon: '🎤' },
    { label: '강연 커리큘럼', value: stats.totalLectures, href: '/mong-bab/lectures', icon: '📋' },
    { label: '신규 문의', value: stats.newInquiries, href: '/mong-bab/inquiries', icon: '💬', highlight: stats.newInquiries > 0 },
  ]

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-[#1a1a2e] mb-6">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, href, icon, highlight }) => (
          <Link
            key={label}
            href={href}
            className={`bg-white rounded-2xl p-5 border hover:shadow-sm transition-shadow ${highlight ? 'border-blue-200 bg-blue-50' : 'border-gray-100'}`}
          >
            <p className="text-xl mb-1">{icon}</p>
            <p className={`text-3xl font-bold ${highlight ? 'text-blue-700' : 'text-[#1a1a2e]'}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* 최근 문의 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#1a1a2e]">최근 문의</h2>
          <Link href="/mong-bab/inquiries" className="text-xs text-gray-400 hover:text-[#1a1a2e]">
            전체 보기 →
          </Link>
        </div>
        {stats.recentInquiries.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">접수된 문의가 없습니다.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {stats.recentInquiries.map((inquiry) => (
              <Link
                key={inquiry.id}
                href={`/mong-bab/inquiries/${inquiry.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {TYPE_LABELS[inquiry.type] ?? inquiry.type}
                  </span>
                  <span className="text-sm text-gray-700">
                    {inquiry.name}
                    {inquiry.company ? ` · ${inquiry.company}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_LABELS[inquiry.status]?.color ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[inquiry.status]?.label ?? inquiry.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(inquiry.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
