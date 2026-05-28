import { beforeEach, describe, expect, it, vi } from 'vitest'

const createClientMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

import { requireAdmin } from '@/lib/auth'

function mockSupabaseClient({
  user,
  profile,
  authError = null,
}: {
  user: { id: string } | null
  profile?: { role: string } | null
  authError?: Error | null
}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: authError,
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: profile ?? null }),
        }),
      }),
    }),
  }
}

describe('requireAdmin', () => {
  beforeEach(() => {
    createClientMock.mockReset()
  })

  it('returns 401 when there is no authenticated user', async () => {
    createClientMock.mockResolvedValue(mockSupabaseClient({ user: null }))

    const { error } = await requireAdmin()

    expect(error?.status).toBe(401)
    await expect(error?.json()).resolves.toEqual({ error: '인증이 필요합니다' })
  })

  it('returns 403 when authenticated user is not admin', async () => {
    createClientMock.mockResolvedValue(mockSupabaseClient({
      user: { id: 'user-1' },
      profile: { role: 'user' },
    }))

    const { error } = await requireAdmin()

    expect(error?.status).toBe(403)
    await expect(error?.json()).resolves.toEqual({ error: '권한이 없습니다' })
  })

  it('allows authenticated admin users', async () => {
    const supabase = mockSupabaseClient({
      user: { id: 'admin-1' },
      profile: { role: 'admin' },
    })
    createClientMock.mockResolvedValue(supabase)

    const { error, user } = await requireAdmin()

    expect(error).toBeNull()
    expect(user).toEqual({ id: 'admin-1' })
  })
})
