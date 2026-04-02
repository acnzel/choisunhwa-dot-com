import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// POST: 어드민 수동 실행 → GitHub Actions workflow_dispatch 트리거
// Hobby 플랜 10초 제한 우회 — 실제 파이프라인은 GitHub Actions에서 실행
export async function POST() {
  const token = process.env.GITHUB_ACTIONS_TOKEN
  if (!token) {
    return NextResponse.json({ ok: false, error: 'GITHUB_ACTIONS_TOKEN 미설정' }, { status: 500 })
  }

  try {
    const res = await fetch(
      'https://api.github.com/repos/acnzel/choisunhwa-dot-com/actions/workflows/trend-briefing.yml/dispatches',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref: 'main' }),
      }
    )

    if (!res.ok) {
      const text = await res.text()
      console.error('GitHub Actions dispatch 실패:', res.status, text)
      return NextResponse.json(
        { ok: false, error: `GitHub Actions 실행 실패 (${res.status})` },
        { status: 500 }
      )
    }

    // 204 No Content = 성공
    return NextResponse.json({
      ok: true,
      message: 'GitHub Actions에서 실행 중입니다. 1~2분 후 pending 목록을 확인하세요.',
    })
  } catch (err) {
    console.error('dispatch 오류:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
