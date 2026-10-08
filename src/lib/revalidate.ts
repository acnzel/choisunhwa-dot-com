import { revalidatePath } from 'next/cache'

// 공개 페이지는 하루 단위로 캐시한다(각 page.tsx 의 `revalidate = 86400`).
// 관리자 화면에서 공개 데이터를 바꾸면 이 함수로 전체 캐시를 무효화해 바로 반영한다.
// 무효화된 페이지는 다음 요청 때 한 번만 다시 만들어진다.

export function revalidatePublicPages() {
  revalidatePath('/', 'layout')
}
