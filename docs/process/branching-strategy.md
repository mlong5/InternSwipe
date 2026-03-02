# Branching strategy

| Field        | Value                                |
|--------------|--------------------------------------|
| Project      | InternSwipe                          |
| Course       | CS 250                               |
| Owner        | Brandon                              |
| Last updated | February 16, 2026                    |
| Version      | 1.0                                  |

## Overview

This document defines the Git branching strategy, commit message format, pull request rules, and merge policy for the InternSwipe project. Every team member must follow these conventions to maintain a clean, traceable commit history and to ensure that the main branch always contains production-ready code.

## Branch protection — **done** (GitHub repository configured)

The `main` branch is protected. No direct pushes are allowed. All changes must be submitted as pull requests with at least one reviewer approval before they can be merged. This rule applies to all team members without exception, including the product owner.

## Branch naming convention

All feature branches must follow one of the naming conventions below, using a short, descriptive slug separated by hyphens:

```
feat/short-description
fix/short-description
chore/short-description
docs/short-description
```

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | A new feature or user-facing functionality. | `feat/swipe-deck-animations` |
| `fix/` | A bug fix for existing functionality. | `fix/duplicate-application-block` |
| `chore/` | Non-functional work such as dependency updates, CI configuration, or tooling changes. | `chore/setup-github-actions` |
| `docs/` | Documentation changes, including README updates and docs folder additions. | `docs/add-environment-setup-guide` |

Branch names must be lowercase, use hyphens to separate words, and be descriptive enough that a teammate can understand the purpose of the branch without reading the code.

## Commit message format — **done** (in use, e.g. `feat(week1):`, `docs:`)

All commit messages must follow the Conventional Commits specification. The format is:

```
type(scope): short description
```

The `type` must be one of the following:

| Type | Purpose |
|------|---------|
| `feat` | A new feature or user-facing functionality. |
| `fix` | A bug fix. |
| `chore` | Non-functional changes such as dependency updates, CI configuration, or tooling. |
| `docs` | Documentation changes. |
| `test` | Adding or updating tests. |
| `refactor` | Code restructuring that does not change functionality. |

The `scope` is optional and indicates the area of the codebase affected (for example, `api`, `ui`, `auth`, `db`, or `ci`). The short description must be written in the imperative mood ("add swipe animation" not "added swipe animation") and should be no longer than 72 characters.

Examples of well-formed commit messages:

```
feat(ui): add swipe card animation with left and right gestures
fix(api): block duplicate application submissions for same user-job pair
chore(ci): configure GitHub Actions to run lint and typecheck on PRs
docs: add environment setup guide to docs folder
test(api): add unit tests for eligibility rules engine
refactor(db): simplify seed script to use batch insert
```

## Pull request rules

Every pull request must satisfy the following requirements before it can be merged:

1. The pull request must have a clear, descriptive title that follows the same Conventional Commits format used for commit messages. — **done** (convention adopted)
2. The pull request description must explain what the change does, why it is needed, what testing was performed, and any known limitations or follow-up work. — **done** (convention adopted)
3. At least one teammate must review and approve the pull request. The reviewer must read the code and leave substantive feedback. — **done** (convention adopted)
4. All CI checks must pass. The GitHub Actions pipeline runs ESLint, the TypeScript compiler, and Vitest tests on every pull request, and merge is blocked if any check fails. (GitHub Actions CI pipeline not yet set up)
5. The branch must be up to date with the main branch before merging. If the main branch has moved ahead, the author must rebase or merge main into the feature branch and resolve any conflicts before the pull request can be merged. — **done** (convention adopted)

## Merge policy

The team uses the "squash and merge" strategy for all pull requests. This produces a single, clean commit on the main branch for each merged pull request, keeping the commit history readable and easy to navigate. The squash commit message should match the pull request title and follow the Conventional Commits format.

After a pull request is merged, the feature branch should be deleted to keep the repository clean. GitHub is configured to automatically delete branches after merge.

## Preview deployments

Vercel is configured to create an automatic preview deployment for every pull request. This preview deployment allows the team to test the changes in a production-like environment before merging. Reviewers should use the preview deployment to verify that the changes work correctly in the browser, not just in the code diff.
