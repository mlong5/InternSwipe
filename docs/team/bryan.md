# Bryan -- task breakdown

| Field        | Value                                |
|--------------|--------------------------------------|
| Project      | InternSwipe                          |
| Course       | CS 250                               |
| Owner        | Bryan                                |
| Last updated | March 22, 2026                       |
| Version      | 4.0                                  |

## Contribution status (as of March 22, 2026)

| Week | Expected deliverables | Actual status |
|------|----------------------|---------------|
| Week 1 | DB schema, Prisma migrations, seed script, vertical slice integration | **Done** -- all backend deliverables completed (schema, migrations, seed, all 7 API routes, Supabase Auth) |
| Week 2 | Job ingestion, `GET /api/jobs`, apply pipeline | **Done** -- apply pipeline done (POST /api/apply with validation, duplicate prevention, submission logging); `GET /api/jobs` implemented with pagination, eligibility/company/search filtering, and sorting |
| Week 3 | Profile/resume polish, security baseline, midterm demo | **Partial** -- security baseline **done** (auth guards on all protected routes, rate limiting on POST /api/apply at 10 req/min/user, signed URLs for resume access with 15-min expiry). Profile/resume upload polish blocked (requires Talan). Midterm demo rehearsal not done. |
| Week 4 | E2E verification, README, handoff doc, release notes, tests, error messages | **Done** (solo tasks) -- README rewritten with full setup/architecture/API/security docs; handoff document written; release notes written; error messages improved across all routes with `formatZodError` and `safeErrorMessage`; 33 unit tests passing (rate limiter + validation); vitest configured. Blocked: final demo, v1.0 tag, release checklist sign-off (requires full team). |

**Git commits:** 9 commits (Bryan) + 3 commits (Claude, assisted by Bryan)
**Blocked items:** Vertical slice (Session D) blocked because UI skeleton was not built by Talan/Brandon. Profile/resume upload polish blocked on Talan. Final demo and v1.0 tag require full team.

## Role summary

Bryan serves as the product owner and technical lead for InternSwipe. He is responsible for backlog management, API design, the application submission service, the database schema, and all Prisma migrations. Bryan holds final approval authority on pull requests targeting the release branch, meaning no code ships to production without his explicit sign-off. He is accountable for ensuring that the backend data model and API contracts are correct, consistent, and well-documented throughout the project lifecycle.

## Primary deliverables by week

### Week 1 (February 16 - February 22, 2026)

- Lead Session B with Matt: design and implement the database schema covering all seven MVP tables, configure the Supabase project, write the Prisma schema file, run the first migration, and seed the Jobs table with 20 to 30 curated internship postings that include eligibility flags. (Done)
- Pair on Session D: connect the authentication, profile, swipe, and history features into a working vertical slice that demonstrates the core user flow end to end. (In progress)
- Deliverables: the Prisma schema is committed to the repository, the first migration has been applied successfully, the seed script runs without errors, and 20 or more jobs are present in the database with correct eligibility flags.

### Week 2 (February 23 - March 1, 2026)

- Lead Sessions A and C, paired with Matt.
- Session A: support Matt on the job ingestion MVP and the `GET /api/jobs` endpoint, ensuring the endpoint returns paginated and filtered results.
- Session C: build the apply pipeline stub by implementing the `POST /api/apply` endpoint. This endpoint must validate that the user has a resume and that the job is eligible, create an Application record, create a SubmissionLog entry, and block duplicate submissions for the same user-job pair. — **done**
- Deliverables: the `POST /api/apply` endpoint is working correctly, Application and SubmissionLog records are created for every submission attempt, and duplicate submissions are blocked with an appropriate error message. — **done**

### Week 3 (March 2 - March 8, 2026)

- Lead Sessions A and C, paired with Talan and Brandon respectively.
- Session A: polish the profile and resume upload flows with Talan, ensuring that the upload experience is smooth and that validation errors are clearly communicated to the user.
- Session C: implement the security baseline with Brandon. This includes signed URLs for resume file access with a 15-minute expiry, auth guard middleware on all API routes that returns a 401 status for unauthenticated requests, and rate limiting on the `POST /api/apply` endpoint at 10 requests per minute per user. — **done** (all three implemented: `requireAuth()` guard on all 5 protected routes, `RateLimiter` class with sliding window on apply endpoint, `GET /api/resume/signed-url` with 15-min Supabase Storage signed URLs)
- Session D: participate in the midterm demo rehearsal with all four team members, walking through every key flow in a live browser.
- Deliverables: signed URLs are working and expiring correctly after 15 minutes, auth guards are active on all protected routes, rate limiting is enforced on the apply endpoint, security measures have been verified through manual testing, and the midterm demo rehearsal has been completed. — **security baseline done; midterm demo not done**

### Week 4 (March 9 - March 15, 2026)

- Lead Session C, paired with Matt.
- Session C: conduct full end-to-end flow verification by walking through the complete user journey from sign-up through the history view. This includes retrying a failed application and verifying that all statuses and timestamps are correct in the database and in the UI.
- Participate in Sessions B and D.
- Session D: perform the final demo run-through with the full team, tag v1.0 on the main branch, write release notes, complete the README with setup instructions and architecture overview, and write the handoff document. — **partial** (README, release notes, and handoff document **done**; v1.0 tag and final demo require full team)
- Deliverables: the end-to-end flow has been verified with no errors, all application statuses are correct, retry logic works for failed applications, and all timestamps are accurate.
- Pull tasks completed: improved error messages across all API routes — **done** (`formatZodError` for user-friendly validation errors, `safeErrorMessage` to prevent internal error leakage); wrote 33 unit tests for rate limiter and validation — **done**

## Daily responsibilities

Every session day, Bryan must complete the following actions:

1. Post an async standup note in the team channel before starting work. The note must answer three questions: what was completed in the previous session, what will be worked on in the current session, and whether there are any blockers that could prevent progress.
2. Review any open pull requests assigned to Bryan and leave written feedback with specific, actionable comments before the session ends.
3. Confirm that the CI pipeline is green on any branch Bryan has pushed to. If the pipeline is failing, resolve the failure before beginning new feature work.
4. Update the relevant GitHub Issue or backlog item to reflect current progress, including moving items between columns (To Do, In Progress, In Review, Done) as appropriate.
5. If finishing a session early, complete pull tasks in the following priority order: write tests for recently merged code, improve error messages in existing endpoints, update documentation to reflect recent changes, perform a QA pass on a teammate's open pull request, or file bugs discovered during the QA pass.

## Weekly responsibilities

By the end of each week's final session (Session D), Bryan must ensure the following are true:

- All of his named deliverables for the week are demo-able in a live browser without requiring any manual setup or workarounds.
- His code has passed lint, typecheck, and all applicable tests in the CI pipeline.
- His pull requests have been reviewed and merged, or are awaiting review with a clear written description that explains the changes, the testing performed, and any known limitations.
- His standup notes are posted for all four sessions of the week.
- He has approved at least one teammate's pull request before the weekly review, providing substantive feedback rather than a rubber-stamp approval.

## Pre-launch responsibilities (by March 15, 2026)

Before the v1.0 tag is created, Bryan must personally verify that the following are complete:

- The Prisma schema and all seven MVP tables are correctly deployed in the production Supabase instance, with no schema drift between the migration files and the live database. — **done** (schema committed with all 7 tables)
- The `POST /api/apply` endpoint correctly creates an Application record and a SubmissionLog entry for every attempt, including failed attempts where the submission did not succeed. — **done**
- All API routes that Bryan owns return the standard `{ data, error }` response envelope, with appropriate HTTP status codes for success, validation failure, and server error cases. — **done** (all routes use `ApiResponse<T>` type with `{ data, error }` envelope)
- Auth guards are active on every protected route and return a 401 status code for unauthenticated requests. — **done** (centralized `requireAuth()` helper in `src/lib/auth-guard.ts`; applied to profile, jobs, swipe, apply, applications, and resume/signed-url routes)
- Signed URLs for resume file access expire correctly after 15 minutes, and no resume file is accessible without a valid signed URL. — **done** (`GET /api/resume/signed-url` endpoint generates 15-min signed URLs via Supabase Storage service role client; ownership validated before URL generation)
- Rate limiting on the `POST /api/apply` endpoint is verified at 10 requests per minute per user, and requests exceeding the limit receive a 429 status code. — **done** (in-memory sliding-window `RateLimiter` in `src/lib/rate-limit.ts`; returns 429 with `Retry-After` header)
- The README includes setup instructions, environment variable documentation, and an architecture overview that accurately reflects the deployed system. — **done** (README rewritten with full architecture diagram, request lifecycle, API reference with auth/rate-limit columns, env var table, security section, and scripts reference)
- The handoff document explains how to deploy the application, how to add new jobs to the database, and how to extend the system with new features. — **done** (`docs/HANDOFF.md` covers Vercel deployment, Supabase cloud setup, three methods for adding jobs, and extension patterns for new routes/tables/features)
- The v1.0 Git tag is created on the main branch after all checks have passed.
- Release notes are written and committed to the repository, summarizing the features delivered, known limitations, and next steps. — **done** (`docs/RELEASE-NOTES-v1.0.md` covers all features, known limitations, and recommended next steps)

## Pairing assignments

| Week | Session | Partner | Focus |
|------|---------|---------|-------|
| Week 1 | Session B | Matt | Database schema, Supabase configuration, Prisma migration, and seed script. — **done** |
| Week 1 | Session D | All | Vertical slice integration connecting auth, profile, swipe, and history. |
| Week 2 | Session A | Matt | Job ingestion MVP and `GET /api/jobs` endpoint. |
| Week 2 | Session C | Matt | Apply pipeline stub and `POST /api/apply` endpoint. — **done** |
| Week 3 | Session A | Talan | Profile and resume upload flow polish. |
| Week 3 | Session C | Brandon | Security baseline: signed URLs, auth guards, and rate limiting. — **done** |
| Week 3 | Session D | All | Midterm demo rehearsal. |
| Week 4 | Session C | Matt | End-to-end flow verification. |
| Week 4 | Session D | All | Final demo, v1.0 tag, release notes, README, and handoff document. |
