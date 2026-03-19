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
        /* ── 필터 태그 ── */
        .spk-filter-tag {
          border: 1.5px solid #c4bdb4;
          background: transparent;
          padding: 5px 14px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.3px;
          cursor: pointer; transition: all .18s;
          color: #8a8178;
          font-family: inherit;
          white-space: nowrap;
        }
        .spk-filter-tag:hover { color: #1E3A2F; border-color: #1E3A2F; }
        .spk-filter-tag.active { background: #1E3A2F; color: #fff; border-color: #1E3A2F; }

        /* ── 강사 카드 ── */
        .spk-card-A {
          background: #F5F0E8;
          text-decoration: none;
          color: inherit;
          display: flex; flex-direction: column;
          overflow: hidden;
          cursor: pointer;
          transition: box-shadow .25s ease;
        }
        .spk-card-A:hover {
          box-shadow: 0 6px 24px rgba(0,0,0,0.14);
        }

        /* 사진 */
        .spk-photo-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: #ccc6ba;
        }
        .spk-photo-wrap img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: center top;
          filter: grayscale(20%);
          transition: transform .4s ease, filter .4s ease;
        }
        .spk-card-A:hover .spk-photo-wrap img {
          transform: scale(1.04);
          filter: grayscale(0%);
        }

        /* 카테고리 오버레이 태그 */
        .spk-cat-overlay {
          position: absolute; top: 12px; left: 12px;
          border: 1.5px solid rgba(255,255,255,0.85);
          color: #fff;
          background: rgba(0,0,0,0.18);
          backdrop-filter: blur(4px);
          font-size: 9px; font-weight: 700; letter-spacing: 1.5px;
          padding: 3px 9px;
          text-transform: uppercase;
          pointer-events: none;
        }

        /* 카드 바디 */
        .spk-card-body {
          padding: 14px 16px 18px;
          flex: 1;
          display: flex; flex-direction: column; gap: 4px;
        }
        .spk-name {
          font-family: var(--font-display, serif);
          font-size: 16px; font-weight: 900;
          letter-spacing: -0.03em; line-height: 1.2;
          color: #1a1a1a;
        }
        .spk-title {
          font-size: 11px; color: #8a8178; font-weight: 500;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          line-height: 1.4;
        }
        .spk-bio {
          font-size: 12px; color: #555;
          line-height: 1.65;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-top: 4px;
        }

        /* hover: 섭외 버튼 */
        .spk-hire-btn {
          margin-top: 8px;
          padding: 7px 14px;
          background: #1E3A2F; color: #fff;
          font-size: 11px; font-weight: 700;
          border: none; cursor: pointer;
          letter-spacing: 0.5px;
          opacity: 0; transform: translateY(4px);
          transition: opacity .2s, transform .2s;
          font-family: inherit;
          text-align: center;
          display: block; width: 100%;
        }
        .spk-card-A:hover .spk-hire-btn {
          opacity: 1; transform: translateY(0);
        }

        /* 사진 없을 때 플레이스홀더 */
        .spk-placeholder {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #d4cfc6, #b8b0a4);
          font-size: clamp(32px, 4vw, 56px);
          color: #ccc;
          font-family: var(--font-display, serif);
          font-weight: 900;
        }
      `}</style>

      {/* ── 검색 + 필터 바 ── */}
      <div style={{
        marginBottom: '28px',
        opacity: isPending ? 0.5 : 1,
        transition: 'opacity .2s',
      }}>
        {/* 검색창 */}
        <div style={{ position: 'relative', maxWidth: 320, marginBottom: 16 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#aaa' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="강사명, 키워드 검색"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
              fontSize: 13, border: '1.5px solid #c4bdb4',
              background: '#fff', outline: 'none', fontFamily: 'inherit',
            }}
            aria-label="강사 검색"
          />
        </div>

        {/* 필터 태그 */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '2px',
            color: '#8a8178', textTransform: 'uppercase', marginRight: 4,
          }}>
            Category
          </span>
          <Link
            href={buildUrl({ field: 'all', q: currentQ, page: 1 })}
            className={`spk-filter-tag${currentField === 'all' ? ' active' : ''}`}
          >
            전체
          </Link>
          {SPEAKER_FIELDS.map(({ value, label }) => (
            <Link
              key={value}
              href={buildUrl({ field: value, q: currentQ, page: 1 })}
              className={`spk-filter-tag${currentField === value ? ' active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── 결과 카운트 ── */}
      <p style={{ fontSize: 12, color: '#8a8178', marginBottom: 20 }}>
        총 <strong style={{ color: '#1a1a1a' }}>{total.toLocaleString()}</strong>명
        {total > 0 && <span style={{ color: '#bbb', marginLeft: 6 }}>({from}–{to})</span>}
        {isPending && <span style={{ color: '#bbb', marginLeft: 8 }}>검색 중…</span>}
      </p>

      {/* ── 카드 그리드 ── */}
      {speakers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ color: '#aaa', fontSize: 14 }}>해당 조건의 강사가 없습니다.</p>
          <p style={{ color: '#aaa', fontSize: 13, marginTop: 8 }}>
            <Link href="/inquiry/lecture" style={{ color: '#1E3A2F', textDecoration: 'underline' }}>
              직접 강사 섭외를 문의
            </Link>해보세요.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1px',
          background: '#ccc6ba',
        }}
          className="spk-grid"
        >
          <style>{`
            @media (max-width: 1100px) { .spk-grid { grid-template-columns: repeat(4, 1fr) !important; } }
            @media (max-width: 800px)  { .spk-grid { grid-template-columns: repeat(3, 1fr) !important; } }
            @media (max-width: 520px)  { .spk-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          `}</style>
          {speakers.map((speaker) => {
            const catFields = (speaker.fields ?? []).filter(f => !f.startsWith('~') && fieldMap[f])
            const firstCat = catFields[0] ? fieldMap[catFields[0]] : null
            const titleLine = [speaker.title, speaker.company].filter(Boolean).join(' · ')

            return (
              <Link key={speaker.id} href={`/speakers/${speaker.id}`} className="spk-card-A">
                {/* 사진 */}
                <div className="spk-photo-wrap">
                  {speaker.photo_url ? (
                    <Image
                      src={speaker.photo_url}
                      alt={speaker.name}
                      fill
                      style={{ objectFit: 'cover', objectPosition: 'center top' }}
                      sizes="(max-width: 520px) 50vw, (max-width: 800px) 33vw, (max-width: 1100px) 25vw, 20vw"
                    />
                  ) : (
                    <div className="spk-placeholder">
                      {speaker.name.charAt(0)}
                    </div>
                  )}
                  {firstCat && (
                    <span className="spk-cat-overlay">{firstCat}</span>
                  )}
                </div>

                {/* 카드 바디 */}
                <div className="spk-card-body">
                  <div className="spk-name">{speaker.name}</div>
                  {titleLine && <div className="spk-title">{titleLine}</div>}
                  {speaker.bio_short && (
                    <div className="spk-bio">{speaker.bio_short}</div>
                  )}
                  <button className="spk-hire-btn">섭외 문의 →</button>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* ── 페이지네이션 ── */}
      {totalPages > 1 && (
        <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
          {page > 1 ? (
            <Link href={buildUrl({ page: page - 1, field: currentField, q: currentQ })}
              style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, border: '1.5px solid #c4bdb4', color: '#8a8178', textDecoration: 'none',
                transition: 'border-color .15s, color .15s' }}>
              ←
            </Link>
          ) : (
            <span style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, border: '1.5px solid #e8e4de', color: '#ccc' }}>←</span>
          )}

          {getPaginationRange(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`e-${i}`} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 12, color: '#aaa' }}>…</span>
            ) : (
              <Link key={p}
                href={buildUrl({ page: p as number, field: currentField, q: currentQ })}
                style={{
                  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, textDecoration: 'none',
                  ...(p === page
                    ? { background: '#1E3A2F', color: '#fff', fontWeight: 700 }
                    : { border: '1.5px solid #c4bdb4', color: '#666' }),
                }}>
                {p}
              </Link>
            )
          )}

          {page < totalPages ? (
            <Link href={buildUrl({ page: page + 1, field: currentField, q: currentQ })}
              style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, border: '1.5px solid #c4bdb4', color: '#8a8178', textDecoration: 'none' }}>
              →
            </Link>
          ) : (
            <span style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, border: '1.5px solid #e8e4de', color: '#ccc' }}>→</span>
          )}
        </div>
      )}
    </>
  )
}
