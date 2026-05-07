import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  signupSchema,
  loginSchema,
  profileUpdateSchema,
  swipeSchema,
  applySchema,
  jobsQuerySchema,
  formatZodError,
  safeErrorMessage,
} from '@/lib/validation'

describe('formatZodError', () => {
  it('formats a single field error into a readable string', () => {
    const result = signupSchema.safeParse({ email: 'bad', password: '12345678' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const msg = formatZodError(result.error)
      expect(msg).toBe('A valid email address is required')
    }
  })

  it('formats multiple field errors into comma-separated messages', () => {
    const result = signupSchema.safeParse({ email: 'bad', password: 'short' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const msg = formatZodError(result.error)
      expect(msg).toContain('A valid email address is required')
      expect(msg).toContain('Password must be at least 8 characters')
      expect(msg).toContain(', ')
    }
  })
})

describe('safeErrorMessage', () => {
  it('returns a generic message for unknown errors', () => {
    expect(safeErrorMessage('string error')).toBe('Something went wrong. Please try again later.')
  })

  it('returns a generic message for internal Error objects', () => {
    expect(safeErrorMessage(new Error('PrismaClientKnownRequestError'))).toBe(
      'Something went wrong. Please try again later.',
    )
  })

  it('passes through messages starting with "Invalid"', () => {
    expect(safeErrorMessage(new Error('Invalid token'))).toBe('Invalid token')
  })

  it('passes through messages starting with "Unauthorized"', () => {
    expect(safeErrorMessage(new Error('Unauthorized access'))).toBe('Unauthorized access')
  })

  it('formats ZodError into readable messages', () => {
    // Trigger a real ZodError via schema validation
    const result = signupSchema.safeParse({ email: 'test@test.com', password: 'short' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(safeErrorMessage(result.error)).toBe('Password must be at least 8 characters')
    }
  })
})

describe('signupSchema', () => {
  it('accepts valid input', () => {
    const result = signupSchema.safeParse({ email: 'test@example.com', password: 'password123' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = signupSchema.safeParse({ email: 'not-an-email', password: 'password123' })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = signupSchema.safeParse({ email: 'test@example.com', password: 'short' })
    expect(result.success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('accepts valid input', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'x' })
    expect(result.success).toBe(true)
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '' })
    expect(result.success).toBe(false)
  })
})

describe('profileUpdateSchema', () => {
  it('accepts valid input with only name', () => {
    const result = profileUpdateSchema.safeParse({ name: 'Bryan' })
    expect(result.success).toBe(true)
  })

  it('accepts full input', () => {
    const result = profileUpdateSchema.safeParse({
      name: 'Bryan',
      phone: '555-1234',
      links: { github: 'https://github.com/bryan' },
      preferencesJson: { theme: 'dark' },
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = profileUpdateSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })
})

describe('swipeSchema', () => {
  it('accepts LEFT', () => {
    const result = swipeSchema.safeParse({
      jobId: '550e8400-e29b-41d4-a716-446655440000',
      action: 'LEFT',
    })
    expect(result.success).toBe(true)
  })

  it('accepts RIGHT', () => {
    const result = swipeSchema.safeParse({
      jobId: '550e8400-e29b-41d4-a716-446655440000',
      action: 'RIGHT',
    })
    expect(result.success).toBe(true)
  })

  it('accepts BOOKMARK', () => {
    const result = swipeSchema.safeParse({
      jobId: '550e8400-e29b-41d4-a716-446655440000',
      action: 'BOOKMARK',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid action', () => {
    const result = swipeSchema.safeParse({
      jobId: '550e8400-e29b-41d4-a716-446655440000',
      action: 'UP',
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-UUID jobId', () => {
    const result = swipeSchema.safeParse({ jobId: 'not-a-uuid', action: 'LEFT' })
    expect(result.success).toBe(false)
  })
})

describe('applySchema', () => {
  it('accepts valid UUIDs', () => {
    const result = applySchema.safeParse({
      jobId: '550e8400-e29b-41d4-a716-446655440000',
      resumeId: '660e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing resumeId', () => {
    const result = applySchema.safeParse({
      jobId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(false)
  })
})

describe('jobsQuerySchema', () => {
  it('applies defaults for empty input', () => {
    const result = jobsQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
      expect(result.data.sort).toBe('created_at')
      expect(result.data.order).toBe('desc')
    }
  })

  it('accepts all filters', () => {
    const result = jobsQuerySchema.safeParse({
      page: '2',
      limit: '50',
      eligibility: 'ELIGIBLE',
      company: 'Acme',
      search: 'intern',
      sort: 'company',
      order: 'asc',
    })
    expect(result.success).toBe(true)
  })

  it('rejects page below 1', () => {
    const result = jobsQuerySchema.safeParse({ page: '0' })
    expect(result.success).toBe(false)
  })

  it('rejects limit above 100', () => {
    const result = jobsQuerySchema.safeParse({ limit: '101' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid eligibility value', () => {
    const result = jobsQuerySchema.safeParse({ eligibility: 'MAYBE' })
    expect(result.success).toBe(false)
  })
})
