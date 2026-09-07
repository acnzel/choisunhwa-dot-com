interface PexelsPhoto {
  id: number
  src: { large: string }
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[]
}

// 이미지 URL에서 Pexels 사진 id를 뽑아낸다 (dedup 체크용).
// 형식: https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?...
export function extractPexelsId(url: string): string | null {
  return url.match(/\/photos\/(\d+)\//)?.[1] ?? null
}

// excludeIds에 있는 사진(최근에 이미 쓴 것)은 건너뛰고 다음 순위 후보를 쓴다.
// 검색어가 비슷한 주제일수록 Pexels가 항상 같은 1등 사진을 반환하는
// 경향이 있어, 후보를 여러 장 받아 중복을 피하기 위함.
export async function fetchArticleImage(
  query: string,
  excludeIds: Set<string> = new Set(),
): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) {
    console.error('PEXELS_API_KEY 미설정')
    return null
  }

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=10`
    const res = await fetch(url, { headers: { Authorization: apiKey }, signal: AbortSignal.timeout(10_000) })
    if (!res.ok) {
      console.error('Pexels 검색 실패:', res.status)
      return null
    }

    const data = (await res.json()) as PexelsSearchResponse
    if (data.photos.length === 0) return null

    const fresh = data.photos.find(p => !excludeIds.has(String(p.id)))
    // 후보 10장이 전부 최근에 쓴 사진이면(드묾) 그냥 1등을 재사용한다 —
    // 이미지 없는 것보다 낫다.
    return (fresh ?? data.photos[0]).src.large
  } catch (err) {
    console.error('Pexels 요청 오류:', err)
    return null
  }
}
