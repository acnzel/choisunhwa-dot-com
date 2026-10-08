import { ImageResponse } from 'next/og'

// 사이트 기본 공유 이미지 (1200×630). 전용 이미지가 없는 페이지의 og:image 로 쓰인다.
// 기본 폰트에 한글 글리프가 없어 영문만 사용한다.
export const runtime = 'edge'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '72px 80px',
          background: '#F7F3EE', color: '#1C1712',
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: '0.18em', color: '#9B968F' }}>CHOISUNHWA.COM</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            Speakers &amp; Lectures,
          </div>
          <div style={{ fontSize: 88, fontWeight: 400, lineHeight: 1.05, color: '#9B4A35', letterSpacing: '-0.03em' }}>
            designed for your organization.
          </div>
        </div>
        <div style={{ display: 'flex', width: '100%', height: 2, background: '#1C1712' }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' },
    },
  )
}
