import { describe, expect, it } from 'vitest'
import { config, getAdminRouteKind, isPathnameAtOrBelow } from '@/middleware'

describe('admin route protection', () => {
  it('matches exact path or child path only', () => {
    expect(isPathnameAtOrBelow('/api/admin', '/api/admin')).toBe(true)
    expect(isPathnameAtOrBelow('/api/admin/speakers', '/api/admin')).toBe(true)
    expect(isPathnameAtOrBelow('/api/administrator', '/api/admin')).toBe(false)
  })

  it('classifies admin pages and admin APIs', () => {
    expect(getAdminRouteKind('/mong-bab/dashboard')).toBe('page')
    expect(getAdminRouteKind('/api/admin/speakers')).toBe('api')
    expect(getAdminRouteKind('/api/mong-bab/trend-briefing')).toBe('api')
    expect(getAdminRouteKind('/api/speakers')).toBeNull()
  })

  it('runs middleware for admin API routes', () => {
    expect(config.matcher).toContain('/api/admin/:path*')
    expect(config.matcher).toContain('/api/mong-bab/:path*')
    expect(config.matcher).toContain('/mong-bab/:path*')
  })
})
