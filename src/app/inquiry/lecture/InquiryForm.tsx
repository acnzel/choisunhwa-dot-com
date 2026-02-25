'use client'

// TODO: @frontend_cshdotcom_bot 가 구현 예정
// 강연기획/강사섭외 문의 폼 컴포넌트

interface Props {
  defaultSpeaker?: string
  defaultLecture?: string
}

export default function InquiryForm({ defaultSpeaker, defaultLecture }: Props) {
  return (
    <div className="text-gray-400 text-sm py-10 text-center">
      문의 폼 준비 중... ({defaultSpeaker} / {defaultLecture})
    </div>
  )
}
