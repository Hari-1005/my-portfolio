# 0003. Content as MDX in the repository, validated at build time

- **Status:** Proposed (pending approval of the product requirements document)
- **Date:** 2026-10-31
- **Deciders:** Atlas (Architect) proposes; Kasani Hariteja approves
- **Related:** [0002](0002-framework-nextjs-app-router-static-first.md),
  [0004](0004-hosting-vercel-git-integration.md)

## Context

The site presents Kasani's projects and, once the PRD settles the sections, other profile content.
Content changes rarely and is written by one person. Every published fact about Kasani must come
from him; the repository's `CONTRIBUTING.md` and `content/profile.ts` both forbid placeholder or
invented personal data.

What the scaffold on `main` (commit `b303f0c`) already does:

- `content/projects/<slug>.mdx`: one MDX file per project. The file name is the URL slug and must
  be lowercase kebab-case.
- `src/lib/content.ts` reads the files with `node:fs`, parses frontmatter with `gray-matter` and
  validates it with a strict `zod` schema: `title`, `summary` (at most 300 characters) and `date`
  (`YYYY-MM-DD`) are required; `tags`, `repo` and `url` (HTTPS only), `featured` and `draft` are
  optional; unknown keys are rejected. An invalid file throws `ContentValidationError`, which fails
  `next build`. Drafts are excluded.
- `src/app/projects/[slug]/page.tsx` renders the body with `MDXRemote` from `next-mdx-remote/rsc`
  as a Server Component, with a shared component map in `src/components/ui/mdx-components.tsx`.
- `content/profile.ts` holds verified profile facts (name, GitHub username and URL) as a typed
  TypeScript constant rather than MDX.
- `tests/unit/content.test.ts` covers valid, invalid and bad-slug fixtures.
- `next.config.ts` adds `content/**` to `outputFileTracingIncludes` so the files are traced into
  any server output.
- `content/projects/` contains only a `README.md` today; no project content exists yet.

## Options considered

### Option A: MDX files in the repository, validated with zod at build time (recommended)

- Pros:
  - No database, CMS account or API key; nothing to pay for or keep running.
  - Content is versioned, reviewed in pull requests and deployed with a preview URL like code.
  - A bad file fails CI and the build, so broken content never reaches production.
  - MDX allows the occasional custom component (a diagram, a callout) inside a case study.
  - Works offline and locally with `pnpm dev`.
- Cons:
  - Editing needs GitHub (the web editor is enough) and Markdown; there is no WYSIWYG editor.
  - Every content change triggers a full build and deploy (seconds to minutes, not instant).
  - Images must be committed to the repository or referenced by URL.
  - MDX bodies are compiled at build time and can run components. Content is trusted because only the
    owner can merge to `main`; this would not be safe for third-party content.

### Option B: Headless CMS (for example Sanity)

- Pros: a hosted editing interface usable from any device; structured content with references;
  image pipeline and CDN; content updates without a commit (with on-demand revalidation).
- Cons: another account, API token and set of webhooks to secure and maintain; free tiers have
  limits and terms that can change; content lives outside the repository, so it is not reviewed in
  pull requests; preview and revalidation add dynamic surface and complexity to an otherwise
  static site; a CMS outage or schema drift can break builds.

### Option C: Plain Markdown or JSON without MDX

- Pros: simplest parsing; no component execution in content.
- Cons: no custom components in case studies; switching to MDX later would mean migrating every
  file.

## Decision

We will keep all site content in the repository under `content/`. Long-form entries (projects, and
any later collection such as blog posts if the PRD adds them) are MDX files with YAML frontmatter,
parsed with `gray-matter` and rendered with `next-mdx-remote/rsc` in Server Components.
Frontmatter is validated with a strict `zod` schema at build time, and an invalid file fails the
build. Short, structured facts that are not prose (such as `content/profile.ts`) may live as typed
TypeScript modules in `content/`.

Each new collection gets its own schema in `src/lib/` and unit tests for valid and invalid
fixtures, following the pattern in `src/lib/content.ts`.

## Consequences

- Kasani edits content by changing files in GitHub (web editor or locally) and merging a pull
  request; the Vercel preview shows the change before it goes live.
- The build is the content validator. A schema change is a breaking change for existing files and
  must update them in the same pull request.
- No content can be published without passing CI, including the Playwright and axe checks.
- If the PRD requires non-technical editing or very frequent updates, this ADR is superseded by
  one adopting a CMS; the zod schemas then become the CMS schema's source of truth.

## Assumptions

- **A1 (flagged, pending PRD).** Kasani is comfortable editing Markdown in GitHub and does not need
  a CMS. Orion (Manager) asked the team to work from this assumption until Kasani answers.
- **A2 (pending PRD).** Whether a blog or writing section exists is undecided. If it does, it
  becomes a second MDX collection with its own schema, not a new system.
- **A3.** All content is authored or approved by Kasani. Nothing about his experience, projects or
  skills is written until his resume and LinkedIn export arrive.

## References

- next-mdx-remote (RSC usage): https://github.com/hashicorp/next-mdx-remote
- gray-matter: https://github.com/jonschlinkert/gray-matter
- zod: https://zod.dev/
- Next.js MDX guide: https://nextjs.org/docs/app/guides/mdx
- Sanity: https://www.sanity.io/docs
