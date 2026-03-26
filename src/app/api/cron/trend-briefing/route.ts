import { NextRequest, NextResponse } from 'next/server'
import { runPipeline } from '@/lib/trend-briefing/pipeline'

export const runtime = 'nodejs'
export const maxDuration = 120

// GET: Vercel Cron 자동 실행 (매일 01:00 UTC = 10:00 KST)
// Authorization: Bearer <CRON_SECRET>
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const results = await runPipeline()
    return NextResponse.json({ ok: true, ...results })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
