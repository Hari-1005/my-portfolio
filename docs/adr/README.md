# Architecture Decision Records

This directory holds the architecture decision records (ADRs) for the portfolio site. An ADR
captures one significant decision: the context that forced it, the options that were weighed, what
was chosen and what follows from it. The format is Michael Nygard's, described in
[ADR 0001](0001-record-architecture-decisions.md).

## Index

| ADR                                                      | Title                                                     | Status   | Date       |
| -------------------------------------------------------- | --------------------------------------------------------- | -------- | ---------- |
| [0001](0001-record-architecture-decisions.md)            | Record architecture decisions                             | Proposed | 2026-10-31 |
| [0002](0002-framework-nextjs-app-router-static-first.md) | Next.js App Router, static-first, default output          | Proposed | 2026-10-31 |
| [0003](0003-content-mdx-in-repo.md)                      | Content as MDX in the repository, validated at build time | Proposed | 2026-10-31 |
| [0004](0004-hosting-vercel-git-integration.md)           | Hosting on Vercel through the Git integration             | Proposed | 2026-10-31 |
| [0005](0005-tooling-and-quality-gates.md)                | Tooling, quality gates and version pinning policy         | Proposed | 2026-10-31 |
| [0006](0006-security-headers-and-csp.md)                 | Security headers and Content Security Policy              | Proposed | 2026-10-31 |

All six records are **Proposed**. They are not accepted until the product requirements (PRD) are
approved, because several of them rest on assumptions the PRD will confirm or overturn. Each ADR
lists those assumptions explicitly.

## Statuses

- **Proposed**: written and under review. The repository may already follow it.
- **Accepted**: approved by the repository owner. Changing it needs a new ADR.
- **Rejected**: considered and not adopted. Kept for the record.
- **Deprecated**: no longer relevant, with no replacement.
- **Superseded by NNNN**: replaced by a later ADR, which links back with "Supersedes NNNN".

Accepted ADRs are immutable apart from typo fixes and status changes. To change a decision, write a
new ADR that supersedes the old one and update the old one's status line.

## Adding an ADR

1. Copy the template below into `docs/adr/NNNN-short-kebab-title.md`, using the next free number.
2. Fill in every section. Flag assumptions explicitly; do not state an assumption as a fact.
3. Add a row to the index above.
4. Open a pull request on a `docs/*` branch with a Conventional Commit title, for example
   `docs(adr): add 0007 contact form`. The owner moves the status to Accepted in review.

## Template

```markdown
# NNNN. Title in the imperative or as a noun phrase

- **Status:** Proposed
- **Date:** YYYY-MM-DD
- **Deciders:** who proposes and who approves
- **Related:** other ADRs, issues or PRs

## Context

The forces at play: requirements, constraints, facts about the current system. Value-neutral.

## Options considered

### Option A: name (recommended)

What it is. Pros. Cons.

### Option B: name

What it is. Pros. Cons.

## Decision

What we will do, in active voice: "We will ...".

## Consequences

What becomes easier or harder, including the negative consequences and the follow-up work.

## Assumptions

- **A1.** Each assumption the decision depends on, and what changes if it turns out false.

## References

Links to primary sources.
```
