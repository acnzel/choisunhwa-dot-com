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
        /* ── 레이아웃 ── */
        .spk-wrap {
          display: flex;
          gap: 36px;
          opacity: ${isPending ? 0.6 : 1};
          transition: opacity .2s;
        }
        @media (max-width: 900px) { .spk-wrap { flex-direction: column; } .spk-sidebar { display: none; } }

        /* ── 사이드바 ── */
        .spk-sidebar {
          width: 220px;
          flex-shrink: 0;
          position: sticky;
          top: calc(var(--nav-height, 64px) + 24px);
          align-self: start;
        }
        .spk-sidebar-title {
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          color: #9C8570; text-transform: uppercase;
          margin-bottom: 14px; padding-bottom: 8px;
          border-bottom: 1px solid #E0D8CE;
        }
        .spk-filter-group { margin-bottom: 20px; }
        .spk-filter-group-label {
          font-size: 13px; font-weight: 700; color: #2C1A0E;
          margin-bottom: 8px; cursor: pointer;
          display: flex; justify-content: space-between; align-items: center;
        }
        .spk-filter-group-label::after { content: '∨'; font-size: 11px; color: #9C8570; }
        .spk-filter-options { display: flex; flex-direction: column; gap: 6px; padding-left: 2px; }
        .spk-filter-opt {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: #5A4A3A;
          text-decoration: none; padding: 3px 0;
          transition: color .15s;
        }
        .spk-filter-opt:hover { color: #2C6B5A; }
        .spk-filter-opt.active { color: #2C6B5A; font-weight: 700; }
        .spk-filter-opt .dot {
          width: 14px; height: 14px; border-radius: 3px;
          border: 1.5px solid #C5B8A8; flex-shrink: 0;
          transition: background .15s, border-color .15s;
        }
        .spk-filter-opt.active .dot { background: #2C6B5A; border-color: #2C6B5A; }
        .spk-active-tag {
          display: inline-flex; align-items: center; gap: 4px;
          background: #E8EDE9; color: #2C6B5A;
          font-size: 12px; font-weight: 600;
          padding: 4px 10px; border-radius: 20px;
          margin-bottom: 16px;
          text-decoration: none;
        }

        /* ── 카드 그리드 ── */
        .spk-grid {
          flex: 1; min-width: 0;
        }
        .spk-cards {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }
        @media (max-width: 1200px) { .spk-cards { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 900px)  { .spk-cards { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 560px)  { .spk-cards { grid-template-columns: repeat(2, 1fr); } }

        /* ── 카드 ── */
        .spk-card {
          background: #FDFAF6;
          border-radius: 12px;
          border: 1px solid #EAE3D8;
          overflow: hidden;
          text-decoration: none; color: inherit;
          display: flex; flex-direction: column;
          transition: transform .22s ease, box-shadow .22s ease;
        }
        .spk-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(44, 26, 14, 0.12);
        }

        /* 사진 */
        .spk-card-photo {
          position: relative; width: 100%;
          aspect-ratio: 3 / 4; overflow: hidden;
          background: #E5DDD3;
        }
        .spk-card-photo img {
          transition: transform .4s ease;
        }
        .spk-card:hover .spk-card-photo img { transform: scale(1.04); }

        /* hover overlay */
        .spk-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(30,15,5,0.72) 0%, transparent 55%);
          opacity: 0; transition: opacity .28s ease;
          display: flex; align-items: flex-end; padding: 16px;
        }
        .spk-card:hover .spk-card-overlay { opacity: 1; }
        .spk-overlay-btn {
          background: #FDFAF6; color: #2C6B5A;
          font-size: 12px; font-weight: 700;
          padding: 8px 14px; border-radius: 6px;
          width: 100%; text-align: center;
        }

        /* 이니셜 플레이스홀더 */
        .spk-card-placeholder {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: clamp(28px, 3vw, 40px); font-weight: 900; color: #C5B8A8;
          background: linear-gradient(135deg, #EDE6DC, #DDD5C8);
          font-family: var(--font-display, serif);
        }

        /* 카드 텍스트 */
        .spk-card-body { padding: 14px 14px 16px; }
        .spk-card-name { font-size: 15px; font-weight: 800; color: #1F1007; letter-spacing: -0.3px; margin-bottom: 3px; }
        .spk-card-affil { font-size: 12px; color: #9C8570; font-weight: 500; margin-bottom: 7px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .spk-card-intro {
          font-size: 12px; color: #6B5B4E; line-height: 1.55; margin-bottom: 10px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .spk-card-tags { display: flex; flex-wrap: wrap; gap: 5px; }
        .spk-card-tag {
          background: #EDE6DC; color: #7A5E40;
          font-size: 10px; font-weight: 600;
          padding: 3px 8px; border-radius: 20px;
        }

        /* ── 페이지네이션 ── */
        .spk-pagination { display: flex; justify-content: center; gap: 6px; margin-top: 52px; }
        .spk-pg-btn {
          width: 36px; height: 36px; border-radius: 8px;
          border: 1px solid #D5CCBE; background: #FDFAF6;
          font-size: 14px; color: #5A4A3A; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          font-weight: 500; transition: all .15s; text-decoration: none;
        }
        .spk-pg-btn:hover { background: #EDE6DC; }
        .spk-pg-btn.active { background: #2C6B5A; color: #fff; border-color: #2C6B5A; font-weight: 700; }
        .spk-pg-btn.disabled { color: #C5B8A8; cursor: default; border-color: #EAE3D8; }
      `}</style>

      <div className="spk-wrap">

        {/* ── 사이드바 ── */}
        <aside className="spk-sidebar">
          <div className="spk-sidebar-title">필터</div>

          {currentField !== 'all' && (
            <Link
              href={buildUrl({ field: 'all', q: currentQ, page: 1 })}
              className="spk-active-tag"
            >
              {fieldMap[currentField] ?? currentField}
              <span style={{ fontSize: 15, lineHeight: 1 }}>×</span>
            </Link>
          )}

          <div className="spk-filter-group">
            <div className="spk-filter-group-label">강연 분야</div>
            <div className="spk-filter-options">
              <Link
                href={buildUrl({ field: 'all', q: currentQ, page: 1 })}
                className={`spk-filter-opt${currentField === 'all' ? ' active' : ''}`}
              >
                <span className="dot" />
                전체
              </Link>
              {SPEAKER_FIELDS.map(({ value, label }) => (
                <Link
                  key={value}
                  href={buildUrl({ field: value, q: currentQ, page: 1 })}
                  className={`spk-filter-opt${currentField === value ? ' active' : ''}`}
                >
                  <span className="dot" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* ── 메인 그리드 ── */}
        <div className="spk-grid">

          {/* 검색 + 카운트 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 24, flexWrap: 'wrap',
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 440 }}>
              <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#B0A090' }}
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
                  width: '100%', paddingLeft: 40, paddingRight: 16,
                  paddingTop: 10, paddingBottom: 10,
                  fontSize: 14, border: '1px solid #D5CCBE', borderRadius: 8,
                  background: '#FDFAF6', outline: 'none', fontFamily: 'inherit',
                  color: '#333',
                }}
                aria-label="강사 검색"
              />
            </div>
            <p style={{ fontSize: 13, color: '#9C8570', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              <strong style={{ color: '#2C6B5A', fontWeight: 700 }}>{total.toLocaleString()}명</strong>의 강사
              {total > 0 && (
                <span style={{ color: '#C5B8A8', marginLeft: 6 }}>({from}–{to})</span>
              )}
            </p>
          </div>

          {/* 카드 */}
          {speakers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ color: '#B0A090', fontSize: 14 }}>해당 조건의 강사가 없습니다.</p>
              <p style={{ color: '#B0A090', fontSize: 13, marginTop: 8 }}>
                <Link href="/inquiry/lecture" style={{ color: '#2C6B5A', textDecoration: 'underline' }}>
                  강사 섭외를 직접 문의
                </Link>해보세요.
              </p>
            </div>
          ) : (
            <div className="spk-cards">
              {speakers.map((speaker) => {
                const catFields = (speaker.fields ?? []).filter(f => !f.startsWith('~') && fieldMap[f])
                const affil = [speaker.title, speaker.company].filter(Boolean).join(' · ')
                return (
                  <Link key={speaker.id} href={`/speakers/${speaker.id}`} className="spk-card">
                    <div className="spk-card-photo">
                      {speaker.photo_url ? (
                        <Image
                          src={speaker.photo_url}
                          alt={speaker.name}
                          fill
                          style={{ objectFit: 'cover', objectPosition: 'top center' }}
                          sizes="(max-width: 560px) 50vw, (max-width: 900px) 33vw, (max-width: 1200px) 25vw, 20vw"
                        />
                      ) : (
                        <div className="spk-card-placeholder">{speaker.name.charAt(0)}</div>
                      )}
                      <div className="spk-card-overlay">
                        <div className="spk-overlay-btn">섭외 문의 →</div>
                      </div>
                    </div>
                    <div className="spk-card-body">
                      <div className="spk-card-name">{speaker.name}</div>
                      {affil && <div className="spk-card-affil">{affil}</div>}
                      {speaker.bio_short && (
                        <div className="spk-card-intro">{speaker.bio_short}</div>
                      )}
                      {catFields.length > 0 && (
                        <div className="spk-card-tags">
                          {catFields.slice(0, 2).map(f => (
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
            <div className="spk-pagination">
              {page > 1 ? (
                <Link href={buildUrl({ page: page - 1, field: currentField, q: currentQ })}
                  className="spk-pg-btn">‹</Link>
              ) : (
                <span className="spk-pg-btn disabled">‹</span>
              )}
              {getPaginationRange(page, totalPages).map((p, i) =>
                p === '…' ? (
                  <span key={`e-${i}`} className="spk-pg-btn" style={{ border: 'none' }}>…</span>
                ) : (
                  <Link key={p}
                    href={buildUrl({ page: p as number, field: currentField, q: currentQ })}
                    className={`spk-pg-btn${p === page ? ' active' : ''}`}>
                    {p}
                  </Link>
                )
              )}
              {page < totalPages ? (
                <Link href={buildUrl({ page: page + 1, field: currentField, q: currentQ })}
                  className="spk-pg-btn">›</Link>
              ) : (
                <span className="spk-pg-btn disabled">›</span>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
