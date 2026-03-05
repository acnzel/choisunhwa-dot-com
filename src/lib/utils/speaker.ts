import type { Speaker, SpeakerMediaLink } from '@/types'

/**
 * DB의 media_links를 정규화.
 * text[] 컬럼에 저장 시 객체가 JSON 문자열로 직렬화됨.
 * - '{"title":"...","url":"..."}' → { title, url }
 * - 'https://...' (plain URL) → { title: url, url }
 * - {title, url} 객체 → 그대로
 */
export function parseMediaLinks(raw: unknown[]): SpeakerMediaLink[] {
  return raw
    .filter(Boolean)
    .map((item): SpeakerMediaLink | null => {
      if (typeof item === 'object' && item !== null) {
        const obj = item as Record<string, unknown>
        if (typeof obj.url === 'string') {
          return { title: typeof obj.title === 'string' ? obj.title : obj.url, url: obj.url }
        }
        return null
      }
      if (typeof item === 'string') {
        const trimmed = item.trim()
        if (trimmed.startsWith('{')) {
          try {
            const parsed = JSON.parse(trimmed) as Record<string, unknown>
            if (typeof parsed.url === 'string') {
              return {
                title: typeof parsed.title === 'string' ? parsed.title : parsed.url,
                url: parsed.url,
              }
            }
          } catch { /* fall through */ }
        }
        // plain URL
        if (trimmed.startsWith('http')) {
          return { title: trimmed, url: trimmed }
        }
      }
      return null
    })
    .filter((m): m is SpeakerMediaLink => m !== null)
}

/** Speaker 레코드의 media_links를 파싱해서 반환 */
export function normalizeSpeaker(speaker: Speaker): Speaker {
  return {
    ...speaker,
    media_links: parseMediaLinks(speaker.media_links as unknown[]),
  }
}
