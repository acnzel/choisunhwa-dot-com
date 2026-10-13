import AdminSidebar from './AdminSidebar'
import { createAdminClient } from '@/lib/supabase/admin'
import { PENDING_BRIEFING } from '@/lib/trend-briefing/pending'

// 관리자 화면은 항상 최신 데이터를 보여야 한다. 쿠키를 읽지 않는 admin 클라이언트만 쓰는 페이지는
// Next.js 가 빌드 시점에 정적으로 고정하므로(문의 목록 상태가 갱신되지 않던 원인) 하위 전체를 동적 렌더링한다.
export const dynamic = 'force-dynamic'

// 사이드바 트렌드 브리핑 메뉴에 붙일 검수 대기 건수. 조회에 실패하면 숫자만 숨긴다.
async function getPendingBriefingCount(): Promise<number | null> {
  const { count, error } = await createAdminClient()
    .from('insights')
    .select('id', { count: 'exact', head: true })
    .match(PENDING_BRIEFING)
  return error ? null : count
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pendingBriefingCount = await getPendingBriefingCount()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar badges={{ pendingBriefing: pendingBriefingCount }} />
      {/* 모바일: 상단 헤더 바(h-14) 만큼 padding-top; 데스크탑: 없음 */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}
