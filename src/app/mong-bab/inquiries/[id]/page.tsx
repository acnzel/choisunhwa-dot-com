import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Inquiry, InquiryMemo } from '@/types'
import { INQUIRY_TYPES, INQUIRY_STATUSES } from '@/constants'
import InquiryDetail from './InquiryDetail'

interface Props {
  params: Promise<{ id: string }>
}

async function getInquiry(id: string): Promise<(Inquiry & { memos: InquiryMemo[] }) | null> {
  const supabase = createAdminClient()
  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !inquiry) return null

  const { data: memos } = await supabase
    .from('inquiry_memos')
    .select('*')
    .eq('inquiry_id', id)
    .order('created_at', { ascending: true })

  return { ...(inquiry as Inquiry), memos: (memos as InquiryMemo[]) ?? [] }
}

export default async function InquiryDetailPage({ params }: Props) {
  const { id } = await params
  const inquiry = await getInquiry(id)
  if (!inquiry) notFound()

  const typeMap = Object.fromEntries(INQUIRY_TYPES.map((t) => [t.value, t.label]))
  const statusMap = Object.fromEntries(INQUIRY_STATUSES.map((s) => [s.value, s.label]))

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/mong-bab/inquiries" className="text-sm text-gray-400 hover:text-gray-600">
          ← 문의 목록
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-bold text-[#1a1a2e]">문의 상세</h1>
      </div>

      {/* 기본 정보 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
            {typeMap[inquiry.type] ?? inquiry.type}
          </span>
          <span className="text-xs text-gray-400">
            {inquiry.created_at ? new Date(inquiry.created_at).toLocaleString('ko-KR') : '-'}
          </span>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="grid grid-cols-3 gap-2">
            <dt className="text-gray-400">이름</dt>
            <dd className="col-span-2 font-medium text-gray-800">{inquiry.name}</dd>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <dt className="text-gray-400">소속</dt>
            <dd className="col-span-2 text-gray-700">{inquiry.company || '-'}</dd>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <dt className="text-gray-400">연락처</dt>
            <dd className="col-span-2 text-gray-700">{inquiry.phone}</dd>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <dt className="text-gray-400">이메일</dt>
            <dd className="col-span-2 text-gray-700">{inquiry.email}</dd>
          </div>
          {inquiry.desired_speaker && (
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-400">희망 강사</dt>
              <dd className="col-span-2 text-gray-700">{inquiry.desired_speaker}</dd>
            </div>
          )}
          {inquiry.lecture_date && (
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-400">강연 일정</dt>
              <dd className="col-span-2 text-gray-700">{inquiry.lecture_date}</dd>
            </div>
          )}
          {inquiry.attendee_count != null && (
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-400">참석 인원</dt>
              <dd className="col-span-2 text-gray-700">{inquiry.attendee_count}명</dd>
            </div>
          )}
          {inquiry.venue && (
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-400">장소</dt>
              <dd className="col-span-2 text-gray-700">{inquiry.venue}</dd>
            </div>
          )}
          {inquiry.budget_range && (
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-400">예산</dt>
              <dd className="col-span-2 text-gray-700">{inquiry.budget_range}</dd>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-50">
            <dt className="text-gray-400">문의 내용</dt>
            <dd className="col-span-2 text-gray-700 whitespace-pre-line">{inquiry.content}</dd>
          </div>
        </dl>
      </div>

      {/* 상태 변경 + 메모 (클라이언트) */}
      <InquiryDetail
        inquiryId={inquiry.id}
        currentStatus={inquiry.status}
        memos={inquiry.memos}
        statusMap={statusMap}
      />
    </div>
  )
}
