'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Speaker } from '@/types'

interface Props {
  speakers: Speaker[]
}

export default function HeroSpeakerRoller({ speakers }: Props) {
  const [idx, setIdx] = useState(0)
  const [fading, setFading] = useState(false)

  const advance = useCallback(() => {
    setFading(true)
    setTimeout(() => {
      setIdx((i) => (i + 1) % speakers.length)
      setFading(false)
    }, 300)
  }, [speakers.length])

  useEffect(() => {
    if (speakers.length <= 1) return
    const t = setInterval(advance, 4000)
    return () => clearInterval(t)
  }, [advance, speakers.length])

  if (!speakers.length) return null

  const s = speakers[idx]

  return (
    <>
      <style>{`
        .hero-roller-wrap {
          position: relative;
          width: 100%;
        }
        .hero-roller-card {
          display: block;
          border-radius: 4px;
          overflow: hidden;
          text-decoration: none;
          cursor: pointer;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .hero-roller-card.fade {
          opacity: 0;
          transform: translateY(6px);
        }
        .hero-roller-card:hover .hero-roller-photo img {
          transform: scale(1.04);
        }
        .hero-roller-photo {
          position: relative;
          width: 100%;
          aspect-ratio: 3/4;
          overflow: hidden;
          background: var(--color-surface);
        }
        .hero-roller-photo img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: top center;
          transition: transform 0.5s ease;
        }
        .hero-roller-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px 12px 12px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-top: none;
        }
        .hero-roller-dots {
          display: flex;
          gap: 5px;
          padding-top: 8px;
          justify-content: center;
        }
        .hero-roller-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--color-border);
          border: none; cursor: pointer; padding: 0;
          transition: background 0.2s, transform 0.2s;
        }
        .hero-roller-dot.active {
          background: var(--color-green);
          transform: scale(1.3);
        }
      `}</style>

      <div className="hero-roller-wrap">
        <Link
          href={`/speakers/${s.id}`}
          className={`hero-speaker-card hero-roller-card${fading ? ' fade' : ''}`}
        >
          {/* 사진 */}
          <div className="hero-roller-photo">
            {s.photo_url ? (
              <img
                src={s.photo_url}
                alt={s.name}
              />
            ) : (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-english)', fontSize: '72px',
                color: 'var(--color-border)',
              }}>
                {s.name.charAt(0)}
              </div>
            )}
          </div>

          {/* 정보 */}
          <div className="hero-roller-info hero-speaker-info">
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
              Featured Speaker
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '18px', letterSpacing: '-0.02em', color: 'var(--color-ink)', lineHeight: 1.2 }}>
              {s.name}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 300, color: 'var(--color-subtle)' }}>
              {[s.company, s.title].filter(Boolean).join(' · ')}
            </span>
          </div>
        </Link>

        {/* 인디케이터 도트 */}
        {speakers.length > 1 && (
          <div className="hero-roller-dots">
            {speakers.map((_, i) => (
              <button
                key={i}
                className={`hero-roller-dot${i === idx ? ' active' : ''}`}
                onClick={() => { setFading(true); setTimeout(() => { setIdx(i); setFading(false) }, 300) }}
                aria-label={`강사 ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
