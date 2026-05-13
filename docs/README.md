# InternSwipe

A Tinder-style internship discovery and application tracker built for CS 250 by a four-person team.

| Field | Value |
|-------|-------|
| Course | CS 250 |
| Team | Bryan (Product Owner), Talan (Design/Frontend Lead), Matt (Backend Systems Lead), Brandon (Infrastructure/Quality Lead) |
| Timeline | February 16 - March 15, 2026 |
| Status | v1.0 shipped — post-launch maintenance |
| Last updated | May 6, 2026 |
| License | MIT |

## What is InternSwipe?

InternSwipe lets students discover internship opportunities by swiping through job cards -- swipe right to apply, swipe left to skip. The app tracks application status, manages resumes, and filters jobs by eligibility so students only see positions they can actually apply to.

## Tech stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript (strict mode) | 5.9.3 |
| Styling | Tailwind CSS | 4.2.0 |
| ORM | Prisma (PrismaPg adapter) | 7.4.1 |
| Database | PostgreSQL via Supabase | Managed |
| Authentication | Supabase Auth | Email/password |
| File Storage | Supabase Storage | Private bucket, signed URLs |
| Validation | Zod | 4.3.6 |
| Unit Testing | Vitest | Latest |

## Architecture

_Section last updated: May 12, 2026 — synced with route handlers in `src/app/api/`._

```
src/
├── app/
│   ├── layout.tsx                    # Root layout with metadata
│   ├── page.tsx                      # Landing page
│   ├── (app)/deck/page.tsx           # Swipe deck UI
│   └── api/
│       ├── auth/
│       │   ├── signup/route.ts          # POST - create account
│       │   ├── login/route.ts           # POST - sign in
│       │   ├── logout/route.ts          # POST - sign out
│       │   └── delete-account/route.ts  # DELETE - delete account and related data
│       ├── profile/route.ts             # GET/PUT - user profile
│       ├── jobs/
│       │   ├── route.ts                 # GET - paginated/filtered jobs
│       │   └── [id]/route.ts            # GET - single job by id
│       ├── swipe/route.ts               # POST - record swipe action
│       ├── swipes/route.ts              # GET - user's swipe history
│       ├── bookmarks/route.ts           # GET - bookmarked jobs
│       ├── matches/route.ts             # GET - matched jobs with score
│       ├── apply/route.ts               # POST - submit application (rate limited)
│       ├── applications/
│       │   ├── route.ts                 # GET - user's applications
│       │   └── [id]/route.ts            # GET - single application
│       └── resume/
│           ├── route.ts                 # GET/POST - list and upload resumes
│           ├── [id]/route.ts            # PATCH/DELETE - set master or delete
│           └── signed-url/route.ts      # GET - signed URL for resume download
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── validation.ts                 # Zod schemas for all inputs
│   ├── auth-guard.ts                 # Centralized auth guard (requireAuth)
│   ├── rate-limit.ts                 # In-memory sliding-window rate limiter
│   └── supabase/
│       ├── server.ts                 # Server-side Supabase client
│       └── client.ts                 # Browser-side Supabase client
├── middleware.ts                     # Session refresh on every request
└── types/
    └── index.ts                      # ApiResponse<T> interface

prisma/
├── schema.prisma                     # 7 models (see Database Schema below)
├── seed.ts                           # Seeds 25 jobs (15 ELIGIBLE, 10 NOT_ELIGIBLE)
└── migrations/                       # Version-controlled migrations
```

### Request lifecycle

1. **Middleware** (`src/middleware.ts`) intercepts every request and refreshes the Supabase session cookie.
2. **Auth guard** (`src/lib/auth-guard.ts`) is called by each protected route handler. If no valid session exists, it returns a `401 Unauthorized` response immediately.
3. **Validation** — request bodies are parsed with Zod schemas (`src/lib/validation.ts`) before any business logic runs.
4. **Rate limiting** — `POST /api/apply` passes through an in-memory sliding-window rate limiter (10 req/min/user) before processing.
5. **Business logic** — Prisma queries against PostgreSQL via Supabase.
6. **Response** — all routes return the standard `{ data, error }` envelope via `ApiResponse<T>`.

## Database schema

The application uses 7 tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts linked to Supabase Auth |
| `profiles` | User profile data (name, phone, links, preferences) |
| `resumes` | Resume file metadata (filename, storage path, master flag) |
| `jobs` | Internship listings with eligibility flags |
| `swipe_actions` | LEFT/RIGHT swipe history |
| `applications` | Job application records (APPLIED/FAILED/PENDING) |
| `submission_logs` | Attempt tracking per application with error messages |

## Security

| Feature | Implementation |
|---------|---------------|
| Auth guard | Centralized `requireAuth()` helper returns 401 for unauthenticated requests. Applied to all protected routes (profile, jobs, swipe, apply, applications, resume/signed-url). |
| Rate limiting | Sliding-window in-memory limiter on `POST /api/apply`. 10 requests per minute per user. Returns 429 with `Retry-After` header. |
| Signed URLs | `GET /api/resume/signed-url` generates 15-minute expiry URLs via Supabase Storage service role client. Validates resume ownership before generating. |
| Session refresh | Middleware refreshes auth cookies on every request to prevent session expiry. |
| Secrets | All credentials stored in `.env.local` (gitignored). Only placeholder values in `.env.local.example`. |

## Quick start

### Prerequisites

- Node.js 18+
- npm 9+
- Git
- Access to the shared Supabase Cloud project (ask the current project owner)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/InternSwipe/InternSwipe.git
cd InternSwipe

# 2. Configure environment variables
cp .env.local.example .env.local
#    Fill in the Supabase Cloud credentials in the env.local.example from the project dashboard.

# 3. Install dependencies
npm install

# 5. Generate Prisma client
npx prisma generate

# 7. Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm install` fails with permission errors. | Do not use `sudo` with npm. If you see permission errors, fix your Node.js installation or use a version manager such as `nvm`. |
| Prisma client import fails with `Can't resolve '@/generated/prisma'`. | Run `npx prisma generate` — the client output dir (`src/generated/prisma`) is gitignored and must be generated locally. |
| App crashes at startup with "Your project's URL and Key are required to create a Supabase client". | `.env.local` is missing or has empty Supabase values. Confirm all five env vars are filled in. |
| Prisma operations fail with a connection error. | Verify `DATABASE_URL` and `DIRECT_URL` in `.env.local` are correct, and that your IP isn't blocked in Supabase's network settings. |
| The development server starts but the page shows a blank screen. | Open the browser developer console and check for JavaScript errors. Verify that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly. |
| Sign-up does not work. | Verify that email authentication is enabled in the Supabase dashboard under Authentication → Providers. |

## API endpoints

_Section last updated: May 12, 2026 — synced with route handlers in `src/app/api/`._

| Method | Path | Auth | Rate Limited | Description |
|--------|------|------|-------------|-------------|
| POST | `/api/auth/signup` | No | No | Create a new account |
| POST | `/api/auth/login` | No | No | Sign in with email/password |
| POST | `/api/auth/logout` | No | No | Sign out and clear session |
| DELETE | `/api/auth/delete-account` | Yes | No | Delete the authenticated user's account and all related data |
| GET | `/api/profile` | Yes | No | Get user profile |
| PUT | `/api/profile` | Yes | No | Create or update user profile |
| GET | `/api/jobs` | Yes | No | Get paginated/filtered/sorted jobs |
| GET | `/api/jobs/[id]` | Yes | No | Get a single job by id |
| POST | `/api/swipe` | Yes | No | Record a swipe action (LEFT/RIGHT) |
| GET | `/api/swipes` | Yes | No | List the user's swipe history |
| GET | `/api/bookmarks` | Yes | No | List jobs the user bookmarked (swipe action = BOOKMARK) |
| GET | `/api/matches` | Yes | No | List matched jobs with computed score and application status |
| POST | `/api/apply` | Yes | 10/min | Submit a job application. **Reserved — not wired up to the UI as of v1.2.** Right-swipe currently only creates a match record; auto-submission is planned for a future release. Endpoint kept intact so the existing rate-limiter, validation, and submission-log plumbing don't have to be rebuilt when the feature returns. |
| GET | `/api/applications` | Yes | No | Get user's application history. Returns legacy quick-apply submissions; no new rows are written under the current match-only flow. |
| GET | `/api/applications/[id]` | Yes | No | Get a single application with job, resume, and submission logs |
| GET | `/api/resume` | Yes | No | List the authenticated user's resumes |
| POST | `/api/resume` | Yes | No | Upload a new resume (PDF, max 5 MB, max 5 per user) |
| PATCH | `/api/resume/[id]` | Yes | No | Set a resume as the user's master (primary) |
| DELETE | `/api/resume/[id]` | Yes | No | Delete one of the user's resumes |
| GET | `/api/resume/signed-url` | Yes | No | Get a 15-min signed URL for a resume file |

### Query parameters for `GET /api/jobs`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (min 1) |
| `limit` | number | 20 | Results per page (1-100) |
| `eligibility` | string | — | Filter: `ELIGIBLE` or `NOT_ELIGIBLE` |
| `company` | string | — | Filter by company name (case-insensitive) |
| `search` | string | — | Search across title, company, summary, location |
| `sort` | string | `created_at` | Sort field: `created_at`, `company`, or `title` |
| `order` | string | `desc` | Sort order: `asc` or `desc` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint on `src/` |
| `npx vitest` | Run unit tests |
| `npx prisma migrate dev` | Apply database migrations |
| `npx prisma db seed` | Seed the database with jobs |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma studio` | Open Prisma Studio (database GUI) |
| `npm run ingest:jobs` | Seeds from ingest-jobs.ts |

## Documentation

Project documentation lives in the [`docs/`](docs/) folder, organized by topic:

| Document | Description |
|----------|-------------|
| [Milestones](docs/project/milestones.md) | Sprint breakdowns and exit criteria |
| [Tech Stack](docs/project/tech-stack.md) | Technology choices and rationale |
| [Definition of Done](docs/project/definition-of-done.md) | Story / PR / bug-fix completion checklist |
| [Weekly Ceremonies](docs/project/weekly-ceremonies.md) | Standup, review, retro format and schedule |
| [Branching Strategy](docs/process/branching-strategy.md) | Git workflow and PR rules |
| [Release Checklist](docs/process/release-checklist.md) | Pre-launch verification |
| [Release Notes — v1.0](docs/releases/RELEASE-NOTES-v1.0.md) | v1.0 feature summary (historical snapshot) |
| [Handoff Document](docs/HANDOFF.md) | Deployment and extension guide |
| [Team — Bryan](docs/team/bryan.md) | Product owner / API / DB schema responsibilities |
| [Team — Talan](docs/team/talan.md) | Swipe deck UI / profile flows / design system responsibilities |
| [Team — Matt](docs/team/matt.md) | Job ingestion / eligibility engine / backend endpoints responsibilities |
| [Team — Brandon](docs/team/brandon.md) | CI/CD / testing / deployment / security responsibilities |

## License

MIT -- see [LICENSE](LICENSE) for details.
