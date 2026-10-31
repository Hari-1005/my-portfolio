# Projects

One MDX file per project. The filename (without `.mdx`) is the URL slug and must be
lowercase kebab-case, for example `my-project.mdx` → `/projects/my-project`.

Frontmatter is validated at build time by `src/lib/content.ts`; an invalid file fails the build.

```mdx
---
title: Project name
summary: One or two sentences describing the project.
date: 2026-01-31
tags: [nextjs, typescript]
repo: https://github.com/Hari-1005/<repository>
url: https://<live-site>
featured: false
draft: false
---

Markdown / MDX body.
```

Required: `title`, `summary`, `date` (`YYYY-MM-DD`). Optional: `tags`, `repo`, `url`, `featured`,
`draft` (drafts are excluded from the build).
