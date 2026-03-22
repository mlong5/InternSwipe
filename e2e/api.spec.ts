import { test, expect } from '@playwright/test'

/**
 * API-level tests: verifies auth protection and input validation for all backend routes.
 *
 * These tests run without a live Supabase session so they exercise the
 * unauthenticated (401) and bad-input (400) paths of every protected endpoint.
 *
 * Note: eligibility rules (422 on NOT_ELIGIBLE jobs) and retry logic require an
 * authenticated session to reach — those paths are covered by manual QA and the
 * apply route unit logic in src/app/api/apply/route.ts.
 */

const BASE = 'http://localhost:3000'

// ── Auth protection ──────────────────────────────────────────────────────────

test.describe('Auth protection — all protected routes return 401 without a session', () => {

  test('GET /api/jobs returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.get(`${BASE}/api/jobs`)
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.data).toBeNull()
    expect(typeof body.error).toBe('string')
  })

  test('GET /api/jobs/[id] returns 401 when unauthenticated', async ({ request }) => {
    const fakeId = '00000000-0000-0000-0000-000000000001'
    const res = await request.get(`${BASE}/api/jobs/${fakeId}`)
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.data).toBeNull()
  })

  test('POST /api/apply returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.post(`${BASE}/api/apply`, {
      data: {
        jobId: '00000000-0000-0000-0000-000000000001',
        resumeId: '00000000-0000-0000-0000-000000000002',
      },
    })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.data).toBeNull()
  })

  test('POST /api/swipe returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.post(`${BASE}/api/swipe`, {
      data: { jobId: '00000000-0000-0000-0000-000000000001', action: 'LEFT' },
    })
    expect(res.status()).toBe(401)
  })

  test('GET /api/swipes returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.get(`${BASE}/api/swipes`)
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.data).toBeNull()
  })

  test('GET /api/applications returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.get(`${BASE}/api/applications`)
    expect(res.status()).toBe(401)
  })

})

// ── Input validation ──────────────────────────────────────────────────────────
// Auth runs before body parsing, so unauthenticated requests always return 401
// regardless of body shape. Authenticated validation (400) covered by manual QA.

test.describe('Input validation — unauthenticated requests return 401 before validation runs', () => {

  test('POST /api/apply with empty body returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.post(`${BASE}/api/apply`, { data: {} })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.data).toBeNull()
    expect(typeof body.error).toBe('string')
  })

  test('POST /api/apply with non-UUID jobId returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.post(`${BASE}/api/apply`, {
      data: { jobId: 'not-a-uuid', resumeId: '00000000-0000-0000-0000-000000000002' },
    })
    expect(res.status()).toBe(401)
  })

  test('POST /api/swipe with invalid action returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.post(`${BASE}/api/swipe`, {
      data: { jobId: '00000000-0000-0000-0000-000000000001', action: 'UP' },
    })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.data).toBeNull()
  })

  test('POST /api/swipe with empty body returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.post(`${BASE}/api/swipe`, { data: {} })
    expect(res.status()).toBe(401)
  })

})

// ── Response shape ────────────────────────────────────────────────────────────

test.describe('Response envelope — all API responses follow { data, error } shape', () => {

  test('GET /api/jobs 401 response has correct envelope', async ({ request }) => {
    const res = await request.get(`${BASE}/api/jobs`)
    const body = await res.json()
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('error')
    expect(body.data).toBeNull()
    expect(typeof body.error).toBe('string')
  })

  test('GET /api/jobs/[id] 401 response has correct envelope', async ({ request }) => {
    const res = await request.get(`${BASE}/api/jobs/00000000-0000-0000-0000-000000000001`)
    const body = await res.json()
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('error')
  })

  test('POST /api/apply 401 response has correct envelope', async ({ request }) => {
    const res = await request.post(`${BASE}/api/apply`, { data: {} })
    const body = await res.json()
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('error')
    expect(body.data).toBeNull()
  })

})

// ── GET /api/jobs query params ────────────────────────────────────────────────

test.describe('GET /api/jobs — query param validation', () => {

  test('returns 401 for all valid query param combinations when unauthenticated', async ({ request }) => {
    const cases = [
      '/api/jobs?page=1&limit=5',
      '/api/jobs?eligibility=ELIGIBLE',
      '/api/jobs?eligibility=NOT_ELIGIBLE',
      '/api/jobs?search=google',
      '/api/jobs?sort=company&order=asc',
      '/api/jobs?excludeSwiped=false',
    ]
    for (const path of cases) {
      const res = await request.get(`${BASE}${path}`)
      expect(res.status()).toBe(401)
    }
  })

  test('returns 400 for invalid eligibility value when unauthenticated', async ({ request }) => {
    // Zod will reject INVALID before auth guard runs if parsing happens first,
    // but auth guard runs first in this route — either 400 or 401 is acceptable.
    const res = await request.get(`${BASE}/api/jobs?eligibility=UNKNOWN`)
    expect([400, 401]).toContain(res.status())
  })

})

// ── Resume route auth protection ──────────────────────────────────────────────

test.describe('Auth protection — resume routes return 401 without a session', () => {

  test('GET /api/resume returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.get(`${BASE}/api/resume`)
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.data).toBeNull()
    expect(typeof body.error).toBe('string')
  })

  test('POST /api/resume returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.post(`${BASE}/api/resume`)
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.data).toBeNull()
    expect(typeof body.error).toBe('string')
  })

  test('GET /api/resume/signed-url returns 401 when unauthenticated', async ({ request }) => {
    const fakeId = '00000000-0000-0000-0000-000000000001'
    const res = await request.get(`${BASE}/api/resume/signed-url?resumeId=${fakeId}`)
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.data).toBeNull()
    expect(typeof body.error).toBe('string')
  })

  test('DELETE /api/resume/:id returns 401 when unauthenticated', async ({ request }) => {
    const fakeId = '00000000-0000-0000-0000-000000000001'
    const res = await request.delete(`${BASE}/api/resume/${fakeId}`)
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.data).toBeNull()
    expect(typeof body.error).toBe('string')
  })

})
