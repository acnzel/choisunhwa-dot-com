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
    ],
  },
  async redirects() {
    return [
      // 강연 매거진 → 강연 인사이트 (영구 리다이렉트)
      { source: '/lectures', destination: '/insights', permanent: true },
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
