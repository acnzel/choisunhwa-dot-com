/**
 * GitHub Actions용 트렌드 브리핑 파이프라인 직접 실행 스크립트
 * 실행: npx tsx scripts/run-pipeline.ts
 */
import { runPipeline } from '../src/lib/trend-briefing/pipeline'

async function main() {
  console.log('[pipeline] 트렌드 브리핑 파이프라인 시작')
  console.log('[pipeline] 시각:', new Date().toISOString())

  try {
    const result = await runPipeline()
    console.log('[pipeline] 완료:', JSON.stringify(result, null, 2))

    if (result.errors.length > 0) {
      console.warn('[pipeline] 오류 항목:', result.errors)
    }

    console.log(`[pipeline] 수집: ${result.collected}건 | 저장: ${result.saved}건`)
    process.exit(0)
  } catch (err) {
    console.error('[pipeline] 치명적 오류:', err)
    process.exit(1)
  }
}

main()
