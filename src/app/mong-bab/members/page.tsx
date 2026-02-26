import { createAdminClient } from '@/lib/supabase/admin'

interface Profile {
  id: string
  name: string
  provider: string
  status: string
  marketing_agreed: boolean
  created_at: string
  last_login_at: string | null
}

async function getMembers(): Promise<Profile[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return (data as Profile[]) ?? []
}

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  unverified: 'bg-yellow-100 text-yellow-700',
}

const STATUS_LABEL: Record<string, string> = {
  active: '활성',
  inactive: '비활성',
  unverified: '미인증',
}

export default async function AdminMembersPage() {
  const members = await getMembers()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">회원 관리</h1>
        <span className="text-sm text-gray-400">총 {members.length}명</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">이름</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">가입 방법</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">마케팅 동의</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">가입일</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">최근 로그인</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    가입된 회원이 없습니다.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{m.name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {m.provider === 'google' ? '구글' : '이메일'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[m.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABEL[m.status] ?? m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {m.marketing_agreed ? '동의' : '미동의'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(m.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {m.last_login_at ? new Date(m.last_login_at).toLocaleDateString('ko-KR') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
