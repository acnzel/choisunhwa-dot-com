import Link from 'next/link'
import NewSpeakerForm from './NewSpeakerForm'

export default function NewSpeakerPage() {
  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/mong-bab/speakers" className="text-sm text-gray-400 hover:text-gray-600">
          ← 강사 목록
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-bold text-[#1a1a2e]">새 강사 등록</h1>
      </div>
      <NewSpeakerForm />
    </div>
  )
}
