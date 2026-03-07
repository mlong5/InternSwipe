# InternSwipe

A Tinder-style internship discovery and application tracker built for CS 250 by a four-person team.

| Field | Value |
|-------|-------|
| Course | CS 250 |
| Team | Bryan (Product Owner), Talan (Design/Frontend Lead), Matt (Backend Systems Lead), Brandon (Infrastructure/Quality Lead) |
| Timeline | February 16 - March 15, 2026 |
| Status | Week 3 (in progress) |
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
| File Storage | Supabase Storage | Private bucket (planned) |
| Validation | Zod | 4.3.6 |
| Deployment | Vercel | Not yet configured |
| CI/CD | GitHub Actions | Not yet configured |
| E2E Testing | Playwright | Not yet configured |
| Unit Testing | Vitest | Not yet configured |

## Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Landing page
│   └── api/
│       ├── auth/
│       │   ├── signup/route.ts # POST - create account via Supabase Auth
│       │   ├── login/route.ts  # POST - sign in
│       │   └── logout/route.ts # POST - sign out
│       ├── profile/route.ts    # GET/POST - user profile
│       ├── swipe/route.ts      # POST - record swipe action
│       ├── apply/route.ts      # POST - submit job application
│       └── applications/route.ts # GET - user's applications
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── validation.ts           # Zod schemas for all inputs
│   └── supabase/
│       ├── server.ts           # Server-side Supabase client
│       └── client.ts           # Browser-side Supabase client
└── types/
    └── index.ts                # ApiResponse<T> interface

prisma/
├── schema.prisma               # 7 models: User, Profile, Resume, Job, SwipeAction, Application, SubmissionLog
├── seed.ts                     # Seeds 25 jobs (15 ELIGIBLE, 10 NOT_ELIGIBLE)
└── migrations/                 # Version-controlled migrations
```

## Database schema

The application uses 7 tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts linked to Supabase Auth |
| `profiles` | User profile data (name, phone, links, preferences) |
| `resumes` | Resume file metadata (filename, path, master flag) |
| `jobs` | Internship listings with eligibility flags |
| `swipe_actions` | LEFT/RIGHT swipe history |
| `applications` | Job application records (APPLIED/FAILED/PENDING) |
| `submission_logs` | Attempt tracking with error messages |

## Quick start

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/BryanD17/InternSwipe.git
cd InternSwipe

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.local.example .env.local
# Fill in Supabase credentials (see Environment Variables below)

# 4. Run database migrations
npx prisma migrate dev

# 5. Seed the database
npx prisma db seed

# 6. Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment variables

| Variable | Description | Where to find it |
|----------|-------------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anonymous public key | Supabase dashboard > Settings > API |
| `DATABASE_URL` | Pooled PostgreSQL connection string | Supabase dashboard > Settings > Database |
| `DIRECT_URL` | Direct PostgreSQL connection (for migrations) | Supabase dashboard > Settings > Database |

## API endpoints

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| POST | `/api/auth/signup` | Create a new account | Done |
| POST | `/api/auth/login` | Sign in | Done |
| POST | `/api/auth/logout` | Sign out | Done |
| GET/POST | `/api/profile` | Get or update user profile | Done |
| POST | `/api/swipe` | Record a swipe action | Done |
| POST | `/api/apply` | Submit a job application | Done |
| GET | `/api/applications` | Get user's applications | Done |
| GET | `/api/jobs` | Get paginated/filtered jobs | Done |

## Current status (as of March 5, 2026)

### What's done
- Full database schema with 7 tables and Prisma migrations
- Supabase Auth integration (signup, login, logout)
- All 7 API route handlers implemented
- Zod validation on all endpoints
- Seed script with 25 curated jobs (15 ELIGIBLE, 10 NOT_ELIGIBLE)
- Apply pipeline with duplicate prevention and submission logging
- Supabase local development configured
- Comprehensive project documentation

### What's in progress
- UI skeleton (page routes exist, components not yet built)
- Swipe deck animations
- Profile UI with validation

### What's not started
- Frontend UI components (swipe cards, profile forms, history view)
- Resume upload to Supabase Storage
- GitHub Actions CI/CD pipeline
- Playwright E2E tests and Vitest unit tests
- Vercel deployment
- Auth guards on all routes
- Rate limiting
- Responsive design and accessibility

## Documentation

All project documentation is in the [`docs/`](docs/) folder. Start with [`docs/README.md`](docs/README.md) for a full index.

## License

MIT -- see [LICENSE](LICENSE) for details.
