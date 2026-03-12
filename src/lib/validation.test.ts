import { describe, it, expect } from 'vitest'
import { signupSchema } from './validation'

  describe('signupSchema', () => {
    it('accepts a valid email and password', () => {
      const result = signupSchema.safeParse({ email: 'test@example.com', password: 'password123' })
      expect(result.success).toBe(true)
    })

    it('rejects an invalid email', () => {
      const result = signupSchema.safeParse({ email: 'notanemail', password: 'password123' })
      expect(result.success).toBe(false)
    })
  })