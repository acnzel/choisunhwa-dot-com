import { NextResponse } from 'next/server'
import { runPipeline } from '@/lib/trend-briefing/pipeline'

export const runtime = 'nodejs'
export const maxDuration = 120

// POST: 어드민 수동 실행
// 미들웨어에서 admin 인증 완료 후 도달
export async function POST() {
  try {
    const results = await runPipeline()
    return NextResponse.json({ ok: true, ...results })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
