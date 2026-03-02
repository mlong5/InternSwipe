# Talan -- task breakdown

| Field        | Value                                |
|--------------|--------------------------------------|
| Project      | InternSwipe                          |
| Course       | CS 250                               |
| Owner        | Talan                                |
| Last updated | February 16, 2026                    |
| Version      | 1.0                                  |

## Role summary

Talan is the design and frontend lead for InternSwipe. He owns the swipe deck UI, the profile and resume setup flows, the design system, and the component library. Talan is responsible for ensuring that every user-facing screen is visually polished, responsive across all target breakpoints, accessible to keyboard and screen reader users, and performant on mobile devices. He is the final authority on design consistency and UI quality across the application.

## Primary deliverables by week

### Week 1 (February 16 - February 22, 2026)

- Lead Session C with Brandon: create wireframes for all key screens, including the landing and login page, profile setup page, swipe deck, and history page. Build the UI skeleton in Next.js with page routes, a shared layout component, and navigation. Configure Tailwind CSS with base design tokens covering colors, spacing, and typography. — **done** (Tailwind configured; page routes, shared layout, and navigation still needed)
- Pair on Session D: wire the UI skeleton into the vertical slice, connecting the frontend components to the backend endpoints so that the core user flow is navigable end to end.
- Deliverables: wireframes have been reviewed and approved by the team, the UI skeleton is deployed to a Vercel preview environment, and Tailwind CSS is configured with the project's design tokens. — **done** (Tailwind 4.2.0 configured with PostCSS; UI skeleton and Vercel deployment still pending)

### Week 2 (February 23 - March 1, 2026)

- Lead Session B with Brandon: build the complete swipe interaction UI. This includes card animations where swiping left slides the card to the left and swiping right slides it to the right, visual overlay states showing green for "applied" and gray for "skipped," optimistic UI updates that reflect the swipe result immediately before the server responds, and toast notifications that display the outcome of each apply action.
- Pair on Session D: support the CI setup and Playwright test configuration with Brandon.
- Deliverables: swipe card animations run smoothly at 60 frames per second, toast notifications appear correctly for applied, failed, and ineligible outcomes, and optimistic UI updates reflect instantly without waiting for the server response.

### Week 3 (March 2 - March 8, 2026)

- Lead Session A with Bryan: polish the profile and resume upload flows. Implement resume upload to Supabase Storage with validation that enforces PDF-only file types and a maximum file size of 5 MB. Display upload progress to the user during the upload process. Show uploaded resumes with their filename, file size, a badge indicating whether the resume is the master or an alternate, and a delete option. Ensure the profile form validates all required fields (name, email, and phone number) with clear, user-friendly error messages.
- Pair on Session D: participate in the midterm demo rehearsal with all four team members.
- Deliverables: resume upload works end to end with proper validation, upload progress is displayed, validation errors are shown with clear messages, and the profile form correctly validates all required fields.

### Week 4 (March 9 - March 15, 2026)

- Lead Session B with Bryan: conduct a responsive audit across three breakpoints -- mobile at 375px, tablet at 768px, and desktop at 1280px. Perform an accessibility pass covering keyboard navigation, focus states, WCAG AA color contrast compliance, and screen reader labels on all interactive elements. Implement all empty states for screens that can have no data. Complete a final copy review for all button labels, error messages, and page titles.
- Participate in Sessions A and D.
- Deliverables: the application is responsive on all three target breakpoints, the accessibility checklist has been passed, all empty states are implemented, and final copy has been reviewed and finalized.

## Daily responsibilities

Every session day, Talan must complete the following actions:

1. Post an async standup note in the team channel before starting work. The note must answer three questions: what was completed in the previous session, what will be worked on in the current session, and whether there are any blockers that could prevent progress.
2. Review any open pull requests that touch UI components, styling, or layout, and leave written feedback on visual correctness, design system consistency, and responsiveness before the session ends.
3. Confirm that the CI pipeline is green on any branch Talan has pushed to. If the pipeline is failing, resolve the failure before beginning new feature work.
4. Update the relevant GitHub Issue or backlog item to reflect current progress, including moving items between columns as appropriate.
5. If finishing a session early, complete pull tasks in the following priority order: audit existing components for design system consistency, add missing focus states or accessible labels, improve animation performance on identified bottlenecks, perform a QA pass on a teammate's open pull request with attention to visual quality, or file bugs discovered during the QA pass.

## Weekly responsibilities

By the end of each week's final session (Session D), Talan must ensure the following are true:

- All of his named deliverables for the week are demo-able in a live browser on at least one target breakpoint without requiring any manual setup or workarounds.
- His code has passed lint, typecheck, and all applicable tests in the CI pipeline.
- All animations run at 60 frames per second without dropped frames or visual glitches.
- No visual regressions have been introduced in screens that were previously completed.
- His pull requests have been reviewed and merged, or are awaiting review with a clear written description that includes screenshots or screen recordings demonstrating the UI changes.
- His standup notes are posted for all four sessions of the week.
- He has approved at least one teammate's pull request before the weekly review, providing substantive feedback on UI and code quality.

## Pre-launch responsibilities (by March 15, 2026)

Before the v1.0 tag is created, Talan must personally verify that the following are complete:

- All key screens are implemented and responsive: the landing page, login page, profile setup page, resume upload page, swipe deck, history page, application detail view, and settings page.
- The swipe deck animations run at 60 frames per second on a mobile device without dropped frames or visual stuttering.
- Every interactive element (buttons, links, form inputs, cards) has a visible focus state and an accessible label that is announced correctly by screen readers.
- Color contrast ratios meet WCAG AA standards on all text elements and UI components throughout the application.
- Empty states are implemented for the following scenarios: no jobs matching the current filters, no applications submitted yet, and no resume uploaded to the profile.
- All toast notifications display correctly for applied, failed, and ineligible swipe outcomes, with appropriate colors and messaging for each state.
- Keyboard shortcuts work on desktop, allowing users to swipe left and right using arrow keys or assigned letter keys.
- Final copy has been reviewed across every screen, and all placeholder text ("Lorem ipsum," "TODO," or "TBD") has been replaced with production copy.

## Pairing assignments

| Week | Session | Partner | Focus |
|------|---------|---------|-------|
| Week 1 | Session C | Brandon | Wireframes, UI skeleton, page routes, layout component, and Tailwind configuration. |
| Week 1 | Session D | All | Vertical slice integration connecting UI to backend endpoints. |
| Week 2 | Session B | Brandon | Swipe interaction UI: card animations, visual states, optimistic updates, and toasts. |
| Week 2 | Session D | Brandon | CI pipeline setup and Playwright test configuration. |
| Week 3 | Session A | Bryan | Profile and resume upload flow polish, validation, and progress display. |
| Week 3 | Session D | All | Midterm demo rehearsal. |
| Week 4 | Session B | Bryan | Responsive audit, accessibility pass, empty states, and final copy review. |
| Week 4 | Session D | All | Final demo, v1.0 tag, release notes, and launch readiness. |
