// SEO / 구조화 데이터 공통 상수·헬퍼
// 도메인 변경 시 NEXT_PUBLIC_SITE_URL 만 바꾸면 canonical·sitemap·JSON-LD 가 함께 따라간다.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://choisunhwa-dot-com.vercel.app').replace(/\/$/, '')
export const SITE_NAME = '최선화닷컴'
export const SITE_DESCRIPTION =
  '최선화닷컴은 검증된 강사와 기업을 연결하는 강연 기획 전문 플랫폼입니다. AI 매칭 기반의 정확한 강사 섭외, 강연 기획부터 사후 관리까지 원스톱으로.'
export const CONTACT_EMAIL = 'contact@choisunhwa.com'

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export const DEFAULT_OG_IMAGE = '/og'
export const RSS_PATH = '/feed.xml'

interface PageMetaInput {
  title?: string
  description?: string
  /** canonical 경로. 쿼리스트링 포함 가능 */
  path: string
  images?: (string | null | undefined)[]
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string | null
  modifiedTime?: string | null
}

/**
 * 페이지별 Metadata 생성.
 * Next.js 는 openGraph·alternates 를 얕게 병합하므로(자식이 정의하면 부모 값이 통째로 사라짐)
 * siteName·locale·기본 이미지·RSS 링크를 매 페이지에서 다시 채운다.
 */
export function pageMeta({ title, description, path, images, type = 'website', publishedTime, modifiedTime }: PageMetaInput) {
  const ogImages = (images ?? []).filter((v): v is string => !!v)
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: {
      canonical: path,
      types: { 'application/rss+xml': RSS_PATH },
    },
    openGraph: {
      type,
      locale: 'ko_KR',
      siteName: SITE_NAME,
      url: path,
      // title·description 은 비워두면 Next.js 가 템플릿 적용된 페이지 title 로 채운다
      images: ogImages.length > 0 ? ogImages : [DEFAULT_OG_IMAGE],
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
      ...(type === 'article' && modifiedTime ? { modifiedTime } : {}),
    },
  }
}

/** 로그인·검색 결과·개인 현황처럼 색인할 필요 없는 페이지 */
export const NOINDEX = { robots: { index: false, follow: true } }

/** HTML 태그 제거 + 공백 정리 (JSON-LD·RSS 설명문용) */
export function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

export const organizationJsonLd = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: 'CHOISUNHWA.COM',
  url: SITE_URL,
  email: CONTACT_EMAIL,
  description: SITE_DESCRIPTION,
  areaServed: 'KR',
  knowsAbout: ['강연 기획', '강사 섭외', '기업 교육', '특강', '세미나'],
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
