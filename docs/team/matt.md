# Matt -- task breakdown

| Field        | Value                                |
|--------------|--------------------------------------|
| Project      | InternSwipe                          |
| Course       | CS 250                               |
| Owner        | Matt                                 |
| Last updated | February 16, 2026                    |
| Version      | 1.0                                  |

## Role summary

Matt is the backend systems lead for InternSwipe. He owns the job ingestion pipeline, the eligibility rules engine, backend API endpoints for job retrieval, and the logging and retry logic that ensures every application attempt is recorded accurately. Matt is responsible for guaranteeing that the data flowing through the system is correct, that eligibility determinations are accurate, and that the backend surfaces reliable information to the frontend at all times.

## Primary deliverables by week

### Week 1 (February 16 - February 22, 2026)

- Pair with Bryan on Session B: implement the database schema covering all seven MVP tables and configure the Supabase project. This includes writing the Prisma schema file, running the first migration, and building the seed script that populates the Jobs table.
- Pair on Session D: wire the vertical slice by connecting the backend endpoints to the frontend components so that the core user flow is functional end to end.
- Deliverables: the Prisma schema is committed to the repository, the first migration has been applied successfully, and the seed script runs without errors.

### Week 2 (February 23 - March 1, 2026)

- Lead Session A with Bryan: build the job ingestion MVP by choosing between a seed JSON file or a jobs API integration as the data source. Implement the eligibility flag rule that marks each job as ELIGIBLE or NOT_ELIGIBLE based on whether the job supports resume-only submission. Create the `GET /api/jobs` endpoint with pagination and filter support so the frontend can request jobs in batches with optional criteria.
- Lead Session C with Bryan: build the apply pipeline stub, implementing the `POST /api/apply` endpoint with validation, record creation, and duplicate prevention.
- Deliverables: the job ingestion pipeline is working and populating the database, eligibility flags are accurate for all ingested jobs, and the `GET /api/jobs` endpoint returns filtered and paginated results correctly.

### Week 3 (March 2 - March 8, 2026)

- Lead Session B with Brandon: tighten the eligibility rules to ensure 100 percent accuracy on all seeded data. Review every seeded job entry and fix any incorrect eligibility flags. Add a job detail view that is triggered when a user taps on a card, showing the full job description, requirements, and original posting URL. Ensure that swiping right on a NOT_ELIGIBLE job is impossible at both the UI and API levels.
- Pair on Session D: participate in the midterm demo rehearsal with all four team members.
- Deliverables: eligibility flags are 100 percent accurate on all seeded data as verified by manual review, the job detail view is working and displays complete information, and swiping right on an ineligible job is blocked.

### Week 4 (March 9 - March 15, 2026)

- Pair on Sessions A, C, and D.
- Session A: run a structured bug bash with Brandon, where each team member tests all flows and files bugs in GitHub Issues with priority labels.
- Session C: verify the end-to-end flow with Bryan, walking through the complete user journey and confirming data correctness at every step.
- Session D: participate in launch readiness activities with the full team, including the final demo run-through.
- Deliverables: all Critical and High priority bugs have been resolved, and data correctness has been verified across every stage of the user journey.

## Daily responsibilities

Every session day, Matt must complete the following actions:

1. Post an async standup note in the team channel before starting work. The note must answer three questions: what was completed in the previous session, what will be worked on in the current session, and whether there are any blockers that could prevent progress.
2. Review any open pull requests that touch backend endpoints, database queries, or data processing logic, and leave written feedback with specific attention to data correctness and error handling before the session ends.
3. Confirm that the CI pipeline is green on any branch Matt has pushed to. If the pipeline is failing, resolve the failure before beginning new feature work.
4. Update the relevant GitHub Issue or backlog item to reflect current progress, including moving items between columns as appropriate.
5. If finishing a session early, complete pull tasks in the following priority order: write tests for recently merged backend code, verify data accuracy by spot-checking database records against expected values, improve error messages in existing endpoints, perform a QA pass on a teammate's open pull request, or file bugs discovered during the QA pass.

## Weekly responsibilities

By the end of each week's final session (Session D), Matt must ensure the following are true:

- All of his named deliverables for the week are demo-able in a live browser without requiring any manual setup or workarounds.
- His code has passed lint, typecheck, and all applicable tests in the CI pipeline.
- All data returned by his endpoints is accurate and matches the expected values in the database.
- His pull requests have been reviewed and merged, or are awaiting review with a clear written description that explains the changes, the testing performed, and any known limitations.
- His standup notes are posted for all four sessions of the week.
- He has approved at least one teammate's pull request before the weekly review, providing substantive feedback rather than a rubber-stamp approval.

## Pre-launch responsibilities (by March 15, 2026)

Before the v1.0 tag is created, Matt must personally verify that the following are complete:

- All 25 or more seeded jobs have correct eligibility flags, verified by a manual review of each job entry against the eligibility criteria.
- The `GET /api/jobs` endpoint returns filtered and paginated results correctly, and excludes jobs that the current user has already swiped on.
- The eligibility rules engine correctly marks resume-only postings as ELIGIBLE and all other postings as NOT_ELIGIBLE. Swiping right on a NOT_ELIGIBLE job is blocked at both the UI level (the swipe-right gesture is disabled) and the API level (the endpoint rejects the request).
- The job detail view shows the full job description, the list of requirements, and the original posting URL for every job in the database.
- SubmissionLog records are created for every apply attempt, including retries, so that the team has a complete audit trail of all submission activity.
- Retry logic allows a user to re-submit an application only when the prior Application status is FAILED and the user explicitly triggers the retry action.
- All data displayed in the history view (Applied, Failed, and Skipped statuses) is accurate and matches the corresponding records in the database.

## Pairing assignments

| Week | Session | Partner | Focus |
|------|---------|---------|-------|
| Week 1 | Session B | Bryan | Database schema, Supabase configuration, Prisma migration, and seed script. |
| Week 1 | Session D | All | Vertical slice integration connecting backend to frontend. |
| Week 2 | Session A | Bryan | Job ingestion MVP, eligibility flags, and `GET /api/jobs` endpoint. |
| Week 2 | Session C | Bryan | Apply pipeline stub and `POST /api/apply` endpoint. |
| Week 3 | Session B | Brandon | Eligibility rules tightening, job detail view, and ineligible swipe blocking. |
| Week 3 | Session D | All | Midterm demo rehearsal. |
| Week 4 | Session A | Brandon | Bug bash: file and fix Critical and High priority bugs. |
| Week 4 | Session C | Bryan | End-to-end flow verification and data correctness. |
| Week 4 | Session D | All | Final demo, v1.0 tag, release notes, and launch readiness. |
