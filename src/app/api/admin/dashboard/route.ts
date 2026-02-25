import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/dashboard
 * 대시보드 통계 + 최근 문의/회원
 */
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const supabase = createAdminClient()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: totalMembers },
    { count: newMembers },
    { count: totalSpeakers },
    { count: pendingSpeakers },
    { count: totalInquiries },
    { count: newInquiries },
    { count: totalLectures },
    { data: recentInquiries },
    { data: recentMembers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart),
    supabase.from('speakers').select('*', { count: 'exact', head: true }),
    supabase
      .from('speakers')
      .select('*', { count: 'exact', head: true })
      .eq('is_visible', false),
    supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart),
    supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new'),
    supabase.from('lectures').select('*', { count: 'exact', head: true }),
    supabase
      .from('inquiries')
      .select('id, type, name, company, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('profiles')
      .select('id, name, email, provider, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return NextResponse.json({
    data: {
      stats: {
        members: { total: totalMembers ?? 0, newThisMonth: newMembers ?? 0 },
        speakers: { total: totalSpeakers ?? 0, pending: pendingSpeakers ?? 0 },
        inquiries: {
          thisMonth: totalInquiries ?? 0,
          unprocessed: newInquiries ?? 0,
        },
        lectures: { total: totalLectures ?? 0 },
      },
      recentInquiries: recentInquiries ?? [],
      recentMembers: recentMembers ?? [],
    },
  })
}
