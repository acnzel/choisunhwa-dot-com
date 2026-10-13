import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { SITE_URL } from '@/lib/seo'
import NewsletterEditor from './NewsletterEditor'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '뉴스레터 초안 | 어드민',
}

export default async function NewsletterDraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('newsletter_drafts')
    .select('id, trigger_title, content, comment, created_at')
    .eq('id', id)
    .single()
  if (!data) notFound()

  return (
    <div className="p-6 max-w-5xl">
      <Link href="/mong-bab/newsletter" className="text-sm text-gray-400 hover:text-gray-600">← 이슈 뉴스레터</Link>
      <p className="text-xs text-gray-400 mt-4">이슈: {data.trigger_title}</p>
      <NewsletterEditor id={data.id} initialContent={data.content} initialComment={data.comment} siteUrl={SITE_URL} />
    </div>
  )
}
