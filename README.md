# my-portfolio

Source for the personal portfolio website of **Kasani Hariteja**
([github.com/Hari-1005](https://github.com/Hari-1005)).

A statically generated Next.js site. Content lives as MDX files in the repository; there is no
database or CMS. It is deployed on Vercel.

## Stack

| Concern         | Choice                                                                    |
| --------------- | ------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack), React 19                              |
| Language        | TypeScript 5, `strict` + `noUncheckedIndexedAccess`                       |
| Styling         | Tailwind CSS v4, tokens in `src/styles/globals.css` (`@theme`)            |
| Animation       | `motion` (`motion/react`, client components only, honours reduced motion) |
| Fonts           | `next/font` (self-hosted at build time, no runtime font CDN)              |
| Content         | MDX in `content/` via `next-mdx-remote/rsc` + `gray-matter`, zod schemas  |
| Lint / format   | ESLint 9 flat config (`eslint-config-next`), Prettier + Tailwind plugin   |
| Unit tests      | Vitest, Testing Library, jsdom                                            |
| E2E / a11y      | Playwright + `@axe-core/playwright` against the production build          |
| Runtime / tools | Node.js 24 LTS, pnpm 10 (via Corepack)                                    |
| Hosting         | Vercel Git integration                                                    |

## Local setup

Requirements: Node.js 24 (`nvm use` reads `.nvmrc`) and Corepack (bundled with Node).

```bash
corepack enable          # provides the pnpm version pinned in package.json
pnpm install
cp .env.example .env.local
pnpm dev                 # http://localhost:3000
```

## Scripts

| Script           | Purpose                                                |
| ---------------- | ------------------------------------------------------ |
| `pnpm dev`       | Development server (Turbopack)                         |
| `pnpm build`     | Production build; fails on invalid content frontmatter |
| `pnpm start`     | Serve the production build                             |
| `pnpm lint`      | ESLint                                                 |
| `pnpm format`    | Prettier write (`format:check` to verify)              |
| `pnpm typecheck` | Generate route types and run `tsc --noEmit`            |
| `pnpm test`      | Unit tests (Vitest)                                    |
| `pnpm test:e2e`  | Playwright + axe against `pnpm start` (build first)    |

First E2E run: `pnpm exec playwright install chromium`.

## Environment variables

| Variable                        | Required | Description                                                                                               |
| ------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`          | No       | Canonical URL (no trailing slash) for metadata, sitemap and robots. Set it when a custom domain is added. |
| `VERCEL_PROJECT_PRODUCTION_URL` | No       | Set automatically by Vercel; used when `NEXT_PUBLIC_SITE_URL` is unset.                                   |

Without either, the site URL falls back to `http://localhost:3000`. See `.env.example`.

## Project structure

```
src/app/                 routes, not-found, sitemap.ts, robots.ts, opengraph-image.tsx
src/components/ui/       primitives (Container, ExternalLink, Reveal, MDX components)
src/components/sections/ page sections (header, footer, hero, projects)
src/lib/                 content.ts (MDX loading + zod), seo.ts, utils.ts
src/styles/globals.css   Tailwind v4 theme tokens
content/profile.ts       verified profile facts
content/projects/*.mdx   one file per project (schema in content/projects/README.md)
tests/unit, tests/e2e    Vitest and Playwright suites
docs/adr/                architecture decision records
```

## Security headers

`next.config.ts` sets CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`, `X-Frame-Options` and COOP on every route. Because pages are statically
generated (no per-request nonce), the CSP allows `'unsafe-inline'` for scripts and styles, which
Next.js needs for its inline bootstrap; every other directive is restricted to the site's own
origin. The E2E suite asserts the headers and fails on CSP console violations.

## Deployment

Deployed by the Vercel Git integration; there is no deploy workflow in this repository.

- **Production:** every push to `main`.
- **Preview:** every pull request gets its own preview URL.
- Vercel project settings: Node.js 24.x, framework preset Next.js, install command
  `pnpm install --frozen-lockfile`.

## Contributing

- **Branching:** trunk-based. `main` is always deployable and protected; work happens on
  short-lived `feat/*`, `fix/*`, `docs/*` or `chore/*` branches.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/).
- **Merging:** pull requests only, green CI required, squash merge.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE) © 2026 Kasani Hariteja
