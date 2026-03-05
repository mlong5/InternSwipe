# Milestones

| Field        | Value                                |
|--------------|--------------------------------------|
| Project      | InternSwipe                          |
| Course       | CS 250                               |
| Owner        | Bryan                                |
| Last updated | March 5, 2026                        |
| Version      | 2.0                                  |

## Overview

InternSwipe is built across four weeks, from February 16, 2026 to March 15, 2026, with four work sessions per week (Sessions A through D), each lasting one to two hours. This document defines the sprint focus, session-by-session breakdown, and exit criteria for each week. A week is not considered complete until every item in its exit criteria section is true.

---

## Week 1: Foundation and vertical slice

**Date range:** February 16 - February 22, 2026
**Actual status:** INCOMPLETE -- backend work done by Bryan; frontend skeleton and vertical slice not completed

**Sprint focus:** Establish the project foundation by setting up authentication, the database schema, the UI skeleton, and a working vertical slice that connects all layers end to end.

### Session-by-session breakdown

| Session | Owners | Work | Status |
|---------|--------|------|--------|
| Session A | All | Project kickoff: finalize the tech stack, set up the GitHub repository with branch protection rules, configure the Vercel deployment, and set up the Supabase project. Assign roles and confirm the four-week itinerary. | **done** (repo created, tech stack finalized, Supabase configured; Vercel deployment not started) |
| Session B | Bryan and Matt | Design and implement the database schema covering all seven MVP tables. Configure the Supabase project settings. Write the Prisma schema file, run the first migration, and build the seed script to populate the Jobs table with 20 to 30 curated postings with eligibility flags. | **done** -- completed by Bryan |
| Session C | Talan and Brandon | Create wireframes for all key screens (landing and login, profile setup, swipe deck, and history page). Build the UI skeleton in Next.js with page routes, a shared layout component, and navigation. Configure Tailwind CSS with base design tokens for colors, spacing, and typography. | **incomplete** -- Tailwind configured but wireframes, UI skeleton, page routes, layout, and navigation not built. No commits from Talan or Brandon. |
| Session D | All | Connect authentication, profile, swipe, and history into a working vertical slice. Wire the UI skeleton to the backend endpoints. Verify that the core user flow is navigable end to end in a live browser. Conduct the first review and demo, followed by the retrospective. | **not done** -- no UI skeleton exists to wire endpoints to |

### Exit criteria

The following must all be true before the team considers Week 1 complete:

- Supabase Auth is configured and a user can sign up, log in, and log out. — **done** (signup, login, logout API routes implemented with Supabase Auth) -- completed by Bryan
- The Prisma schema is committed to the repository and covers all seven MVP tables. — **done** (User, Profile, Resume, Job, SwipeAction, Application, SubmissionLog) -- completed by Bryan
- The first migration has been applied successfully to the Supabase database. — **done** (schema committed, migrations applied via `npx prisma migrate dev`) -- completed by Bryan
- The seed script runs without errors and populates the Jobs table with 20 or more curated postings. — **done** (25 jobs seeded -- 15 ELIGIBLE, 10 NOT_ELIGIBLE) -- completed by Bryan
- The UI skeleton is deployed to a Vercel preview environment with working page routes and navigation. — **not done** (no UI skeleton built; no Vercel deployment) -- assigned to Talan and Brandon
- Tailwind CSS is configured with the project's base design tokens. — **partial** (Tailwind 4.2.0 configured with PostCSS; custom design tokens not implemented) -- assigned to Talan and Brandon
- The vertical slice is functional: a user can navigate from login through the swipe deck to the history page. — **not done** (backend endpoints exist but no frontend UI to connect them to)
- The first review and demo has been conducted, and the retrospective action items have been recorded. — **not done**

---

## Week 2: Core features

**Date range:** February 23 - March 1, 2026
**Actual status:** INCOMPLETE -- apply pipeline done by Bryan; job endpoint, swipe UI, and CI/CD not completed

**Sprint focus:** Build the core features that define the InternSwipe experience: the job ingestion pipeline, the swipe interaction UI, the apply pipeline, and the CI/CD infrastructure.

### Session-by-session breakdown

| Session | Owners | Work | Status |
|---------|--------|------|--------|
| Session A | Bryan and Matt | Build the job ingestion MVP by choosing between a seed JSON file or a jobs API integration. Implement the eligibility flag rule (ELIGIBLE or NOT_ELIGIBLE based on resume-only submission support). Create the `GET /api/jobs` endpoint with pagination and filter support. | **partial** -- seed data with eligibility flags done; `GET /api/jobs` endpoint not implemented. No commits from Matt. |
| Session B | Talan and Brandon | Build the complete swipe interaction UI with card animations (left slides left, right slides right), visual overlay states (green for applied, gray for skipped), optimistic UI updates, and toast notifications for apply results. | **not done** -- no commits from Talan or Brandon |
| Session C | Bryan and Matt | Build the apply pipeline stub: implement the `POST /api/apply` endpoint that validates resume and job eligibility, creates an Application record, creates a SubmissionLog entry, and blocks duplicate submissions. | **done** -- completed by Bryan |
| Session D | Talan and Brandon | Set up the full CI/CD pipeline in GitHub Actions (ESLint, TypeScript compiler, Vitest on every PR). Write the first Playwright smoke test covering login, swipe, and history verification. Configure the pipeline to block merge on failure. Conduct the review and demo, followed by the retrospective. | **not done** -- no commits from Talan or Brandon |

### Exit criteria

The following must all be true before the team considers Week 2 complete:

- The job ingestion pipeline is working and the database contains jobs with accurate eligibility flags. — **done** (25 seeded jobs with eligibility flags via seed script) -- completed by Bryan
- The `GET /api/jobs` endpoint returns filtered and paginated results correctly. — **not done** -- assigned to Bryan and Matt
- The swipe card animations run smoothly at 60 frames per second. — **not done** -- assigned to Talan and Brandon
- Toast notifications display correctly for applied, failed, and ineligible outcomes. — **not done** -- assigned to Talan and Brandon
- Optimistic UI updates reflect swipe results instantly. — **not done** -- assigned to Talan and Brandon
- The `POST /api/apply` endpoint correctly creates Application and SubmissionLog records. — **done** (validates resume, checks eligibility, creates both records) -- completed by Bryan
- Duplicate submissions are blocked with an appropriate error response. — **done** (returns 409 for duplicate user-job applications) -- completed by Bryan
- The GitHub Actions CI pipeline runs lint, typecheck, and tests on every pull request. — **not done** -- assigned to Brandon
- The Playwright smoke test is green. — **not done** -- assigned to Brandon
- The CI pipeline blocks merge when any check fails. — **not done** -- assigned to Brandon
- The review and demo has been conducted, and the retrospective action items have been recorded. — **not done**

---

## Week 3: Polish and security

**Date range:** March 2 - March 8, 2026

**Sprint focus:** Polish the user experience, tighten data accuracy, implement the security baseline, and rehearse the midterm demo.

### Session-by-session breakdown

| Session | Owners | Work |
|---------|--------|------|
| Session A | Bryan and Talan | Polish the profile and resume upload flows. Implement resume upload to Supabase Storage with PDF-only and 5 MB validation, upload progress display, and uploaded resume listing with filename, size, master or alternate badge, and delete option. Validate required profile fields (name, email, phone) with clear error messages. |
| Session B | Matt and Brandon | Tighten eligibility rules and accuracy. Review all seeded jobs and fix incorrect eligibility flags. Add a job detail view (tap a card to see full description, requirements, and original posting URL). Ensure swiping right on a NOT_ELIGIBLE job is impossible at both the UI and API levels. |
| Session C | Bryan and Brandon | Implement the security baseline: signed URLs for resume file access with 15-minute expiry, auth guard middleware on all API routes (401 for unauthenticated requests), rate limiting on `POST /api/apply` (10 requests per minute per user), and verification that no resume file is accessible without a valid session. |
| Session D | All | Midterm demo rehearsal. Walk through every key flow in a live browser as a team. Identify and fix any issues discovered during the rehearsal. Conduct the review and demo, followed by the retrospective. |

### Exit criteria

The following must all be true before the team considers Week 3 complete:

- Resume upload works end to end with PDF-only and 5 MB validation enforced.
- Upload progress is displayed to the user during the upload process.
- The profile form validates all required fields with clear error messages.
- Eligibility flags are 100 percent accurate on all seeded data, verified by manual review.
- The job detail view displays the full description, requirements, and original posting URL.
- Swiping right on a NOT_ELIGIBLE job is blocked at both the UI and API levels. — **done** (API-level block implemented in `POST /api/apply`; UI-level block still needed)
- Signed URLs for resume access are working and expire after 15 minutes.
- Auth guards are active on all protected API routes and return 401 for unauthenticated requests.
- Rate limiting is enforced on the `POST /api/apply` endpoint at 10 requests per minute per user.
- No resume file is accessible without a valid authenticated session.
- The midterm demo rehearsal has been completed and any issues discovered have been addressed.
- The review and demo has been conducted, and the retrospective action items have been recorded.

---

## Week 4: Launch readiness

**Date range:** March 9 - March 15, 2026

**Sprint focus:** Ensure launch readiness through bug bashing, responsive and accessibility audits, end-to-end verification, and final launch preparation.

### Session-by-session breakdown

| Session | Owners | Work |
|---------|--------|------|
| Session A | Matt and Brandon | Run a structured bug bash: each team member tests all flows and files bugs in GitHub Issues with priority labels (Critical, High, Medium, Low). Fix all Critical and High priority bugs. Improve error messages to be user-friendly. Verify the CI pipeline is fully green. |
| Session B | Talan and Bryan | Responsive audit across mobile (375px), tablet (768px), and desktop (1280px). Accessibility pass: keyboard navigation, focus states, WCAG AA color contrast, screen reader labels. Implement all empty states. Final copy review for button labels, error messages, and page titles. |
| Session C | Bryan and Matt | Full end-to-end flow verification: walk through the complete user journey from sign-up through history view. Retry a failed application. Verify all statuses and timestamps are correct in both the UI and the database. |
| Session D | All | Final demo run-through. Tag v1.0 on the main branch. Write release notes. Complete the README with setup instructions, environment variable documentation, and architecture overview. Write the handoff document. Sign off on the release checklist. Conduct the final review and demo, followed by the retrospective. |

### Exit criteria

The following must all be true before the team considers Week 4 and the project complete:

- All Critical and High priority bugs have been resolved and verified.
- The application is responsive on mobile (375px), tablet (768px), and desktop (1280px).
- The accessibility checklist has been passed: keyboard navigation works, focus states are visible, color contrast meets WCAG AA, and screen reader labels are present on all interactive elements.
- All empty states are implemented for screens that can have no data.
- All placeholder text has been replaced with production copy.
- The end-to-end flow has been verified with no errors from sign-up through history view.
- Application retry works correctly for failed submissions.
- All statuses and timestamps are accurate in both the UI and the database.
- Error messages are user-friendly throughout the application.
- The CI pipeline is fully green.
- The v1.0 Git tag has been created on the main branch.
- Release notes have been written and committed.
- The README is complete with setup instructions, environment variable documentation, and architecture overview.
- The handoff document has been written and committed.
- The release checklist has been fully signed off by Brandon.
- The production deployment on Vercel is live and stable.
