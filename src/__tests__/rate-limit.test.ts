import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RateLimiter } from '@/lib/rate-limit'

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests under the limit', () => {
    const limiter = new RateLimiter(3, 60_000)

    const r1 = limiter.check('user-1')
    expect(r1.allowed).toBe(true)
    expect(r1.remaining).toBe(2)

    const r2 = limiter.check('user-1')
    expect(r2.allowed).toBe(true)
    expect(r2.remaining).toBe(1)

    const r3 = limiter.check('user-1')
    expect(r3.allowed).toBe(true)
    expect(r3.remaining).toBe(0)
  })

  it('blocks requests at the limit', () => {
    const limiter = new RateLimiter(2, 60_000)

    limiter.check('user-1')
    limiter.check('user-1')

    const r3 = limiter.check('user-1')
    expect(r3.allowed).toBe(false)
    expect(r3.remaining).toBe(0)
    expect(r3.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('resets after the window expires', () => {
    const limiter = new RateLimiter(2, 60_000)

    limiter.check('user-1')
    limiter.check('user-1')

    // Advance past the window
    vi.advanceTimersByTime(61_000)

    const result = limiter.check('user-1')
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(1)
  })

  it('tracks users independently', () => {
    const limiter = new RateLimiter(1, 60_000)

    const r1 = limiter.check('user-1')
    expect(r1.allowed).toBe(true)

    // user-1 is now blocked
    const r2 = limiter.check('user-1')
    expect(r2.allowed).toBe(false)

    // user-2 is unaffected
    const r3 = limiter.check('user-2')
    expect(r3.allowed).toBe(true)
  })

  it('provides correct retryAfterSeconds', () => {
    const limiter = new RateLimiter(1, 60_000)

    limiter.check('user-1')

    // Advance 20 seconds
    vi.advanceTimersByTime(20_000)

    const result = limiter.check('user-1')
    expect(result.allowed).toBe(false)
    // Should be ~40 seconds remaining (60 - 20)
    expect(result.retryAfterSeconds).toBe(40)
  })

  it('uses sliding window — oldest request expires individually', () => {
    const limiter = new RateLimiter(2, 60_000)

    // Request at t=0
    limiter.check('user-1')

    // Advance 30s, request at t=30s
    vi.advanceTimersByTime(30_000)
    limiter.check('user-1')

    // At t=30s, both requests are within the window — blocked
    const blocked = limiter.check('user-1')
    expect(blocked.allowed).toBe(false)

    // Advance to t=61s — first request (t=0) has expired, second (t=30s) still active
    vi.advanceTimersByTime(31_000)

    const result = limiter.check('user-1')
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(0) // 2 in window now (t=30s and t=61s)
  })

  it('works with the 10 req/min apply configuration', () => {
    const limiter = new RateLimiter(10, 60_000)

    // Fire 10 requests — all should pass
    for (let i = 0; i < 10; i++) {
      const result = limiter.check('user-1')
      expect(result.allowed).toBe(true)
    }

    // 11th should be blocked
    const blocked = limiter.check('user-1')
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBe(60)
  })
})
