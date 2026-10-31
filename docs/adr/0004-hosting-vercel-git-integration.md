# 0004. Hosting on Vercel through the Git integration

- **Status:** Proposed (pending approval of the product requirements document)
- **Date:** 2026-10-31
- **Deciders:** Atlas (Architect) proposes; Kasani Hariteja approves; Octo (DevOps) operates
- **Related:** [0002](0002-framework-nextjs-app-router-static-first.md),
  [0005](0005-tooling-and-quality-gates.md), [0006](0006-security-headers-and-csp.md)

## Context

The site is a statically generated Next.js app (0002) that should be free to run and needs a
reviewable preview of every change before it goes live. Kasani already uses Vercel.

State of the repository on `main` (commit `b303f0c`):

- There is no deploy workflow in `.github/workflows/`; `ci.yml` only runs Lint, Typecheck, Unit
  tests, Build and E2E. The README documents deployment through the Vercel Git integration.
- `package.json` sets `"engines": { "node": ">=24 <25" }`, which Vercel honours over the project
  setting, so builds use the latest Node.js 24.x. It also sets `"packageManager": "pnpm@10.34.9"`.
- The README asks for these Vercel project settings: Node.js 24.x, framework preset Next.js,
  install command `pnpm install --frozen-lockfile`.
- `src/lib/seo.ts` derives the canonical URL from `NEXT_PUBLIC_SITE_URL`, then from
  `VERCEL_PROJECT_PRODUCTION_URL` (set by Vercel), then `http://localhost:3000`.
- The Vercel project is not yet linked to the repository. Linking needs Kasani's own Vercel login,
  which no agent can do on his behalf.

## Options considered

### Option A: Vercel Git integration on the Hobby plan (recommended)

Vercel watches the GitHub repository: a push to `main` builds and deploys production; every pull
request gets its own preview deployment and URL, posted back to the pull request.

- Pros:
  - Zero deploy code to maintain: no tokens in GitHub secrets, no deploy workflow.
  - Preview URL per pull request, so Kasani reviews content and design changes in a browser.
  - Full Next.js support with no adapter: static pages on the CDN, `next.config.ts` headers,
    `next/image` optimisation, Open Graph image routes, and Vercel Functions for a future Route
    Handler.
  - Free on the Hobby plan, whose included usage (for example 100 GB of fast data transfer and 1
    million CDN requests per month) is far above what a portfolio needs.
  - Instant rollback to any earlier production deployment from the Vercel dashboard.
- Cons:
  - Vendor coupling: some features (image optimisation, Functions) are Vercel-specific in
    practice.
  - Deploys are not gated on GitHub CI. Vercel builds as soon as a commit lands, independently of
    the required checks. Production only changes through `main`, which branch protection guards,
    so the risk is limited to previews building from unreviewed branches.
  - The Hobby plan is restricted to non-commercial personal use under Vercel's fair use
    guidelines.
  - Vercel picks the pnpm major from the lockfile (`lockfileVersion: 9.0` maps to pnpm 9 or 10)
    unless Corepack is enabled with `ENABLE_EXPERIMENTAL_COREPACK=1`, so the `packageManager`
    pin is not enforced by default.

### Option B: GitHub Pages with a static export

`output: 'export'` writes plain files to `out/`, and a GitHub Actions workflow publishes them.

- Pros: free; no third-party account beyond GitHub; fully portable static files.
- Cons:
  - A static export drops features the site uses or may need: `next.config.ts` `headers()`,
    redirects, rewrites, Proxy, Route Handlers that read the request, Server Actions and the
    default `next/image` loader.
  - GitHub Pages cannot set custom response headers, so the CSP would have to move to a `<meta>`
    tag, where `frame-ancestors` is ignored, and HSTS, `Permissions-Policy` and the other headers
    in 0006 could not be sent at all.
  - No built-in preview deployment per pull request.
  - A contact form would need a separate backend on another host.
  - Needs a deploy workflow with Pages permissions, which this repository otherwise avoids.

### Option C: Vercel deploys driven from GitHub Actions (Vercel CLI)

- Pros: production deploys can wait for all five required checks to pass.
- Cons: needs a Vercel token stored as a GitHub secret, a deploy workflow to maintain and secure,
  and duplicates what the Git integration does. Branch protection already gives the important
  guarantee that only reviewed, green code reaches `main`.

## Decision

We will host on **Vercel using its Git integration**, with no deploy workflow in this repository:

- **Production:** every push to `main`, which branch protection limits to squash-merged pull
  requests with all five required checks green.
- **Preview:** every pull request gets its own deployment and URL.
- **Project settings:** framework preset Next.js; Node.js 24.x (also enforced by `engines`);
  install command `pnpm install --frozen-lockfile`.
- **Domain:** the default `*.vercel.app` production domain until Kasani names a custom domain. When
  he does, add it in Vercel and set `NEXT_PUBLIC_SITE_URL` for the Production environment so
  canonical URLs, the sitemap and `robots.txt` use it.

Octo (DevOps) links the project once Kasani has signed in to Vercel himself.

## Consequences

- No deploy secrets live in GitHub, which shrinks the CI attack surface.
- Every pull request, including ADR and content changes, gets a preview URL to review.
- Vercel builds independently of GitHub Actions. A pull request whose CI fails can still produce a
  preview, but it cannot reach production because it cannot merge.
- If the site ever becomes commercial (for example selling services), the Hobby plan's terms
  require moving to a paid plan or another host.
- Leaving Vercel later means either a Node server host or a static export with the losses listed in
  Option B; 0006's headers would need re-implementing at the new host.
- Vercel's default Node.js for new projects is now 26.x. The `engines` range keeps this project on
  24.x until 0005's revisit trigger moves it.

## Assumptions

- **A1 (flagged, pending PRD).** The site runs on Vercel's free Hobby plan and stays non-commercial
  personal use. Orion (Manager) asked the team to work from "free to run apart from a domain".
- **A2 (flagged, pending Kasani).** The site uses the `*.vercel.app` domain until Kasani names a
  custom domain. Buying and configuring a domain is his decision and cost.
- **A3.** Kasani will connect his own Vercel account to the GitHub repository; agents do not hold
  Vercel credentials.

## References

- Vercel Git deployments: https://vercel.com/docs/deployments/git
- Vercel Hobby plan, included usage and fair use: https://vercel.com/docs/plans/hobby
- Vercel package manager detection: https://vercel.com/docs/package-managers
- Vercel Corepack setting: https://vercel.com/docs/builds/configure-a-build#corepack
- Vercel supported Node.js versions:
  https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- Next.js static export unsupported features:
  https://nextjs.org/docs/app/guides/static-exports#unsupported-features
- GitHub Pages documentation: https://docs.github.com/en/pages
