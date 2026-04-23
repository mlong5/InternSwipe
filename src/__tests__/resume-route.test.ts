import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => {
  const upload = vi.fn()
  const from = vi.fn(() => ({ upload }))
  const createClient = vi.fn(() => ({
    storage: { from },
  }))

  const requireAuth = vi.fn()

  const resumeCreate = vi.fn()
  const resumeFindMany = vi.fn()

  return {
    upload,
    from,
    createClient,
    requireAuth,
    resumeCreate,
    resumeFindMany,
  }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: mocks.createClient,
}))

vi.mock('@/lib/auth-guard', () => ({
  requireAuth: mocks.requireAuth,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    resume: {
      create: mocks.resumeCreate,
      findMany: mocks.resumeFindMany,
    },
  },
}))

import { POST } from '@/app/api/resume/route'

function makeRequestWithFormData(formData: FormData): NextRequest {
  return {
    formData: vi.fn().mockResolvedValue(formData),
  } as unknown as NextRequest
}

describe('POST /api/resume', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.requireAuth.mockResolvedValue({
      user: { id: 'user-1' },
      response: null,
    })

    mocks.upload.mockResolvedValue({ error: null })
    mocks.resumeCreate.mockResolvedValue({
      id: 'resume-1',
      userId: 'user-1',
      filename: 'resume.pdf',
      storagePath: 'user-1/resume-1.pdf',
      fileSize: 1200,
    })
  })

  it('returns 400 when file is missing', async () => {
    const formData = new FormData()
    const request = makeRequestWithFormData(formData)

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('A file is required')
  })

  it('returns 400 when file is not a PDF', async () => {
    const formData = new FormData()
    formData.set('file', new File(['hello'], 'resume.txt', { type: 'text/plain' }))
    const request = makeRequestWithFormData(formData)

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Only PDF files are accepted')
  })

  it('returns 500 when storage upload fails', async () => {
    mocks.upload.mockResolvedValue({ error: { message: 'Storage upload failed' } })

    const formData = new FormData()
    formData.set('file', new File(['%PDF-1.4'], 'resume.pdf', { type: 'application/pdf' }))
    const request = makeRequestWithFormData(formData)

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Storage upload failed')
    expect(mocks.resumeCreate).not.toHaveBeenCalled()
  })

  it('returns 201 for a valid PDF upload', async () => {
    const formData = new FormData()
    formData.set('file', new File(['%PDF-1.4'], 'resume.pdf', { type: 'application/pdf' }))
    const request = makeRequestWithFormData(formData)

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.error).toBeNull()
    expect(mocks.from).toHaveBeenCalledWith('resumes')
    expect(mocks.upload).toHaveBeenCalledOnce()
    expect(mocks.resumeCreate).toHaveBeenCalledOnce()
  })
})
