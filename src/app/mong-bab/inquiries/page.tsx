import { createAdminClient } from '@/lib/supabase/admin'
import type { Inquiry } from '@/types'
import { INQUIRY_STATUSES, INQUIRY_TYPES } from '@/constants'
import ClickableRow from '@/components/admin/ClickableRow'

const STATUS_COLOR: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-orange-100 text-orange-700',
  done: 'bg-green-100 text-green-700',
}

async function getInquiries(): Promise<Inquiry[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })
  return (data as Inquiry[]) ?? []
}

export default async function AdminInquiriesPage() {
  const inquiries = await getInquiries()

  const typeMap = Object.fromEntries(INQUIRY_TYPES.map((t) => [t.value, t.label]))
  const statusMap = Object.fromEntries(INQUIRY_STATUSES.map((s) => [s.value, s.label]))

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">문의 관리</h1>
        <span className="text-sm text-gray-400">총 {inquiries.length}건</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">유형</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">이름</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">소속</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">연락처</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">접수일</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    접수된 문의가 없습니다.
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => (
                  <ClickableRow key={inquiry.id} href={`/mong-bab/inquiries/${inquiry.id}`}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {typeMap[inquiry.type] ?? inquiry.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{inquiry.name}</td>
                    <td className="px-4 py-3 text-gray-500">{inquiry.company}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{inquiry.phone}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[inquiry.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {statusMap[inquiry.status] ?? inquiry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                      {inquiry.created_at ? new Date(inquiry.created_at).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#1a1a2e]">→ 상세</span>
                    </td>
                  </ClickableRow>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
