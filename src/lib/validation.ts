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

export const jobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  eligibility: z.enum(['ELIGIBLE', 'NOT_ELIGIBLE']).optional(),
  company: z.string().min(1).optional(),
  search: z.string().min(1).optional(),
  sort: z.enum(['created_at', 'company', 'title']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type SwipeInput = z.infer<typeof swipeSchema>
export type ApplyInput = z.infer<typeof applySchema>
export type JobsQueryInput = z.infer<typeof jobsQuerySchema>

/**
 * Formats a Zod error into a user-friendly string.
 * Instead of dumping the raw JSON error, returns a comma-separated
 * list of human-readable messages like:
 *   "A valid email address is required, Password must be at least 8 characters"
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(', ')
}

/**
 * Returns a safe error message for API responses.
 * Prevents leaking internal details (stack traces, DB errors) to the client.
 */
export function safeErrorMessage(err: unknown): string {
  if (err instanceof z.ZodError) {
    return formatZodError(err)
  }
  if (err instanceof Error) {
    // Only surface messages that are clearly user-facing.
    // Prisma and other internal errors get a generic message.
    if (err.message.startsWith('Invalid') || err.message.startsWith('Unauthorized')) {
      return err.message
    }
  }
  return 'Something went wrong. Please try again later.'
}
