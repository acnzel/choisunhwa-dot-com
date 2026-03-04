'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Speaker } from '@/types'

interface Props {
  speakers: Speaker[]
}

export default function SpeakerCarousel({ speakers }: Props) {
  if (speakers.length === 0) return null

  // 무한 루프를 위해 2배 복제
  const doubled = [...speakers, ...speakers]

  return (
    <>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .carousel-track {
          animation: marquee 30s linear infinite;
          display: flex;
          gap: 24px;
          width: max-content;
        }
        .carousel-wrap:hover .carousel-track {
          animation-play-state: paused;
        }
        .carousel-card {
          width: 200px;
          flex-shrink: 0;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: opacity 0.2s;
        }
        .carousel-card:hover { opacity: 0.75; }
        .carousel-photo {
          width: 200px;
          height: 160px;
          overflow: hidden;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          position: relative;
          flex-shrink: 0;
        }
        .carousel-initial {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-english);
          font-size: 48px; color: var(--color-border);
          user-select: none;
        }
        .carousel-name {
          font-family: var(--font-display);
          font-size: 15px; font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--color-ink);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .carousel-sub {
          font-size: 11px; font-weight: 300;
          color: var(--color-muted);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
      `}</style>

      <div
        className="carousel-wrap"
        style={{ overflow: 'hidden', paddingBottom: '32px' }}
      >
        <div className="carousel-track">
          {doubled.map((speaker, i) => (
            <Link
              key={`${speaker.id}-${i}`}
              href={`/speakers/${speaker.id}`}
              className="carousel-card"
            >
              <div className="carousel-photo">
                {speaker.photo_url ? (
                  <Image
                    src={speaker.photo_url}
                    alt={speaker.name}
                    fill
                    className="object-cover"
                    sizes="200px"
                    draggable={false}
                  />
                ) : (
                  <div className="carousel-initial">
                    {speaker.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <div className="carousel-name">{speaker.name}</div>
                <div className="carousel-sub">
                  {[speaker.company, speaker.title].filter(Boolean).join(' · ')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
