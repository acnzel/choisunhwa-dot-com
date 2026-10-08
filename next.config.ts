import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ahcrxdegumqfdwvafhvc.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google 프로필 이미지
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // 트렌드 브리핑 썸네일
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com', // 외부 이미지 소스
      },
    ],
  },
  async redirects() {
    return [
      // 강연 매거진 → 강연 인사이트 (영구 리다이렉트). /insights 를 거치지 않고 최종 목적지로 한 번에 보낸다.
      { source: '/lectures', destination: '/insights/issue', permanent: true },
      { source: '/insights', destination: '/insights/issue', permanent: true },
      // "이 강사 어때요?" 탭 삭제 → 에디터 픽
      { source: '/insights/pick', destination: '/insights/featured', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/mong-bab/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ]
  },
}

export default nextConfig
