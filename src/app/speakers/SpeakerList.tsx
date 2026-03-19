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

function buildUrl(params: { page?: number; field?: string; q?: string; sort?: string }) {
  const sp = new URLSearchParams()
  if (params.page && params.page > 1) sp.set('page', String(params.page))
  if (params.field && params.field !== 'all') sp.set('field', params.field)
  if (params.q) sp.set('q', params.q)
  if (params.sort && params.sort !== 'default') sp.set('sort', params.sort)
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

// ── 사진 폴백 컴포넌트 ──
function SpeakerPhoto({ photoUrl, name }: { photoUrl: string | null; name: string }) {
  const [error, setError] = useState(false)
  const initial = (name ?? '?').charAt(0)

  if (!photoUrl || error) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #EDE6DC, #DDD5C8)',
        fontSize: 'clamp(28px, 4vw, 40px)',
        fontWeight: 800,
        color: '#C5B8A8',
        fontFamily: 'var(--font-body)',
      }}>
        {initial}
      </div>
    )
  }

  return (
    <Image
      src={photoUrl}
      alt={name}
      fill
      style={{ objectFit: 'cover', objectPosition: 'top center' }}
      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
      className="sp-list-card-img"
      onError={() => setError(true)}
    />
  )
}

export default function SpeakerList({
  speakers, total, page, totalPages, pageSize,
  currentField, currentQ, fieldMap,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(currentQ)
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

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

  return (
    <>
      <style>{`
        /* ── 검색바 띠 ── */
        .spk-search-strip {
          background: #F2EDE6;
          border-bottom: 1px solid #E0D8CE;
          padding: 14px clamp(20px, 4vw, 48px);
        }
        .spk-search-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .spk-search-wrap {
          flex: 1; max-width: 440px; position: relative;
        }
        .spk-search-icon {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%);
          color: #B0A090; pointer-events: none;
          width: 15px; height: 15px;
        }
        .spk-search-input {
          width: 100%; padding: 10px 16px 10px 38px;
          border: 1px solid #D5CCBE; border-radius: 8px;
          font-size: 14px; background: #FDFAF6;
          color: #333; outline: none;
          font-family: var(--font-body);
          transition: border-color .15s;
        }
        .spk-search-input:focus { border-color: #2C6B5A; }
        .spk-search-input::placeholder { color: #B0A090; }
        .spk-sort-select {
          padding: 10px 14px;
          border: 1px solid #D5CCBE; border-radius: 8px;
          font-size: 13px; background: #FDFAF6;
          color: #555; cursor: pointer; outline: none;
          font-family: var(--font-body);
        }
        .spk-result-count {
          font-size: 13px; color: #9C8570;
          margin-left: auto; white-space: nowrap;
        }
        .spk-result-count strong { color: #2C6B5A; font-weight: 700; }

        /* ── 바디 레이아웃 ── */
        .spk-body-wrap {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px clamp(20px, 4vw, 48px) 80px;
          display: flex;
          gap: 36px;
          opacity: 1;
          transition: opacity .2s;
        }
        .spk-body-wrap.loading { opacity: 0.6; }

        /* ── 사이드바 ── */
        .spk-sidebar-new {
          width: 220px;
          flex-shrink: 0;
        }
        @media (max-width: 900px) { .spk-sidebar-new { display: none; } }

        .spk-sidebar-section { margin-bottom: 32px; }
        .spk-sidebar-heading {
          font-size: 11px; font-weight: 700;
          color: #9C8570; letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 14px; padding-bottom: 8px;
          border-bottom: 1px solid #E0D8CE;
        }
        .spk-active-filters {
          display: flex; flex-wrap: wrap; gap: 6px;
          margin-bottom: 16px;
        }
        .spk-active-tag {
          display: flex; align-items: center; gap: 4px;
          background: #E8EDE9; color: #2C6B5A;
          font-size: 12px; font-weight: 600;
          padding: 4px 10px; border-radius: 20px;
          text-decoration: none;
        }
        .spk-reset-btn {
          font-size: 12px; color: #B0A090;
          text-decoration: underline;
          background: none; border: none;
          padding: 0; cursor: pointer;
          font-family: var(--font-body);
        }
        .spk-filter-group { margin-bottom: 8px; }
        .spk-filter-group-label {
          font-size: 13px; font-weight: 700;
          color: #2C1A0E; margin-bottom: 10px;
          display: flex; justify-content: space-between;
          align-items: center;
        }
        .spk-filter-group-label::after {
          content: '∨'; font-size: 11px; color: #9C8570;
        }
        .spk-filter-option {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 0; cursor: pointer; text-decoration: none;
          font-size: 13px; color: #5A4A3A;
          transition: color .15s;
        }
        .spk-filter-option:hover { color: #2C6B5A; }
        .spk-filter-option.active { color: #2C6B5A; font-weight: 700; }
        .spk-filter-checkbox {
          width: 14px; height: 14px;
          border: 1.5px solid #C5B8A8;
          border-radius: 3px;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: all .15s;
        }
        .spk-filter-option.active .spk-filter-checkbox {
          background: #2C6B5A; border-color: #2C6B5A;
        }
        .spk-filter-option.active .spk-filter-checkbox::after {
          content: '✓'; font-size: 9px; color: #fff; font-weight: 800;
        }

        /* ── 그리드 ── */
        .spk-grid-new {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }
        @media (max-width: 1200px) { .spk-grid-new { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 900px)  { .spk-grid-new { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 600px)  { .spk-grid-new { grid-template-columns: repeat(2, 1fr); } }

        /* ── 카드 ── */
        .spk-card-new {
          background: #FDFAF6;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #EAE3D8;
          text-decoration: none; color: inherit;
          display: flex; flex-direction: column;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .spk-card-new:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(44, 26, 14, 0.12);
        }

        /* 사진 */
        .spk-card-photo-new {
          position: relative; width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: #E5DDD3;
        }
        .sp-list-card-img { transition: transform 0.4s ease !important; }
        .spk-card-new:hover .sp-list-card-img { transform: scale(1.04) !important; }

        /* 사진 호버 오버레이 */
        .spk-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(30,15,5,0.72) 0%, transparent 55%);
          opacity: 0;
          transition: opacity 0.28s ease;
          display: flex; align-items: flex-end;
          padding: 14px;
        }
        .spk-card-new:hover .spk-card-overlay { opacity: 1; }
        .spk-card-overlay-btn {
          background: #FDFAF6; color: #2C6B5A;
          font-size: 12px; font-weight: 700;
          padding: 8px 14px; border-radius: 6px;
          width: 100%; text-align: center;
          font-family: var(--font-body);
        }

        /* 카드 본문 */
        .spk-card-body-new {
          padding: 14px 14px 16px;
          flex: 1; display: flex; flex-direction: column; gap: 0;
        }
        .spk-card-name-new {
          font-size: 15px; font-weight: 800;
          color: #1F1007; letter-spacing: -0.3px;
          margin-bottom: 3px; line-height: 1.2;
        }
        .spk-card-affil-new {
          font-size: 12px; color: #9C8570; font-weight: 500;
          margin-bottom: 7px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .spk-card-intro-new {
          font-size: 12px; color: #6B5B4E; line-height: 1.55;
          margin-bottom: 10px;
          display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          flex: 1;
        }
        .spk-card-tags-new {
          display: flex; flex-wrap: wrap; gap: 5px; margin-top: auto;
        }
        .spk-card-tag-new {
          background: #EDE6DC; color: #7A5E40;
          font-size: 10px; font-weight: 600;
          padding: 3px 8px; border-radius: 20px; white-space: nowrap;
        }

        /* ── 페이지네이션 ── */
        .spk-pagination-new {
          display: flex; justify-content: center;
          gap: 6px; margin-top: 52px; flex-wrap: wrap;
        }
        .spk-page-btn-new {
          width: 36px; height: 36px;
          border-radius: 8px;
          border: 1px solid #D5CCBE;
          background: #FDFAF6;
          font-size: 14px; color: #5A4A3A;
          display: inline-flex; align-items: center; justify-content: center;
          text-decoration: none; font-weight: 500;
          transition: background .15s, color .15s, border-color .15s;
        }
        .spk-page-btn-new:hover { background: #EDE6DC; }
        .spk-page-btn-new.active {
          background: #2C6B5A; color: #fff;
          border-color: #2C6B5A; font-weight: 700;
        }
        .spk-page-btn-new.disabled { color: #ccc; border-color: #eee; pointer-events: none; }
      `}</style>

      {/* ── 검색 & 정렬 띠 ── */}
      <div className="spk-search-strip">
        <div className="spk-search-inner">
          <div className="spk-search-wrap">
            <svg className="spk-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="spk-search-input"
              placeholder="강사명, 키워드, 소속으로 검색"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              aria-label="강사 검색"
            />
          </div>
          <select
            className="spk-sort-select"
            defaultValue="default"
            onChange={(e) => {
              startTransition(() => {
                router.push(buildUrl({ field: currentField, q: currentQ, page: 1, sort: e.target.value }))
              })
            }}
          >
            <option value="default">등록순</option>
            <option value="name">이름순</option>
          </select>
          <div className="spk-result-count">
            <strong>{total.toLocaleString()}명</strong>의 강사
            {(page > 1 || totalPages > 1) && (
              <span style={{ color: '#B0A090', marginLeft: 6, fontSize: 12 }}>
                ({from}–{to})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── 바디 ── */}
      <div className={`spk-body-wrap${isPending ? ' loading' : ''}`}>

        {/* 사이드바 */}
        <aside className="spk-sidebar-new">
          <div className="spk-sidebar-section">
            <div className="spk-sidebar-heading">필터</div>

            {/* 활성 필터 태그 */}
            {currentField !== 'all' && (
              <div className="spk-active-filters">
                <Link
                  href={buildUrl({ field: 'all', q: currentQ, page: 1 })}
                  className="spk-active-tag"
                >
                  {fieldMap[currentField] ?? currentField} ×
                </Link>
                <Link href="/speakers" className="spk-reset-btn">전체 초기화</Link>
              </div>
            )}

            {/* 강연 분야 */}
            <div className="spk-filter-group">
              <div className="spk-filter-group-label">강연 분야</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Link
                  href={buildUrl({ field: 'all', q: currentQ, page: 1 })}
                  className={`spk-filter-option${currentField === 'all' ? ' active' : ''}`}
                >
                  <div className="spk-filter-checkbox" />
                  전체
                </Link>
                {SPEAKER_FIELDS.map(({ value, label }) => (
                  <Link
                    key={value}
                    href={buildUrl({ field: value, q: currentQ, page: 1 })}
                    className={`spk-filter-option${currentField === value ? ' active' : ''}`}
                  >
                    <div className="spk-filter-checkbox" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* 그리드 영역 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {speakers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ color: '#B0A090', fontSize: 14 }}>해당 조건의 강사가 없습니다.</p>
            </div>
          ) : (
            <div className="spk-grid-new">
              {speakers.map((speaker) => {
                const catFields = (speaker.fields ?? []).filter(f => !f.startsWith('~') && fieldMap[f])
                const affiliLine = [speaker.title, speaker.company].filter(Boolean).join(' · ')
                return (
                  <Link key={speaker.id} href={`/speakers/${speaker.id}`} className="spk-card-new">
                    <div className="spk-card-photo-new">
                      <SpeakerPhoto photoUrl={speaker.photo_url ?? null} name={speaker.name} />
                      <div className="spk-card-overlay">
                        <div className="spk-card-overlay-btn">섭외 문의 →</div>
                      </div>
                    </div>
                    <div className="spk-card-body-new">
                      <div className="spk-card-name-new">{speaker.name}</div>
                      {affiliLine && <div className="spk-card-affil-new">{affiliLine}</div>}
                      {speaker.bio_short && (
                        <div className="spk-card-intro-new">{speaker.bio_short}</div>
                      )}
                      {catFields.length > 0 && (
                        <div className="spk-card-tags-new">
                          {catFields.slice(0, 2).map(f => (
                            <span key={f} className="spk-card-tag-new">{fieldMap[f]}</span>
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
            <div className="spk-pagination-new">
              {page > 1 ? (
                <Link href={buildUrl({ page: page - 1, field: currentField, q: currentQ })}
                  className="spk-page-btn-new">‹</Link>
              ) : (
                <span className="spk-page-btn-new disabled">‹</span>
              )}
              {getPaginationRange(page, totalPages).map((p, i) =>
                p === '…' ? (
                  <span key={`e-${i}`} className="spk-page-btn-new"
                    style={{ border: 'none', background: 'transparent', color: '#B0A090' }}>…</span>
                ) : (
                  <Link key={p}
                    href={buildUrl({ page: p as number, field: currentField, q: currentQ })}
                    className={`spk-page-btn-new${p === page ? ' active' : ''}`}>
                    {p}
                  </Link>
                )
              )}
              {page < totalPages ? (
                <Link href={buildUrl({ page: page + 1, field: currentField, q: currentQ })}
                  className="spk-page-btn-new">›</Link>
              ) : (
                <span className="spk-page-btn-new disabled">›</span>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
