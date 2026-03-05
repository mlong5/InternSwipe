# Brandon -- task breakdown

| Field        | Value                                |
|--------------|--------------------------------------|
| Project      | InternSwipe                          |
| Course       | CS 250                               |
| Owner        | Brandon                              |
| Last updated | March 5, 2026                        |
| Version      | 2.0                                  |

## Contribution status (as of March 5, 2026)

| Week | Expected deliverables | Actual status |
|------|----------------------|---------------|
| Week 1 | Wireframes with Talan, UI skeleton, Tailwind design tokens, vertical slice | **No commits.** Tailwind was configured as part of the project setup, but wireframes, UI skeleton, and design tokens have not been built. |
| Week 2 | Swipe UI with Talan, CI/CD pipeline (GitHub Actions), Playwright smoke test | **No commits.** No GitHub Actions workflow files exist. No testing infrastructure has been set up. |
| Week 3 | Eligibility tightening with Matt, security baseline with Bryan | Not yet started (current week) |

**Git commits:** 0
**Week 1 completion:** NOT COMPLETE

## Role summary

Brandon is the infrastructure and quality lead for InternSwipe. He owns the repository health, the CI/CD pipeline, the testing infrastructure, deployment configuration, the security baseline, and error monitoring. Brandon is responsible for ensuring that the development process is reliable, that code quality is enforced automatically, and that the production environment is secure and stable. Nothing ships to production without Brandon's sign-off on the release checklist.

## Primary deliverables by week

### Week 1 (February 16 - February 22, 2026)

- Lead Session C with Talan: create wireframes for all key screens (landing and login, profile setup, swipe deck, and history page), build the UI skeleton in Next.js with page routes, a shared layout component, and navigation, and configure Tailwind CSS with base design tokens covering colors, spacing, and typography. — **done** (Tailwind configured; page routes, shared layout, and navigation still needed)
- Pair on Session D: participate in vertical slice integration, connecting the UI skeleton and backend endpoints into a working end-to-end flow.
- Deliverables: the UI skeleton is deployed to a Vercel preview environment, and Tailwind CSS is configured with the project's design tokens. — **done** (Tailwind 4.2.0 configured; UI skeleton and Vercel deployment still pending)

### Week 2 (February 23 - March 1, 2026)

- Lead Session D with Talan: set up the full CI/CD pipeline in GitHub Actions. The pipeline must run ESLint, the TypeScript compiler, and Vitest tests on every pull request. Write the first Playwright smoke test that covers the following flow: log in, navigate to the swipe deck, perform a swipe, and verify that the swipe appears in the history. Configure the pipeline to block merge on any check failure.
- Pair on Session B with Talan: support the swipe interaction UI build.
- Deliverables: the GitHub Actions CI pipeline is passing on the main branch, the Playwright smoke test is green, and the pipeline blocks merge when any check fails.

### Week 3 (March 2 - March 8, 2026)

- Lead Session C with Bryan: implement the security baseline. This includes signed URLs for resume file access with a 15-minute expiry window, auth guard middleware on all API routes that returns a 401 status for unauthenticated requests, rate limiting on the `POST /api/apply` endpoint at 10 requests per minute per user, and verification that no resume file is accessible without a valid authenticated session.
- Pair on Sessions B and D.
- Deliverables: signed URLs are working and expiring correctly, auth guards are active on all protected routes, rate limiting is enforced on the apply endpoint, and security measures have been verified through manual and automated testing.

### Week 4 (March 9 - March 15, 2026)

- Lead Session A with Matt: run a structured bug bash where each team member tests all application flows and files bugs as GitHub Issues. Each bug must be assigned a priority label: Critical, High, Medium, or Low. Fix all Critical and High priority bugs. Improve error messages across the application to be user-friendly, ensuring that no stack traces or cryptic error codes are exposed to the user. Verify that the CI pipeline is fully green after all fixes are applied.
- Nothing ships without Brandon's sign-off on the release checklist.
- Deliverables: bug bash issues are filed with priority labels, all Critical and High priority bugs are resolved, error messages are user-friendly throughout the application, the CI pipeline is fully green, and the release checklist is complete and signed off.

## Daily responsibilities

Every session day, Brandon must complete the following actions:

1. Post an async standup note in the team channel before starting work. The note must answer three questions: what was completed in the previous session, what will be worked on in the current session, and whether there are any blockers that could prevent progress.
2. Review any open pull requests that touch CI configuration, test files, deployment settings, or security-related code, and leave written feedback before the session ends.
3. Confirm that the CI pipeline is green on the main branch and on any branch Brandon has pushed to. If the pipeline is failing on main, prioritize resolving the failure above all other work.
4. Update the relevant GitHub Issue or backlog item to reflect current progress, including moving items between columns as appropriate.
5. If finishing a session early, complete pull tasks in the following priority order: add missing test coverage for recently merged code, improve CI pipeline performance or reliability, audit open pull requests for security concerns, perform a QA pass on a teammate's open pull request with attention to edge cases, or file bugs discovered during the QA pass.

## Weekly responsibilities

By the end of each week's final session (Session D), Brandon must ensure the following are true:

- All of his named deliverables for the week are demo-able or verifiable, whether in a live browser or through CI pipeline output.
- His code has passed lint, typecheck, and all applicable tests in the CI pipeline.
- The CI pipeline on the main branch is green, and no known flaky tests exist.
- His pull requests have been reviewed and merged, or are awaiting review with a clear written description that explains the changes, the testing performed, and any known limitations.
- His standup notes are posted for all four sessions of the week.
- He has approved at least one teammate's pull request before the weekly review, providing substantive feedback with attention to test coverage and security.

## Pre-launch responsibilities (by March 15, 2026)

Before the v1.0 tag is created, Brandon must personally verify that the following are complete:

- The GitHub Actions CI pipeline runs lint, typecheck, and all tests on every pull request and blocks merge if any check fails.
- Playwright smoke tests cover the following user flows: sign-up, login, profile setup, resume upload, swipe left, swipe right on an eligible job, history page load, and application detail view.
- The production deployment on Vercel is live, stable, and serving the application without errors.
- No Critical or High priority bugs remain open in GitHub Issues.
- Error messages across the application are user-friendly, and no stack traces or cryptic error codes are exposed to the user in any flow.
- The release checklist document is fully signed off before the v1.0 tag is created.
- Error monitoring is configured and alerts are routing correctly to the team's notification channel.
- The README is accurate and complete, and a new team member could set up the project locally using only the instructions in the README and the environment setup guide.

## Pairing assignments

| Week | Session | Partner | Focus |
|------|---------|---------|-------|
| Week 1 | Session C | Talan | Wireframes, UI skeleton, page routes, layout component, and Tailwind configuration. |
| Week 1 | Session D | All | Vertical slice integration. |
| Week 2 | Session B | Talan | Swipe interaction UI: card animations, visual states, optimistic updates, and toasts. |
| Week 2 | Session D | Talan | CI/CD pipeline setup in GitHub Actions and first Playwright smoke test. |
| Week 3 | Session B | Matt | Eligibility rules tightening, job detail view, and ineligible swipe blocking. |
| Week 3 | Session C | Bryan | Security baseline: signed URLs, auth guards, and rate limiting. |
| Week 3 | Session D | All | Midterm demo rehearsal. |
| Week 4 | Session A | Matt | Bug bash: file and fix Critical and High priority bugs. |
| Week 4 | Session D | All | Final demo, v1.0 tag, release notes, and launch readiness. |
