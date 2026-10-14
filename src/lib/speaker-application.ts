// 강사 신청서 → 강사(speakers) 행 변환. 승인된 강사는 어드민이 한 번 더 검수한 뒤 공개한다.

export interface SpeakerApplicationRow {
  name: string
  title?: string | null
  company?: string | null
  fields?: string[] | null
  bio_short?: string | null
  bio_full?: string | null
  lecture_topics?: string | null
  career?: string | null
  education?: string | null
  photo_url?: string | null
  youtube_url?: string | null
  fee_range?: string | null
}

export function applicationToSpeaker(app: SpeakerApplicationRow) {
  // career 는 자유 입력이라 줄 단위로 나눠 경력 항목으로 옮기고, 연도는 검수 때 채운다
  const careers = (app.career ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((content) => ({ year: '', content }))

  return {
    name: app.name,
    // speakers 의 텍스트 컬럼은 NOT NULL DEFAULT '' 라 null 대신 빈 문자열을 넣는다
    title: app.title ?? '',
    company: app.company ?? '',
    bio_short: app.bio_short ?? '',
    bio_full: app.bio_full ?? '',
    fields: app.fields ?? [],
    photo_url: app.photo_url || null,
    fee_range: app.fee_range || null,
    education: app.education || null,
    lecture_topics: app.lecture_topics || null,
    careers,
    // 어드민 강사 폼과 같은 {title, url} 형태 (src/app/actions/admin.ts)
    media_links: app.youtube_url ? [{ title: '영상', url: app.youtube_url }] : [],
    is_visible: false,
    is_best: false,
    is_trending: false,
  }
}
