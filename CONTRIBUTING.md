# Contributing

## Workflow

1. Branch from `main` with a short-lived branch: `feat/<topic>`, `fix/<topic>`, `docs/<topic>`,
   `chore/<topic>`.
2. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   `feat: add projects grid`, `fix(seo): correct canonical URL`.
3. Before pushing, run:

   ```bash
   pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
   ```

4. Open a pull request using the template. CI must be green and one approval is required.
5. PRs are **squash-merged**; the PR title becomes the commit message, so it must follow
   Conventional Commits.
6. Add user-facing changes to `CHANGELOG.md` under **Unreleased**.

## Content rules

- Never add placeholder or invented personal data. Everything under `content/` must be supplied
  or approved by Kasani.
- Project files go in `content/projects/<slug>.mdx`; see `content/projects/README.md` for the
  frontmatter schema. Invalid frontmatter fails the build by design.

## Issues

Use the **User story** or **Bug report** templates. Labels are defined in `.github/labels.yml`.
