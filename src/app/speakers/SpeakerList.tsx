'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Speaker } from '@/types'
import { SPEAKER_FIELDS } from '@/constants'

interface Props {
  speakers: Speaker[]
  total: number
  page: number
  totalPages: number
  pageSize: number
  currentField: string
  currentQ: string
  fieldMap: Record<string, string>
}

function buildUrl(params: { page?: number; field?: string; q?: string }) {
  const sp = new URLSearchParams()
  if (params.page && params.page > 1) sp.set('page', String(params.page))
  if (params.field && params.field !== 'all') sp.set('field', params.field)
  if (params.q) sp.set('q', params.q)
  const qs = sp.toString()
  return qs ? `/speakers?${qs}` : '/speakers'
}

function getPaginationRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = []
  pages.push(1)
  if (current > 3) pages.push('…')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}

export default function SpeakerList({
  speakers,
  total,
  page,
  totalPages,
  pageSize,
  currentField,
  currentQ,
  fieldMap,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(currentQ)

  // URL 변경(뒤로가기 등) 시 검색 입력값 동기화
  useEffect(() => {
    setSearchValue(currentQ)
  }, [currentQ])

  // 검색 디바운스 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== currentQ) {
        startTransition(() => {
          router.push(buildUrl({ field: currentField, q: searchValue, page: 1 }))
        })
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [searchValue]) // eslint-disable-line react-hooks/exhaustive-deps

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <>
      <style>{`
        .sp-filter-btn {
          padding: 6px 14px;
          font-size: 12px; font-weight: 400; font-family: var(--font-body);
          letter-spacing: 0.04em;
          color: var(--color-subtle);
          background: transparent;
          border: 1px solid var(--color-border);
          text-decoration: none;
          display: inline-block;
          transition: all 0.15s;
          cursor: pointer;
        }
        .sp-filter-btn:hover { border-color: var(--color-ink); color: var(--color-ink); }
        .sp-filter-btn.active {
          font-weight: 600;
          color: var(--color-bg);
          background: var(--color-ink);
          border-color: var(--color-ink);
        }
        .sp-search-input {
          width: 100%; padding: 10px 14px 10px 40px;
          font-size: 13px; font-family: var(--font-body);
          border: 1px solid var(--color-border);
          background: var(--color-bg);
          color: var(--color-ink);
          outline: none;
          transition: border-color 0.2s;
        }
        .sp-search-input:focus { border-color: var(--color-ink); }
        .sp-inquiry-btn {
          margin-top: 8px; display: block; text-align: center;
          font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
          font-family: var(--font-body);
          padding: 9px 0;
          border: 1px solid var(--color-border);
          color: var(--color-subtle);
          background: transparent;
          text-decoration: none;
          transition: all 0.2s;
        }
        .sp-inquiry-btn:hover {
          background: var(--color-ink);
          color: var(--color-bg);
          border-color: var(--color-ink);
        }
        .sp-page-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          font-size: 13px; font-weight: 400;
          color: var(--color-subtle);
          background: transparent;
          border: 1px solid var(--color-border);
          text-decoration: none;
          transition: all 0.15s;
        }
        .sp-page-btn:hover { border-color: var(--color-ink); color: var(--color-ink); }
        .sp-page-btn.active {
          font-weight: 700;
          color: var(--color-bg);
          background: var(--color-ink);
          border-color: var(--color-ink);
          cursor: default;
          pointer-events: none;
        }
        .sp-page-btn.disabled {
          opacity: 0.3;
          pointer-events: none;
          cursor: default;
        }
        /* 카드 그리드 반응형 */
        @media (max-width: 640px) {
          .sp-card-grid-full { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 641px) and (max-width: 1023px) {
          .sp-card-grid-full { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (min-width: 1400px) {
          .sp-card-grid-full { grid-template-columns: repeat(5, 1fr) !important; }
        }
        /* 카드 사진 비율 — 모바일 4:3, 데스크탑 3:4 */
        @media (min-width: 769px) {
          .sp-card-photo-full { aspect-ratio: 3 / 4 !important; }
        }
      `}</style>

      {/* ── 필터 & 검색 ── */}
      <div style={{
        padding: 'clamp(20px, 3vw, 28px) var(--space-page)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column', gap: '16px',
        opacity: isPending ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}>
        {/* 검색창 */}
        <div style={{ position: 'relative', maxWidth: '360px' }}>
          <svg
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }}
            width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="강사명, 키워드 검색"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="sp-search-input"
            aria-label="강사 검색"
          />
        </div>

        {/* 분야 필터 */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[{ value: 'all', label: '전체' }, ...SPEAKER_FIELDS].map(({ value, label }) => (
            <Link
              key={value}
              href={buildUrl({ field: value, q: currentQ, page: 1 })}
              className={`sp-filter-btn${currentField === value ? ' active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── 결과 카운트 ── */}
      <div style={{
        padding: '14px var(--space-page)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <p style={{ fontSize: '12px', color: 'var(--color-muted)', letterSpacing: '0.04em' }}>
          총 <strong style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{total.toLocaleString()}</strong>명
          {total > 0 && (
            <span style={{ marginLeft: '8px', color: 'var(--color-border)', fontSize: '11px' }}>
              ({from}–{to}번째)
            </span>
          )}
        </p>
        {isPending && (
          <span style={{ fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '0.06em' }}>
            검색 중…
          </span>
        )}
      </div>

      {/* ── 카드 그리드 ── */}
      <div style={{ padding: 'clamp(28px, 4vw, 48px) var(--space-page)' }}>
        {speakers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'clamp(60px, 10vw, 100px) 0' }}>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
              해당 조건의 강사가 없습니다.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '8px' }}>
              직접{' '}
              <Link href="/inquiry/lecture" style={{
                color: 'var(--color-ink)',
                borderBottom: '1px solid currentColor',
                paddingBottom: '1px',
              }}>
                강사 섭외를 문의
              </Link>
              해보세요.
            </p>
          </div>
        ) : (
          <div
            className="sp-card-grid-full stagger-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 'clamp(14px, 2vw, 24px)',
            }}
          >
            {speakers.map((speaker) => (
              <div key={speaker.id} className="sp-card card-lift" style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <Link href={`/speakers/${speaker.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                  <div className="sp-card-photo-full" style={{
                    aspectRatio: '4 / 3',
                    position: 'relative',
                    background: 'var(--color-border)',
                    overflow: 'hidden',
                  }}>
                    {speaker.photo_url ? (
                      <Image
                        src={speaker.photo_url}
                        alt={speaker.name}
                        fill
                        style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-english)', fontSize: '64px',
                        color: 'var(--color-border)',
                      }}>
                        {speaker.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </Link>

                <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                  {/* 분야 태그 */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(speaker.fields ?? [])
                      .filter(f => !f.startsWith('~') && fieldMap[f])
                      .slice(0, 2)
                      .map((f) => (
                        <span key={f} style={{
                          fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em',
                          padding: '3px 7px',
                          background: 'var(--color-bg)',
                          color: 'var(--color-subtle)',
                          border: '1px solid var(--color-border)',
                        }}>
                          {fieldMap[f]}
                        </span>
                      ))}
                  </div>

                  {/* 이름 */}
                  <Link href={`/speakers/${speaker.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h2 style={{
                      fontFamily: 'var(--font-display)', fontWeight: 900,
                      fontSize: 'clamp(15px, 1.4vw, 18px)',
                      letterSpacing: '-0.02em', lineHeight: 1.2,
                      color: 'var(--color-ink)',
                    }}>
                      {speaker.name}
                    </h2>
                  </Link>

                  {/* 소개 */}
                  <p style={{
                    fontSize: '12px', color: 'var(--color-subtle)', lineHeight: 1.7,
                    flex: 1,
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitBoxOrient: 'vertical', WebkitLineClamp: 2,
                  }}>
                    {speaker.bio_short || [speaker.company, speaker.title].filter(Boolean).join(' · ')}
                  </p>

                  {/* 문의 버튼 */}
                  <Link
                    href={`/inquiry/lecture?speaker=${encodeURIComponent(speaker.name)}`}
                    className="sp-inquiry-btn"
                  >
                    문의하기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 페이지네이션 ── */}
      {totalPages > 1 && (
        <div style={{
          padding: 'clamp(24px, 4vw, 40px) var(--space-page)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '4px', flexWrap: 'wrap',
        }}>
          {/* 이전 */}
          {page > 1 ? (
            <Link href={buildUrl({ page: page - 1, field: currentField, q: currentQ })} className="sp-page-btn">←</Link>
          ) : (
            <span className="sp-page-btn disabled">←</span>
          )}

          {/* 페이지 번호 */}
          {getPaginationRange(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`e-${i}`} style={{ padding: '0 6px', color: 'var(--color-muted)', fontSize: '12px' }}>…</span>
            ) : (
              <Link
                key={p}
                href={buildUrl({ page: p as number, field: currentField, q: currentQ })}
                className={`sp-page-btn${p === page ? ' active' : ''}`}
              >
                {p}
              </Link>
            )
          )}

          {/* 다음 */}
          {page < totalPages ? (
            <Link href={buildUrl({ page: page + 1, field: currentField, q: currentQ })} className="sp-page-btn">→</Link>
          ) : (
            <span className="sp-page-btn disabled">→</span>
          )}
        </div>
      )}
    </>
  )
}
