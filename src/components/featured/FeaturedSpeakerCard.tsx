import Link from 'next/link'
import Image from 'next/image'
import type { FeaturedSpeakerItem } from '@/types'

interface Props {
  item: FeaturedSpeakerItem
}

export default function FeaturedSpeakerCard({ item }: Props) {
  const { speaker } = item
  const subText = [speaker.title, speaker.company].filter(Boolean).join(' · ')

  return (
    <Link
      href={`/speakers/${speaker.id}`}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: '20px',
        padding: '28px 0',
        textDecoration: 'none',
        color: 'inherit',
        borderBottom: '1px solid var(--color-border)',
        transition: 'opacity 0.2s',
      }}
      className="featured-card"
    >
      <style>{`
        .featured-card:hover { opacity: 0.82; }
        .featured-card:hover .featured-photo img { transform: scale(1.04); }
      `}</style>

      {/* 사진 */}
      <div className="featured-photo" style={{
        position: 'relative',
        width: '110px', height: '110px',
        flexShrink: 0,
        background: 'var(--color-surface)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        {speaker.photo_url ? (
          <Image
            src={speaker.photo_url}
            alt={speaker.name}
            fill
            style={{ objectFit: 'cover', objectPosition: 'top center', transition: 'transform 0.4s ease' }}
            sizes="110px"
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-english)', fontSize: '48px',
            color: 'var(--color-border)',
          }}>
            {speaker.name.charAt(0)}
          </div>
        )}
      </div>

      {/* 텍스트 영역 */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* 이름 */}
        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 'clamp(18px, 2vw, 22px)',
          letterSpacing: '-0.02em', lineHeight: 1.1,
          color: 'var(--color-ink)',
        }}>
          {speaker.name}
        </h3>

        {/* 소속 · 직함 */}
        {subText && (
          <p style={{
            fontSize: '13px', fontWeight: 300,
            color: 'var(--color-subtle)', lineHeight: 1.4,
          }}>
            {subText}
          </p>
        )}

        {/* 한줄 소개 */}
        {item.intro && (
          <p style={{
            fontSize: '13px', fontWeight: 400,
            color: 'var(--color-ink)', lineHeight: 1.65,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            marginTop: '2px',
          }}>
            {item.intro}
          </p>
        )}

        {/* 태그 */}
        {item.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '4px' }}>
            {item.tags.slice(0, 4).map((tag) => (
              <span key={tag} style={{
                fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.05em',
                padding: '3px 8px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-subtle)',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
