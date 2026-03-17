/**
 * In-memory sliding-window rate limiter.
 *
 * Each instance tracks request timestamps per key (typically a userId).
 * Expired entries are pruned automatically on every check to prevent
 * unbounded memory growth.
 */

interface RateLimitResult {
  allowed: boolean
  /** Seconds until the next request would be allowed (0 if allowed) */
  retryAfterSeconds: number
  /** Requests remaining in the current window */
  remaining: number
}

export class RateLimiter {
  private readonly maxRequests: number
  private readonly windowMs: number
  private readonly store = new Map<string, number[]>()

  /**
   * @param maxRequests  Maximum number of requests allowed in the window
   * @param windowMs     Window duration in milliseconds
   */
  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  check(key: string): RateLimitResult {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Get existing timestamps and prune expired ones
    const timestamps = (this.store.get(key) ?? []).filter((t) => t > windowStart)

    if (timestamps.length >= this.maxRequests) {
      // Find when the oldest request in the window expires
      const oldestInWindow = timestamps[0]!
      const retryAfterMs = oldestInWindow + this.windowMs - now
      this.store.set(key, timestamps)
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
        remaining: 0,
      }
    }

    // Allow the request and record the timestamp
    timestamps.push(now)
    this.store.set(key, timestamps)

    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: this.maxRequests - timestamps.length,
    }
  }
}

/** POST /api/apply — 10 requests per minute per user */
export const applyRateLimiter = new RateLimiter(10, 60_000)
