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
  if (total <= 10) return Array.from({ length: total }, (_, i) => i + 1)
  let start = Math.max(1, current - 4)
  let end = start + 9
  if (end > total) { end = total; start = Math.max(1, end - 9) }
  const pages: (number | '…')[] = []
  if (start > 1) { pages.push(1); if (start > 2) pages.push('…') }
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total) { if (end < total - 1) pages.push('…'); pages.push(total) }
  return pages
}

export default function SpeakerList({
  speakers, total, page, totalPages, pageSize,
  currentField, currentQ, fieldMap,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(currentQ)

  useEffect(() => { setSearchValue(currentQ) }, [currentQ])

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
        .spk-layout { display: grid; grid-template-columns: 220px 1fr; gap: 32px; }
        @media (max-width: 900px) { .spk-layout { grid-template-columns: 1fr; } .spk-sidebar { display: none; } }

        /* 사이드바 */
        .spk-sidebar { position: sticky; top: calc(var(--nav-height, 64px) + 24px); align-self: start; }
        .spk-filter-section { margin-bottom: 24px; }
        .spk-filter-title {
          font-size: 11px; font-weight: 700; letter-spacing: 1px;
          color: #8a8178; text-transform: uppercase;
          margin-bottom: 10px; padding-bottom: 8px;
          border-bottom: 1px solid #e8e4de;
        }
        .spk-filter-item {
          display: flex; align-items: center; gap: 8px;
          padding: 5px 0; cursor: pointer;
          font-size: 13px; color: #555;
          text-decoration: none;
          transition: color .15s;
        }
        .spk-filter-item:hover { color: #1E3A2F; }
        .spk-filter-item.active { color: #1E3A2F; font-weight: 700; }
        .spk-filter-count { font-size: 11px; color: #bbb; margin-left: auto; }

        /* 카드 */
        .spk-grid-5 {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        @media (max-width: 1200px) { .spk-grid-5 { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 900px)  { .spk-grid-5 { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 560px)  { .spk-grid-5 { grid-template-columns: repeat(2, 1fr); } }

        .spk-card {
          background: #fff;
          border: 1px solid #e8e4de;
          text-decoration: none; color: inherit;
          display: flex; flex-direction: column;
          transition: box-shadow .2s, transform .2s;
        }
        .spk-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.10);
          transform: translateY(-2px);
        }
        .spk-card:hover .spk-card-img img { transform: scale(1.04); }
        .spk-card-img img { transition: transform .4s ease; }

        .spk-card-img {
          position: relative; width: 100%;
          height: 180px; overflow: hidden;
          background: #ede8e0;
        }
        .spk-card-placeholder {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; font-weight: 900;
          color: #c4bdb4;
          font-family: var(--font-display, serif);
        }
        .spk-card-body { padding: 12px 14px 14px; flex: 1; display: flex; flex-direction: column; gap: 3px; }
        .spk-card-name { font-size: 15px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.02em; }
        .spk-card-title { font-size: 12px; color: #777; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .spk-card-bio {
          font-size: 12px; color: #888; line-height: 1.55; margin-top: 4px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .spk-card-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
        .spk-card-tag {
          font-size: 10px; font-weight: 500;
          padding: 2px 8px; background: #f5f2ed;
          color: #666; white-space: nowrap;
        }

        /* 페이지네이션 */
        .spk-page-btn {
          width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;
          font-size: 13px; text-decoration: none; border: 1px solid #e0dbd4;
          color: #666; transition: all .15s;
        }
        .spk-page-btn:hover { border-color: #1E3A2F; color: #1E3A2F; }
        .spk-page-btn.active { background: #1E3A2F; color: #fff; border-color: #1E3A2F; font-weight: 700; }
      `}</style>

      <div className="spk-layout" style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity .2s' }}>

        {/* ── 왼쪽 사이드바 ── */}
        <aside className="spk-sidebar">
          <div className="spk-filter-section">
            <div className="spk-filter-title">필터</div>
            {currentField !== 'all' && (
              <Link
                href={buildUrl({ field: 'all', q: currentQ, page: 1 })}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 12, color: '#1E3A2F', fontWeight: 600,
                  textDecoration: 'none', marginBottom: 12,
                  padding: '3px 10px', background: '#e8f0eb', borderRadius: 2,
                }}
              >
                {fieldMap[currentField] ?? currentField} ×
              </Link>
            )}
          </div>

          <div className="spk-filter-section">
            <div className="spk-filter-title">강연 분야</div>
            <Link
              href={buildUrl({ field: 'all', q: currentQ, page: 1 })}
              className={`spk-filter-item${currentField === 'all' ? ' active' : ''}`}
            >
              전체
            </Link>
            {SPEAKER_FIELDS.map(({ value, label }) => (
              <Link
                key={value}
                href={buildUrl({ field: value, q: currentQ, page: 1 })}
                className={`spk-filter-item${currentField === value ? ' active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </aside>

        {/* ── 오른쪽 메인 ── */}
        <main>
          {/* 검색 + 카운트 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#aaa' }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="강사명, 키워드, 소속으로 검색"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{
                  width: '100%', paddingLeft: 36, paddingRight: 16,
                  paddingTop: 9, paddingBottom: 9,
                  fontSize: 13, border: '1px solid #e0dbd4',
                  background: '#fff', outline: 'none', fontFamily: 'inherit',
                }}
                aria-label="강사 검색"
              />
            </div>
            <span style={{ fontSize: 13, color: '#8a8178', whiteSpace: 'nowrap' }}>
              <strong style={{ color: '#1a1a1a' }}>{total.toLocaleString()}</strong>명의 강사
            </span>
          </div>

          {/* 카드 그리드 */}
          {speakers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ color: '#aaa', fontSize: 14 }}>해당 조건의 강사가 없습니다.</p>
            </div>
          ) : (
            <div className="spk-grid-5">
              {speakers.map((speaker) => {
                const catFields = (speaker.fields ?? []).filter(f => !f.startsWith('~') && fieldMap[f])
                const titleLine = [speaker.title, speaker.company].filter(Boolean).join(' · ')
                return (
                  <Link key={speaker.id} href={`/speakers/${speaker.id}`} className="spk-card">
                    <div className="spk-card-img">
                      {speaker.photo_url ? (
                        <Image
                          src={speaker.photo_url}
                          alt={speaker.name}
                          fill
                          style={{ objectFit: 'cover', objectPosition: 'center 15%' }}
                          sizes="(max-width: 560px) 50vw, (max-width: 900px) 33vw, (max-width: 1200px) 25vw, 20vw"
                          className="spk-card-img"
                        />
                      ) : (
                        <div className="spk-card-placeholder">{speaker.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="spk-card-body">
                      <div className="spk-card-name">{speaker.name}</div>
                      {titleLine && <div className="spk-card-title">{titleLine}</div>}
                      {speaker.bio_short && (
                        <div className="spk-card-bio">{speaker.bio_short}</div>
                      )}
                      {catFields.length > 0 && (
                        <div className="spk-card-tags">
                          {catFields.slice(0, 3).map(f => (
                            <span key={f} className="spk-card-tag">{fieldMap[f]}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
              {page > 1 ? (
                <Link href={buildUrl({ page: page - 1, field: currentField, q: currentQ })}
                  className="spk-page-btn">‹</Link>
              ) : (
                <span className="spk-page-btn" style={{ color: '#ccc', borderColor: '#eee' }}>‹</span>
              )}
              {getPaginationRange(page, totalPages).map((p, i) =>
                p === '…' ? (
                  <span key={`e-${i}`} className="spk-page-btn" style={{ border: 'none', color: '#aaa' }}>…</span>
                ) : (
                  <Link key={p}
                    href={buildUrl({ page: p as number, field: currentField, q: currentQ })}
                    className={`spk-page-btn${p === page ? ' active' : ''}`}>
                    {p}
                  </Link>
                )
              )}
              {page < totalPages ? (
                <Link href={buildUrl({ page: page + 1, field: currentField, q: currentQ })}
                  className="spk-page-btn">›</Link>
              ) : (
                <span className="spk-page-btn" style={{ color: '#ccc', borderColor: '#eee' }}>›</span>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
