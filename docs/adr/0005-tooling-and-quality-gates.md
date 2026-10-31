# 0005. Tooling, quality gates and version pinning policy

- **Status:** Proposed (pending approval of the product requirements document)
- **Date:** 2026-10-31
- **Deciders:** Atlas (Architect) proposes; Kasani Hariteja approves; Octo (DevOps) implements
- **Related:** [0002](0002-framework-nextjs-app-router-static-first.md),
  [0004](0004-hosting-vercel-git-integration.md), [0006](0006-security-headers-and-csp.md)

## Context

The repository has one human reviewer, and most code will be written by agents. Quality therefore
has to be enforced by automation rather than by review alone. The site must stay accessible, fast
and easy to run locally, and every tool should be free.

What the scaffold on `main` (commit `b303f0c`) contains:

| Concern              | In the repository                                                                                                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime              | Node.js 24 (`.nvmrc` = `24`, `engines.node` = `>=24 <25`)                                                                                                                                 |
| Package manager      | pnpm via Corepack, `packageManager: pnpm@10.34.9`, `pnpm-lock.yaml` `lockfileVersion: '9.0'`                                                                                              |
| Language             | TypeScript `^5.9.3`, `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `allowJs: false`, Next.js TS plugin                                        |
| Styling              | Tailwind CSS `^4.3.3` through `@tailwindcss/postcss`; tokens in `@theme` in `src/styles/globals.css`; no component library                                                                |
| Animation            | `motion` `^14.9.0`, wrapped in `MotionConfig reducedMotion="user"` (`src/components/motion-provider.tsx`), plus a CSS `prefers-reduced-motion` fallback                                   |
| Fonts                | `next/font/google` (Geist, Geist Mono), downloaded at build time and served from the site's own origin                                                                                    |
| Lint and format      | ESLint `^9.39.5` flat config with `eslint-config-next` `^16.4.3` (`core-web-vitals` and `typescript`) and `eslint-config-prettier`; Prettier `^3.9.10` with `prettier-plugin-tailwindcss` |
| Unit tests           | Vitest `^5.0.5`, Testing Library (React, DOM, jest-dom), jsdom                                                                                                                            |
| End-to-end and a11y  | Playwright `^1.64.1` with `@axe-core/playwright` `^4.14.0`, run against the production build; asserts security headers and fails on CSP violations                                        |
| CI                   | `.github/workflows/ci.yml`: Lint (ESLint and `prettier --check`), Typecheck (`next typegen && tsc --noEmit`), Unit tests, Build, E2E (Playwright + axe)                                   |
| Supply chain         | Every third-party action pinned to a full commit SHA with a version comment; `permissions: contents: read`; `persist-credentials: false`; `pnpm install --frozen-lockfile`                |
| Updates              | Dependabot, weekly on Monday (Asia/Kolkata), grouped (Next and React, testing, lint and format, Tailwind, other minor and patch, and GitHub Actions)                                      |
| Commits and branches | Conventional Commits, squash merge (the PR title becomes the commit), short-lived `feat/`, `fix/`, `docs/`, `chore/` branches                                                             |

Branch protection on `main` requires pull requests, all five checks, an up-to-date branch, linear
history and resolved conversations, and blocks force pushes and deletion.

Three tools in the scaffold have newer majors: ESLint 10, TypeScript 7 (with TypeScript 6 as a
bridge release) and pnpm 12. Octo asked for a decision. The research, done on 2026-10-31 against
the npm registry and the official documentation, is summarised below with links in References.

### Research findings

**ESLint.** `eslint@latest` is 10.14.0 (published 2026-10-30); the `maintenance` dist-tag is 9.39.5.
`npm view eslint@9.39.5 deprecated` returns "This version is no longer supported", and every 9.x
release carries the same notice. ESLint's version-support page lists v9 as **end of life since
2026-08-06** (last release 9.39.5 on 2026-07-10), so it no longer receives security fixes.
`eslint-config-next@16.4.3` declares the peer `eslint: ">=9.0.0"`, and the Next.js ESLint docs
state that `eslint-config-next` supports ESLint 10 from 16.4.0, including React version detection.
Peer ranges of the plugins it bundles:

| Package                     | Version | `eslint` peer range                | Includes 10 |
| --------------------------- | ------- | ---------------------------------- | ----------- |
| `typescript-eslint`         | 8.72.1  | `^8.57.0 \|\| ^9.0.0 \|\| ^10.0.0` | Yes         |
| `eslint-plugin-react-hooks` | 7.1.1   | `... \|\| ^9.0.0 \|\| ^10.0.0`     | Yes         |
| `eslint-plugin-react`       | 7.37.5  | `^3 \|\| ... \|\| ^8 \|\| ^9.7`    | No          |
| `eslint-plugin-jsx-a11y`    | 6.10.2  | `^3 \|\| ... \|\| ^9`              | No          |
| `eslint-plugin-import`      | 2.32.0  | `^2 \|\| ... \|\| ^8 \|\| ^9`      | No          |

A trial upgrade of this repository to `eslint@10.14.0` installed with pnpm "unmet peer" warnings
for the last three plugins only, and `pnpm lint`, `pnpm typecheck` and `pnpm build` all passed.
The Next.js docs confirm these warnings are expected. (The trial ran on Node 20.19.2, which
ESLint 10 supports; CI on Node 24 is the final check.)

**TypeScript.** `typescript@latest` is 7.0.2, the native Go compiler (7.0 announced 2026-07-08).
A 6.0 line exists: 6.0.3 (2026-04-16) is its latest release. TypeScript 7.0 ships **no JavaScript
compiler API**, and therefore no language-service plugin support. The TypeScript team's guidance is
to keep tools that need the API, such as typescript-eslint, on 6.0 until 7.1 ships a new API.
TypeScript 7 also turns 6.0's deprecations into hard errors and changes defaults (for example
`types` defaults to `[]`).

- Next.js 16.4 `next build`: supported. Since 16.3, `next build` type-checks with the
  project-local `tsc` CLI by default, which works with TypeScript 7. The trade-off is that
  diagnostics are raw `tsc` output without Next.js code frames.
- Next.js TypeScript editor plugin (`"plugins": [{ "name": "next" }]` in `tsconfig.json`): it is a
  TypeScript language-service plugin, and TypeScript 7 has no plugin API, so it does not run under
  TypeScript 7. The editor must use TypeScript 6 to keep it.
- typescript-eslint 8.72.1 declares `typescript: ">=4.8.4 <6.1.0"`. In a trial with
  `typescript@7.0.2`, `pnpm lint` crashed with "typescript-eslint does not support TS 7.0"
  (tracked in typescript-eslint issue #10940). `pnpm typecheck` and `pnpm build` passed.
- A trial with `typescript@6.0.3` passed lint, typecheck and build with no peer warnings.

**pnpm.** `pnpm@latest` is 12.16.1; 10.34.9 (2026-10-25) is still maintained on the `latest-10`
tag. Vercel's package-manager page lists pnpm 12 as supported, but its auto-detection maps
`lockfileVersion: 9.0` to pnpm 9 or 10. Using 11 or 12 requires Corepack
(`ENABLE_EXPERIMENTAL_COREPACK=1`) to honour `packageManager`. Two Vercel issues are open:
vercel/vercel#17560 (the builder passes `--unsafe-perm` to `pnpm install`, which pnpm 12 rejects)
and #17434 (pnpm 11 and 12 not supported). pnpm 12 changes the CLI (unknown flags are errors;
`--frozen-lockfile false` is no longer accepted) and its launcher is `bin/pnpm.mjs`. In a local
trial, Corepack 0.24 could not start pnpm 12 because it looked for `bin/pnpm.cjs`. Existing v9
lockfiles keep working, and the first re-resolving install produces a one-time lockfile diff. Our
CI only runs `pnpm install --frozen-lockfile`, so there is no benefit to the site that justifies
the deploy risk.

**Node.js.** Node.js 24 moved from Active to **Maintenance LTS on 2026-10-20** and reaches end of
life on 2028-04-30. Node.js 26 became Active LTS on 2026-10-28 and is now Vercel's default for new
projects (24.x and 22.x remain available).

## Options considered

### Option A: Strict automated gates, conservative majors, upgrade only what is EOL or a safe bridge (recommended)

Keep the five required checks. Move ESLint to 10 because 9 is end of life, and move TypeScript to
the 6.0 bridge because it is fully supported by every tool. Stay on pnpm 10 and Node 24 with
explicit revisit triggers.

- Pros: no tool in the chain is out of support; every upgrade has passed a trial on this
  repository; nothing depends on an open Vercel bug or an unreleased API.
- Cons: three peer-dependency overrides for ESLint 10 until the plugins update; we do not get
  TypeScript 7's speed (the current typecheck takes seconds, so the gain is small).

### Option B: Upgrade everything to latest now (ESLint 10, TypeScript 7, pnpm 12, Node 26)

- Pros: newest features and fastest type-checking; fewer upgrades later.
- Cons: `pnpm lint` fails outright under TypeScript 7 (typescript-eslint), so the Lint check
  would go red; the Next.js editor plugin stops working; pnpm 12 hits an open Vercel install bug
  and needs Corepack configuration; Node 26 has been LTS for three days.

### Option C: Keep the scaffold's pins unchanged (ESLint 9.39.5, TypeScript 5.9.3, pnpm 10.34.9)

- Pros: no work now; matches what Octo shipped.
- Cons: ESLint 9 is end of life and flagged deprecated on every install; staying on 5.9 delays the
  6.0 deprecation clean-up that TypeScript 7 will require.

## Decision

We adopt Option A.

**Quality gates.** The five checks (Lint, Typecheck, Unit tests, Build, E2E with Playwright and
axe) stay required on `main`. Lint includes `prettier --check`. Unit tests cover content schemas
and components; E2E covers every route, axe accessibility (no violations), the security headers in
0006 and the absence of CSP violations. No check may be skipped or marked optional without a new
ADR.

**Stack conventions.**

- TypeScript `strict` with `noUncheckedIndexedAccess`; `any` and non-null assertions need a
  justification in review.
- Tailwind CSS v4 with tokens defined in `@theme` in `src/styles/globals.css`. Pixel (Designer)
  owns the tokens; components use tokens only, never raw colour values. No component library.
- `motion` for animation, in client components only, under `MotionConfig reducedMotion="user"`.
- Fonts only through `next/font`, served from the site's own origin (required by the CSP in 0006).
- Conventional Commits; the squash-merge PR title is the commit message.
- Third-party GitHub Actions pinned to full commit SHAs, updated by Dependabot.

**Version pinning policy.**

1. `package.json` uses caret ranges for ordinary dependencies; the exact versions are locked in
   `pnpm-lock.yaml`, and CI installs with `--frozen-lockfile`.
2. Toolchain majors (Node.js, pnpm, TypeScript, ESLint, Next.js, React, Tailwind) change only in a
   dedicated `chore(deps)` pull request that references this ADR, never mixed with feature work.
   Dependabot may open the pull request; Atlas reviews it.
3. A range is narrowed to a tilde when a peer range requires it (TypeScript below).
4. A major upgrade is due when the current line reaches end of life, or when its revisit trigger
   below is met.

**Current pins and decisions:**

| Tool       | Today on `main` | Decision                                                                                                                                                                       | Revisit trigger                                                                                                                                                                                      |
| ---------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ESLint     | 9.39.5 (EOL)    | **Upgrade now** to `^10.14.0`, with pnpm `peerDependencyRules.allowedVersions` for `eslint-plugin-react`, `eslint-plugin-jsx-a11y` and `eslint-plugin-import` (`eslint: "10"`) | Remove each override when that plugin publishes a peer range that includes ESLint 10.                                                                                                                |
| TypeScript | 5.9.3           | **Upgrade now** to `~6.0.3` (tilde, because typescript-eslint supports `<6.1.0`)                                                                                               | Move to 7.x when typescript-eslint supports it (issue #10940, expected after the TypeScript 7.1 API) and the Next.js TypeScript plugin runs on it. Run `tsc` 7 side by side in CI earlier if useful. |
| pnpm       | 10.34.9         | **Stay** on 10.x                                                                                                                                                               | vercel/vercel#17560 and #17434 are fixed and Vercel builds a pnpm 12 project with the default install path; then upgrade in one PR with the lockfile re-resolve.                                     |
| Node.js    | 24.x            | **Stay** on 24.x (Maintenance LTS, supported to 2028-04-30)                                                                                                                    | Move to 26.x once Next.js, Playwright and Vercel builds pass on it in a trial PR, and no later than 2027-10-20, when Node 26 itself enters maintenance.                                              |

Octo implements the ESLint and TypeScript upgrades in one `chore(deps)` pull request after Kasani
approves this ADR. That pull request touches `package.json`, `pnpm-lock.yaml` and
`pnpm-workspace.yaml` and must pass all five checks. It also updates the README and CHANGELOG,
which name "ESLint 9" and "TypeScript 5".

## Consequences

- No tool in the build chain is out of support once the upgrade PR lands.
- Three peer-dependency overrides are carried until upstream plugins catch up, and they must be
  removed when they do.
- Pinning TypeScript with a tilde means Dependabot will not propose 6.1 or 7.x automatically; the
  revisit trigger above is the reminder.
- TypeScript 6.0's deprecations are surfaced now, which makes the later move to 7 a smaller step.
- Strict gates make each pull request slower (E2E needs a production build) but keep `main`
  deployable at all times, which is what 0004's production-from-`main` model relies on.
- Agents and Kasani run the same commands locally as CI (`CONTRIBUTING.md`), so local and CI
  results match.

## Assumptions

- **A1.** All tooling stays free. Every tool listed is open source or free for public
  repositories.
- **A2.** One human reviewer. Octo configured zero required approvals because Kasani is the only
  reviewer. Note: `CONTRIBUTING.md` currently says one approval is required, which does not match
  the branch protection and should be corrected in a separate pull request.
- **A3.** The trial upgrades ran on Node 20.19.2 on a build machine. The upgrade PR's CI on Node 24
  is the authoritative check.

## References

- ESLint version support and EOL dates: https://eslint.org/version-support
- ESLint v10.0.0 release notes: https://eslint.org/blog/2026/02/eslint-v10.0.0-released/
- Next.js ESLint plugin (ESLint 10 support from 16.4.0):
  https://nextjs.org/docs/app/api-reference/config/eslint
- Next.js issue on ESLint 10 peer warnings: https://github.com/vercel/next.js/issues/91702
- npm registry: https://www.npmjs.com/package/eslint, https://www.npmjs.com/package/eslint-config-next,
  https://www.npmjs.com/package/typescript-eslint, https://www.npmjs.com/package/typescript,
  https://www.npmjs.com/package/pnpm
- Announcing TypeScript 7.0: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
- Next.js TypeScript docs (Using TypeScript 7, IDE plugin):
  https://nextjs.org/docs/app/api-reference/config/typescript
- Next.js `useTypeScriptCli`:
  https://nextjs.org/docs/app/api-reference/config/next-config-js/useTypeScriptCli
- Next.js 16.3 release (TypeScript 7 type-checking): https://nextjs.org/blog/next-16-3
- typescript-eslint TypeScript 7 tracking issue:
  https://github.com/typescript-eslint/typescript-eslint/issues/10940
- pnpm 12 release notes: https://github.com/pnpm/pnpm/releases/tag/v12.0.0
- What's different in pnpm 12: https://pnpm.io/blog/whats-different-in-pnpm-12
- Vercel package managers: https://vercel.com/docs/package-managers
- Vercel issues: https://github.com/vercel/vercel/issues/17560,
  https://github.com/vercel/vercel/issues/17434
- Node.js release schedule: https://github.com/nodejs/Release#release-schedule
- Vercel Node.js versions: https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
