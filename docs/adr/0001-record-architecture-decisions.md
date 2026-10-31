# 0001. Record architecture decisions

- **Status:** Proposed (pending approval of the product requirements document)
- **Date:** 2026-10-31
- **Deciders:** Atlas (Architect) proposes; Kasani Hariteja (repository owner) approves
- **Related:** [ADR index](README.md)

## Context

The portfolio site is built by a small team of agents (product, architecture, design, DevOps,
build, QA and security) with one human owner, Kasani Hariteja, who reviews and merges every pull
request. Decisions are made in chat and in pull requests, where they are hard to find later. Anyone
picking up the repository, including a future version of the team, needs to know why the stack
looks the way it does before changing it.

The repository already reserves `docs/adr/` for this purpose (the scaffold at commit `b303f0c`
created it with a `.gitkeep`).

## Options considered

### Option A: Lightweight ADRs in the repository, Nygard format (recommended)

One Markdown file per decision in `docs/adr/`, numbered sequentially, reviewed through the normal
pull request flow.

- Pros: versioned with the code it explains; reviewed with the same branch protection and CI as
  code; plain Markdown, readable on GitHub with no tooling; a well-known format.
- Cons: needs discipline to write one when a decision is made; Markdown tables and links are
  checked only by Prettier formatting, not for content.

### Option B: Decisions recorded only in pull request descriptions and issues

- Pros: no extra files.
- Cons: scattered across closed PRs and issues; no index; no clean way to supersede a decision.

### Option C: An external wiki or document

- Pros: richer editing.
- Cons: drifts from the code; not reviewed by CI or branch protection; another system to maintain.

## Decision

We will record architecturally significant decisions as ADRs in `docs/adr/`, using Michael
Nygard's format extended with an explicit **Options considered** section and an explicit
**Assumptions** section. Files are named `NNNN-kebab-case-title.md`. The process, statuses and
template are in [`docs/adr/README.md`](README.md).

A decision is architecturally significant when it is expensive to reverse or shapes other work:
framework, hosting, content model, data storage, security posture, quality gates, new runtime
dependencies with a large footprint, and any new backend surface such as a contact form.

## Consequences

- New contributors can read `docs/adr/` to learn why the stack is what it is.
- Changing an accepted decision needs a new, superseding ADR, which makes reversals deliberate.
- ADRs pass through the same required checks as code. The Lint job runs `prettier --check`, so ADR
  Markdown must be Prettier-formatted.
- Writing ADRs costs a little time per decision.

## Assumptions

- **A1.** Kasani is the approver for every ADR, matching the repository's `CODEOWNERS`
  (`* @Hari-1005`). If other human reviewers join, the deciders line changes.
- **A2.** ADRs 0001 to 0006 stay **Proposed** until the PRD is approved, as agreed with Orion
  (Manager). Their statuses move to Accepted, or are revised, after that.

## References

- Michael Nygard, "Documenting Architecture Decisions" (2011):
  https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
- ADR GitHub organisation: https://adr.github.io/
