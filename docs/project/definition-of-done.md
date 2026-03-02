# Definition of done

| Field        | Value                                |
|--------------|--------------------------------------|
| Project      | InternSwipe                          |
| Course       | CS 250                               |
| Owner        | Bryan                                |
| Last updated | February 16, 2026                    |
| Version      | 1.0                                  |

## Overview

The Definition of Done (DoD) is a shared agreement that defines the minimum quality bar every story, pull request, and bug fix must meet before it can be considered complete. No work item should be merged into the main branch or demonstrated in a review unless all six criteria below are satisfied. This document applies equally to all team members regardless of role.

## Criteria

### 1. Acceptance criteria met and demo-able in browser — **done** (process defined and adopted)

Every story and bug fix must have clearly defined acceptance criteria written in the associated GitHub Issue before work begins. When the work is complete, the implementer must be able to demonstrate the feature or fix in a live browser session, showing that each acceptance criterion is satisfied. A feature that works only in unit tests or only on one team member's local machine does not meet this criterion. The pull request author is responsible for verifying demo-ability before requesting review.

### 2. Pull request reviewed by at least one teammate — **done** (process defined and adopted)

Every change must be submitted as a pull request and reviewed by at least one other team member before it can be merged. The reviewer must read the code changes, verify that the implementation matches the described intent, and leave written feedback. Rubber-stamp approvals (approving without reading the code) are not acceptable. The reviewer is responsible for checking correctness, readability, and consistency with the project's conventions.

### 3. Lint and typecheck pass (GitHub Actions enforced) — (ESLint and TypeScript configured locally; GitHub Actions CI pipeline not yet set up)

Every pull request must pass the automated lint (ESLint) and typecheck (TypeScript compiler) checks in the GitHub Actions CI pipeline. These checks run automatically on every push to a pull request branch, and the pipeline is configured to block merge if any check fails. The pull request author is responsible for fixing all lint and typecheck errors before requesting review. No exceptions or manual overrides are permitted.

### 4. Tests added or updated where applicable — (Vitest and Playwright not yet configured)

When a change introduces new functionality, modifies existing behavior, or fixes a bug, the author must add or update tests to cover the changed behavior. This includes unit tests (Vitest) for business logic and integration or end-to-end tests (Playwright) for user-facing flows where appropriate. The reviewer is responsible for verifying that the test coverage is adequate and that the tests actually assert the correct behavior rather than simply running without errors.

### 5. Errors handled with a user-safe message and a log entry — **done** (all API routes use `{ data, error }` envelope with user-safe messages)

Every error path in the application must produce two outputs: a user-safe message that is displayed in the UI without exposing stack traces, internal identifiers, or cryptic error codes, and a log entry that captures enough detail for the team to diagnose and fix the issue. The pull request author is responsible for ensuring that no raw exceptions or technical error messages are visible to the end user. The reviewer should verify error handling by considering what happens when the network is unavailable, the database returns an unexpected result, or the user provides invalid input.

### 6. Feature documented if it changes setup or behavior — **done** (environment-setup.md and .env.local.example maintained alongside code)

If a change modifies how the project is set up, configured, or used -- including new environment variables, new commands, changed API contracts, or altered user flows -- the corresponding documentation must be updated in the same pull request. This includes the README, the environment setup guide, API documentation, and any other relevant documents in the `/docs` folder. The pull request author is responsible for identifying which documents are affected. The reviewer should verify that the documentation accurately reflects the new behavior.
