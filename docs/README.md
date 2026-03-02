# Documentation index

| Field        | Value                                |
|--------------|--------------------------------------|
| Project      | InternSwipe                          |
| Course       | CS 250                               |
| Owner        | Bryan                                |
| Last updated | February 16, 2026                    |
| Version      | 1.0                                  |

## Purpose

This folder contains all project documentation for InternSwipe, a Tinder-style internship discovery and application tracker built by a four-person team for CS 250. The documentation covers individual team member responsibilities, project-level standards, and engineering processes. Every document is written to a professional standard and can be presented to a professor, stakeholder, or new team member without modification.

This documentation is maintained alongside the codebase and updated during weekly retrospectives. If any process, responsibility, or technical decision changes, the corresponding document must be updated in the same sprint.

## Where to start

If you are a new team member joining mid-project, begin by reading the following documents in order:

1. `project/tech-stack.md` to understand the technologies used and why they were chosen.
2. `process/environment-setup.md` to set up the project locally from scratch.
3. `process/branching-strategy.md` to understand the Git workflow and pull request rules.
4. `project/definition-of-done.md` to understand what "done" means for every story and pull request.
5. Your own team member document in `team/` to understand your responsibilities.

## Document index

### Team member documentation

| Document | Description |
|----------|-------------|
| [team/bryan.md](team/bryan.md) | Bryan's full task breakdown covering daily, weekly, and pre-launch responsibilities as product owner, API designer, and database schema lead. |
| [team/talan.md](team/talan.md) | Talan's full task breakdown covering daily, weekly, and pre-launch responsibilities as the swipe deck UI, profile flows, and design system lead. |
| [team/matt.md](team/matt.md) | Matt's full task breakdown covering daily, weekly, and pre-launch responsibilities as the job ingestion pipeline, eligibility engine, and backend endpoints lead. |
| [team/brandon.md](team/brandon.md) | Brandon's full task breakdown covering daily, weekly, and pre-launch responsibilities as the CI/CD, testing infrastructure, deployment, and security lead. |

### Project-level documentation

| Document | Description | Status |
|----------|-------------|--------|
| [project/definition-of-done.md](project/definition-of-done.md) | The Definition of Done checklist that applies to every story, pull request, and bug fix across the project. | **done** — process defined |
| [project/weekly-ceremonies.md](project/weekly-ceremonies.md) | The format, schedule, and purpose of the three recurring team ceremonies: async standup, review and demo, and retrospective. | **done** — process defined |
| [project/milestones.md](project/milestones.md) | The four-week milestone summary with session-by-session breakdowns and exit criteria for each week. | **done** — updated with implementation status per exit criterion |
| [project/tech-stack.md](project/tech-stack.md) | A complete reference of every technology used in the project, including version information and rationale for each choice. | **done** — updated with per-technology implementation status |

### Process documentation

| Document | Description | Status |
|----------|-------------|--------|
| [process/branching-strategy.md](process/branching-strategy.md) | The Git branch naming convention, pull request rules, commit message format, and merge policy. | **done** — process defined, repo configured |
| [process/environment-setup.md](process/environment-setup.md) | A step-by-step guide for setting up the InternSwipe project locally from scratch, including all prerequisites and verification steps. | **done** — all setup steps implemented (steps 1-6 verified working) |
| [process/release-checklist.md](process/release-checklist.md) | The formal pre-launch release checklist organized into code quality, security, data integrity, user experience, and launch artifact sections. | In progress — data integrity items partially done, most items pending |
