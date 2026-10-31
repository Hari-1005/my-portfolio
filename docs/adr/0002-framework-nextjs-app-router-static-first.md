# 0002. Next.js App Router, static-first, default output

- **Status:** Proposed (pending approval of the product requirements document)
- **Date:** 2026-10-31
- **Deciders:** Atlas (Architect) proposes; Kasani Hariteja approves
- **Related:** [0003](0003-content-mdx-in-repo.md), [0004](0004-hosting-vercel-git-integration.md),
  [0006](0006-security-headers-and-csp.md)

## Context

The product is Kasani Hariteja's professional portfolio site. The pages known so far are a home
page, a projects list and one page per project. Further sections (experience, skills, a blog, a
contact form) depend on the PRD, which is not yet approved.

Forces:

- **Audience and discoverability.** Recruiters and other visitors arrive from search and from
  shared links, so every page needs server-rendered HTML, per-page metadata, a sitemap and Open
  Graph images for link previews.
- **Content changes rarely.** Content is edited by hand and published by a commit, so there is no
  need to render per request.
- **Owner's familiarity.** Kasani is a full-stack developer who already uses Vercel, and wants the
  site to be easy to run locally.
- **Possible dynamic features.** A contact form is an open PRD question. Whatever we choose must be
  able to add one server endpoint later without changing framework or host.
- **Cost.** The site should be free to run apart from an optional domain (see 0004).

The scaffold on `main` (commit `b303f0c`) already implements this decision: Next.js `^16.4.3`
(App Router, Turbopack), React `^19.3.1`, no `output` setting in `next.config.ts`, and the build
reports every route as static (`○`) or SSG (`●`, `/projects/[slug]` via `generateStaticParams`
with `dynamicParams = false`). It also ships `sitemap.ts`, `robots.ts` and `opengraph-image.tsx`.

## Options considered

### Option A: Next.js 16.4 App Router, statically generated, default output (recommended)

Server Components render every page at build time; Vercel serves the HTML from its CDN.
`next.config.ts` keeps the default build output rather than `output: 'export'`.

- Pros:
  - Static HTML for every page today, with no server cost per request.
  - Built-in metadata API, `sitemap.ts`, `robots.ts` and `opengraph-image.tsx` cover SEO and link
    previews without extra libraries.
  - `next/font` self-hosts fonts at build time; `next/image` optimisation is available on Vercel.
  - The default output keeps the server features: a Route Handler (for example
    `src/app/api/contact/route.ts`) or a Server Action can be added later and deployed as a Vercel
    Function, while every other page stays static. Security headers in `next.config.ts`
    (`headers()`) only work with this output.
  - Vercel builds Next.js with zero configuration, which matches Kasani's existing workflow.
  - React Server Components keep most content pages free of client JavaScript; only interactive or
    animated components (`motion`) are client components.
- Cons:
  - Larger framework surface and more frequent major releases than a pure static generator.
  - Ships React's runtime and the RSC payload even on static pages, so a content page carries more
    JavaScript than an Astro page would.
  - The App Router's inline bootstrap scripts constrain the CSP (see 0006).
  - Self-hosting outside Vercel needs a Node server or a static export, with the trade-offs in 0004.

### Option B: Astro

A content-first static site generator with optional "islands" of client-side interactivity.

- Pros: ships zero JavaScript by default, so pages are lighter; first-class Markdown and MDX
  content collections with schema validation; can add server endpoints through an adapter.
- Cons: a second framework for a developer whose existing workflow is Next.js on Vercel; React
  components work only as islands; Open Graph image generation and font self-hosting need
  integrations instead of being built in; `motion` animations run only inside React islands.

### Option C: Plain Vite single-page application (React)

- Pros: smallest toolchain; very fast local development; any static host works.
- Cons: client-side rendering means the HTML has no content until JavaScript runs, which weakens
  SEO and link previews (Open Graph tags would need a separate pre-render step); no file-based
  routing, metadata API, sitemap or image optimisation without adding libraries; a contact form
  would need a separate backend.

## Decision

We will build the site with **Next.js 16.4 (App Router) and React 19**, rendering every page
statically at build time and deploying on Vercel. We will keep Next.js's **default build output**
and will not set `output: 'export'`, so that a Route Handler such as a contact form endpoint can be
added later without re-architecting and so that `next.config.ts` headers keep working.

Rules that follow from this:

- Pages are Server Components by default. A component becomes a client component only when it
  needs browser APIs, state or animation.
- Dynamic routes over content use `generateStaticParams` with `dynamicParams = false`, so unknown
  slugs return 404 and nothing renders per request.
- Any route that would render per request (cookies, headers, `connection()`, uncached fetches)
  needs a new ADR, because it changes cost, caching and the CSP trade-off in 0006.

## Consequences

- Every page is served as static HTML from Vercel's CDN; there is no runtime server to run or pay
  for while the site is purely static.
- Adding a contact form later means adding one Route Handler or Server Action plus its own ADR
  (validation, spam protection, rate limiting, email delivery). Nexus (System Design) owns that
  design if the PRD includes it.
- Next.js major upgrades need to be tracked (see the version policy in 0005).
- Pages carry React's runtime. Performance budgets in Lighthouse or Core Web Vitals should be set
  once Pixel's designs exist.
- Moving off Vercel later is possible but costs features (see 0004).

## Assumptions

- **A1 (pending PRD).** The site is static: no authentication, no user accounts, no per-visitor
  content. If the PRD adds any of these, this ADR needs revisiting.
- **A2 (pending PRD).** A contact form, blog and analytics are undecided. The default output keeps
  all three possible; none is built until the PRD includes it.
- **A3.** Kasani is a full-stack developer who already uses Vercel and wants a smooth local
  workflow. This comes from the project brief, not from his resume, which the team has not yet
  received.

## References

- Next.js App Router documentation: https://nextjs.org/docs/app
- Next.js static exports and their unsupported features:
  https://nextjs.org/docs/app/guides/static-exports
- Next.js metadata and Open Graph images:
  https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- Astro: https://docs.astro.build/
- Vite: https://vite.dev/guide/
