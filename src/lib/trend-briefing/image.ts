interface PexelsPhoto {
  src: { large: string }
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[]
}

export async function fetchArticleImage(query: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) {
    console.error('PEXELS_API_KEY 미설정')
    return null
  }

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1`
    const res = await fetch(url, { headers: { Authorization: apiKey } })
    if (!res.ok) {
      console.error('Pexels 검색 실패:', res.status)
      return null
    }

    const data = (await res.json()) as PexelsSearchResponse
    return data.photos[0]?.src.large ?? null
  } catch (err) {
    console.error('Pexels 요청 오류:', err)
    return null
  }
}
