import Link from 'next/link'
import NoticeForm from '../NoticeForm'

export default function NewNoticePage() {
  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/mong-bab/support" className="text-sm text-gray-400 hover:text-gray-600">
          ← FAQ & 공지사항
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-bold text-[#1a1a2e]">새 공지사항 등록</h1>
      </div>
      <NoticeForm />
    </div>
  )
}
