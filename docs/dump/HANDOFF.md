# Handoff document

| Field        | Value                                |
|--------------|--------------------------------------|
| Project      | InternSwipe                          |
| Course       | CS 250                               |
| Author       | Bryan                                |
| Date         | March 22, 2026                       |
| Version      | 1.0                                  |

## Purpose

This document explains how to deploy InternSwipe, how to manage its data, and how to extend it with new features. It is written for any developer or team inheriting the project.

---

## 1. Deployment

### Local development

See the [README](../README.md) quick start section or [Environment Setup](process/environment-setup.md) for step-by-step instructions.

### Production deployment on Vercel

1. **Create a Vercel project:**
   - Go to [vercel.com](https://vercel.com) and import the GitHub repository.
   - Vercel auto-detects Next.js and configures the build settings.

2. **Set environment variables in Vercel:**
   - Go to Project Settings > Environment Variables.
   - Add all five variables from `.env.local.example`:
     - `DATABASE_URL` — use the **pooled** connection string from your Supabase cloud project.
     - `DIRECT_URL` — use the **direct** (non-pooled) connection string.
     - `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL.
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon key.
     - `SUPABASE_SERVICE_ROLE_KEY` — your Supabase service role key.

3. **Run migrations on the production database:**
   ```bash
   DATABASE_URL="<production-direct-url>" npx prisma migrate deploy
   ```

4. **Seed the production database (first time only):**
   ```bash
   DATABASE_URL="<production-pooled-url>" npx prisma db seed
   ```

5. **Deploy:**
   - Push to `main` — Vercel auto-deploys.
   - Preview deployments are created for every PR.

### Supabase cloud setup

1. Create a project at [supabase.com](https://supabase.com).
2. Under Authentication > Providers, ensure Email is enabled.
3. Under Storage, create a private bucket named `resumes`.
4. Copy the API keys and database URLs into your environment variables.

---

## 2. Adding new jobs to the database

### Option A: Edit the seed script

1. Open `prisma/seed.ts`.
2. Add new job objects to the jobs array:
   ```typescript
   {
     source: 'manual',
     company: 'Acme Corp',
     title: 'Software Engineering Intern',
     location: 'Remote',
     summary: 'Build internal tools...',
     url: 'https://acme.com/careers/123',
     eligibilityStatus: 'ELIGIBLE',
   }
   ```
3. Run `npx prisma db seed` to insert. The seed script uses `upsert` on the `[title, company]` unique constraint, so re-running is safe.

### Option B: Insert directly via Prisma Studio

1. Run `npx prisma studio` to open the database GUI.
2. Navigate to the `Job` table.
3. Click "Add record" and fill in the fields.
4. `eligibilityStatus` must be either `ELIGIBLE` or `NOT_ELIGIBLE`.

### Option C: Insert via SQL

Connect to the database and run:

```sql
INSERT INTO jobs (id, source, company, title, location, summary, url, eligibility_status, created_at)
VALUES (gen_random_uuid(), 'manual', 'Acme Corp', 'SWE Intern', 'Remote', 'Build tools...', 'https://acme.com/jobs/1', 'ELIGIBLE', now());
```

---

## 3. Extending the system

### Adding a new API route

1. Create a new directory under `src/app/api/<route-name>/`.
2. Create `route.ts` with your handler functions (`GET`, `POST`, etc.).
3. Protect the route with the auth guard:
   ```typescript
   import { requireAuth } from '@/lib/auth-guard'

   export async function GET() {
     const auth = await requireAuth()
     if (auth.response) return auth.response

     const userId = auth.session.user.id
     // ... your logic
   }
   ```
4. Add validation with a Zod schema in `src/lib/validation.ts`.
5. Return the standard `{ data, error }` envelope:
   ```typescript
   return NextResponse.json({ data: result, error: null }, { status: 200 })
   ```

### Adding rate limiting to a route

1. Import `RateLimiter` from `src/lib/rate-limit.ts`.
2. Create a limiter instance:
   ```typescript
   import { RateLimiter } from '@/lib/rate-limit'
   const myLimiter = new RateLimiter(20, 60_000) // 20 req/min
   ```
3. Call `myLimiter.check(userId)` after auth and return 429 if `!allowed`.

### Adding a new database table

1. Add the model to `prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name add_<table_name>` to create and apply the migration.
3. Run `npx prisma generate` to regenerate the client types.
4. Import the new type from `@/generated/prisma` in your route handler.

### Adding resume upload

The signed URL endpoint (`GET /api/resume/signed-url`) is already built. To complete the upload flow:

1. Create a `POST /api/resume/upload` route that:
   - Accepts a `multipart/form-data` request with a PDF file.
   - Validates file type (PDF only) and size (5 MB max).
   - Uploads the file to the `resumes` bucket in Supabase Storage.
   - Creates a `Resume` record in the database with the `storagePath`.
2. The existing signed URL endpoint will then generate download URLs for any uploaded resume.

### Adding a new frontend page

1. Create a directory under `src/app/(app)/<page-name>/`.
2. Create `page.tsx` with your React component.
3. The `(app)` route group shares the authenticated layout.
4. Use the browser Supabase client (`src/lib/supabase/client.ts`) for client-side data fetching.

---

## 4. Key architectural decisions

| Decision | Rationale |
|----------|-----------|
| In-memory rate limiter (not Redis) | Simple single-instance deployment. If scaling to multiple instances, replace with Redis or a database-backed counter. |
| Service role client for signed URLs | Bypasses RLS so the server can generate URLs for any file the user owns (after ownership check). The anon key cannot access private buckets. |
| Prisma with PrismaPg adapter | Required for Supabase's connection pooler (PgBouncer). Standard Prisma PostgreSQL driver does not work with pooled connections. |
| `requireAuth()` pattern (not Next.js middleware) | Next.js middleware runs at the edge and cannot access the Prisma client or perform database lookups. Route-level auth guards allow richer authorization logic. |
| Zod for validation | Provides runtime validation with TypeScript type inference. Schemas are colocated in a single file for consistency. |

---

## 5. Known limitations

- **In-memory rate limiter resets on server restart.** This is acceptable for a class project but would need Redis or a database for production.
- **No resume upload UI.** The signed URL endpoint exists but the upload flow (selecting a file, uploading to Supabase Storage, creating the Resume record) is not built.
- **No frontend UI for most features.** The API layer is complete but the swipe deck, profile form, history view, and login/signup pages need frontend work.
- **No Playwright E2E tests.** Only unit tests exist.
- **No Vercel deployment.** The app runs locally only.

---

## 6. Contact

For questions about the codebase, contact Bryan (product owner and technical lead).
