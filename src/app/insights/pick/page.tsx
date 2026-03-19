import { redirect } from 'next/navigation'

// "이 강사 어때요?" 탭 삭제 → 에디터 추천 강사로 리다이렉트
export default function PickRedirectPage() {
  redirect('/insights/featured')
}
