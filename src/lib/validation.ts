import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().email('A valid email address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('A valid email address is required'),
  password: z.string().min(1, 'Password is required'),
})

export const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  links: z.record(z.string(), z.string()).optional(),
  preferencesJson: z.record(z.string(), z.unknown()).optional(),
})

export const swipeSchema = z.object({
  jobId: z.string().uuid('A valid job ID is required'),
  action: z.enum(['LEFT', 'RIGHT']),
})

export const applySchema = z.object({
  jobId: z.string().uuid('A valid job ID is required'),
  resumeId: z.string().uuid('A valid resume ID is required'),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type SwipeInput = z.infer<typeof swipeSchema>
export type ApplyInput = z.infer<typeof applySchema>
