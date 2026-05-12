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

```
src/
├── app/
│   ├── layout.tsx                    # Root layout with metadata
│   ├── page.tsx                      # Landing page
│   ├── (app)/deck/page.tsx           # Swipe deck UI
│   └── api/
│       ├── auth/
│       │   ├── signup/route.ts       # POST - create account
│       │   ├── login/route.ts        # POST - sign in
│       │   └── logout/route.ts       # POST - sign out
│       ├── profile/route.ts          # GET/PUT - user profile
│       ├── jobs/route.ts             # GET - paginated/filtered jobs
│       ├── swipe/route.ts            # POST - record swipe action
│       ├── apply/route.ts            # POST - submit application (rate limited)
│       ├── applications/route.ts     # GET - user's applications
│       └── resume/
│           └── signed-url/route.ts   # GET - signed URL for resume download
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

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.local.example .env.local
# Fill in the Supabase Cloud credentials from the project dashboard.

# 4. Run database migrations
npx prisma migrate dev

# 5. Generate Prisma client
npx prisma generate

# 6. Seed the database
npx prisma db seed

# 7. Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment variables

| Variable | Required | Description | Where to find it |
|----------|----------|-------------|------------------|
| `DATABASE_URL` | Yes | Pooled PostgreSQL connection string | Supabase dashboard > Settings > Database (Pooled) |
| `DIRECT_URL` | Yes | Direct PostgreSQL connection (for migrations) | Supabase dashboard > Settings > Database (Direct) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | Supabase dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anonymous public key (safe for browser) | Supabase dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server-only, never expose to browser) | Supabase dashboard > Settings > API |

## API endpoints

| Method | Path | Auth | Rate Limited | Description |
|--------|------|------|-------------|-------------|
| POST | `/api/auth/signup` | No | No | Create a new account |
| POST | `/api/auth/login` | No | No | Sign in with email/password |
| POST | `/api/auth/logout` | No | No | Sign out and clear session |
| GET | `/api/profile` | Yes | No | Get user profile |
| PUT | `/api/profile` | Yes | No | Create or update user profile |
| GET | `/api/jobs` | Yes | No | Get paginated/filtered/sorted jobs |
| POST | `/api/swipe` | Yes | No | Record a swipe action (LEFT/RIGHT) |
| POST | `/api/apply` | Yes | 10/min | Submit a job application |
| GET | `/api/applications` | Yes | No | Get user's application history |
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

## Documentation

Project documentation lives in the [`docs/`](docs/) folder, organized by topic:

| Document | Description |
|----------|-------------|
| [Milestones](docs/project/milestones.md) | Sprint breakdowns and exit criteria |
| [Tech Stack](docs/project/tech-stack.md) | Technology choices and rationale |
| [Definition of Done](docs/project/definition-of-done.md) | Story / PR / bug-fix completion checklist |
| [Weekly Ceremonies](docs/project/weekly-ceremonies.md) | Standup, review, retro format and schedule |
| [Environment Setup](docs/process/environment-setup.md) | Local setup guide |
| [Branching Strategy](docs/process/branching-strategy.md) | Git workflow and PR rules |
| [Release Checklist](docs/process/release-checklist.md) | Pre-launch verification |
| [Release Notes](docs/RELEASE-NOTES-v1.0.md) | v1.0 feature summary |
| [Handoff Document](docs/HANDOFF.md) | Deployment and extension guide |
| [Team — Bryan](docs/team/bryan.md) | Product owner / API / DB schema responsibilities |
| [Team — Talan](docs/team/talan.md) | Swipe deck UI / profile flows / design system responsibilities |
| [Team — Matt](docs/team/matt.md) | Job ingestion / eligibility engine / backend endpoints responsibilities |
| [Team — Brandon](docs/team/brandon.md) | CI/CD / testing / deployment / security responsibilities |

## License

MIT -- see [LICENSE](LICENSE) for details.
