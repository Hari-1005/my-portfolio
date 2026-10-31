# 0006. Security headers and Content Security Policy

- **Status:** Proposed (pending approval of the product requirements document and review by
  Shield, Security)
- **Date:** 2026-10-31
- **Deciders:** Atlas (Architect) proposes; Shield (Security) reviews; Kasani Hariteja approves
- **Related:** [0002](0002-framework-nextjs-app-router-static-first.md),
  [0004](0004-hosting-vercel-git-integration.md), [0005](0005-tooling-and-quality-gates.md)

## Context

The site is public, statically generated (0002) and served by Vercel (0004). It has no
authentication, no cookies, no forms and no user-generated content today, and it loads no
third-party scripts, styles or fonts. A portfolio is still a reputational asset: defacement,
clickjacking or script injection on it would reflect badly on its owner, so it should ship a
strong, tested header baseline.

`next.config.ts` on `main` (commit `b303f0c`) sets these headers on every route (`/:path*`):

| Header                       | Value                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| `Content-Security-Policy`    | see below                                                                          |
| `Strict-Transport-Security`  | `max-age=63072000; includeSubDomains; preload`                                     |
| `X-Content-Type-Options`     | `nosniff`                                                                          |
| `Referrer-Policy`            | `strict-origin-when-cross-origin`                                                  |
| `Permissions-Policy`         | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()` |
| `X-Frame-Options`            | `DENY`                                                                             |
| `Cross-Origin-Opener-Policy` | `same-origin`                                                                      |

It also sets `poweredByHeader: false`. `X-Frame-Options` and `Cross-Origin-Opener-Policy` go beyond
the original brief; they are kept (`X-Frame-Options` covers older browsers that ignore
`frame-ancestors`).

The production CSP is:

```text
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self';
object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
manifest-src 'self'; worker-src 'self' blob:; upgrade-insecure-requests
```

In development only, `script-src` adds `'unsafe-eval'` (React uses `eval` for debugging) and
`connect-src` adds `ws:` (hot reload). The E2E suite asserts the main headers and fails on any CSP
violation logged in the browser console.

**Why `'unsafe-inline'` is there.** The App Router emits inline `<script>` elements on every page:
the Turbopack chunk loader and the React Server Components payload
(`self.__next_f.push(...)`). Their contents differ per page and per build. `next/font` and
`motion` also set inline styles. Next.js can only attach a CSP nonce to these scripts when the page
is rendered per request, and statically generated pages exist before any request does.

**Research on hash-based CSP (experimental SRI).** The Next.js CSP guide documents
`experimental.sri` as an "experimental" App Router feature that "generates cryptographic hashes of
your JavaScript files at build time" and adds them as `integrity` attributes, so that pages can
"maintain static generation". We tested it on this repository with Next.js 16.4.3 and Turbopack.
The build stayed fully static, but the home page's HTML contained 13 `<script>` elements: 9
external, of which only 6 received an `integrity` attribute, and **4 inline scripts** (chunk
loader and RSC payload) with no hash. SRI only covers external files; it does not produce hashes
for inline scripts or add them to the CSP header. A `script-src 'self'` policy without
`'unsafe-inline'` would therefore block the inline bootstrap and break hydration. The docs also
note that SRI cannot handle dynamically generated scripts.

## Options considered

### Option A: Static CSP in `next.config.ts` with `'unsafe-inline'` for scripts and styles, as an accepted risk (recommended)

- Pros:
  - Keeps every page static and CDN-cached (0002, 0004).
  - Everything except inline code is locked to the site's own origin: no third-party script,
    style, font, frame or connection is allowed; `object-src 'none'`, `base-uri 'self'`,
    `form-action 'self'` and `frame-ancestors 'none'` still apply.
  - Matches the Next.js guide's "without nonces" configuration; simple, and tested in E2E.
- Cons:
  - `'unsafe-inline'` removes CSP's main defence against reflected or stored XSS: an injected
    inline script would run.
- Why the risk is acceptable now: XSS needs an injection point, and the site has none. There is no
  user input, no query-string rendering, no cookies or sessions to steal, and no third-party
  content. All content comes from MDX files that only the owner can merge, and React escapes
  rendered strings. The remaining risk is a malicious dependency or a compromised build, which no
  CSP fully stops. Lockfile pinning, Dependabot, SHA-pinned actions and branch protection (0005)
  address it instead.

### Option B: Nonce-based CSP through Proxy (formerly Middleware)

A `proxy.ts` generates a fresh nonce per request and sets
`script-src 'self' 'nonce-…' 'strict-dynamic'` and a nonce-based `style-src`. Next.js applies the
nonce to its own scripts during rendering.

- Pros: removes `'unsafe-inline'` from `script-src`; the strictest policy Next.js supports.
- Cons: every page must render per request. The Next.js docs list the costs: static optimisation
  and ISR are disabled, pages cannot be CDN-cached by default, initial loads are slower and
  hosting costs rise. Each page view becomes a Vercel Function invocation, which uses up Hobby-plan
  limits and adds a runtime that can fail. It is disproportionate for a site with no injection
  surface.

### Option C: Hash-based CSP or Subresource Integrity (`experimental.sri`)

- Pros: keeps static generation; `integrity` attributes protect external chunks against tampering
  in transit or on the CDN.
- Cons: our test shows it does not remove the need for `'unsafe-inline'`, because the inline
  bootstrap and RSC payload scripts are not hashed, and with Turbopack 3 of 9 external chunks had
  no `integrity` attribute. Hashing the inline scripts ourselves would mean a custom post-build step
  producing a different CSP header per page, re-generated on every build. It is experimental and
  "may change or be removed". All scripts are same-origin, so an attacker who can change a chunk
  on Vercel can also change the HTML that carries its hash; the gain over Option A is therefore
  small.

## Decision

We adopt **Option A**: keep the static header set in `next.config.ts`, including `'unsafe-inline'`
in `script-src` and `style-src`, and record it as an **accepted risk**. We do not enable
`experimental.sri` now.

Rules that keep the accepted risk small:

1. No third-party origins in any directive. Adding one (analytics, embeds, a font CDN) needs an
   ADR update and Shield's review.
2. Nothing renders user-controlled input. `dangerouslySetInnerHTML` is not used outside framework
   internals and needs Shield's review if proposed.
3. E2E keeps asserting the headers and failing on CSP violations.
4. `'unsafe-eval'` and `ws:` stay development-only.

**Revisit triggers.** Re-open this decision, with Option B as the default answer, if any of these
happen:

- The site gains user input that is rendered back (comments, a guestbook) or any authentication.
- A third-party script is added (for example analytics). Prefer a first-party, script-free option
  first.
- Next.js ships hashes for its inline scripts in static output, or SRI leaves the experimental
  stage. Then re-test Option C.

A contact form alone does not trigger the revisit: its Route Handler runs on the server and posts
to `'self'` (`form-action 'self'` and `connect-src 'self'` already allow that). It still needs its
own ADR for validation, spam protection and rate limiting.

**For Shield (Security) review:**

- Confirm `'unsafe-inline'` as an accepted risk under the conditions above.
- HSTS is sent with `includeSubDomains; preload`. On `*.vercel.app` this only affects the site's
  own host. Before a custom domain is submitted to the HSTS preload list, confirm that every
  subdomain of that domain serves HTTPS, because preload is hard to undo. Until then, decide
  whether to keep the `preload` token.
- Consider adding `Cross-Origin-Resource-Policy: same-origin` and a CSP `report-to` endpoint once
  there is somewhere to receive reports. Neither exists today.

## Consequences

- Pages stay static and CDN-cached; there is no per-request cost.
- The CSP still blocks every external script, style, font, frame and connection, plugins,
  `<base>` hijacking, off-site form posts and framing by other sites.
- Inline script injection would not be blocked by CSP. Protection rests on having no injection
  point and on supply-chain controls, and must be re-assessed whenever a revisit trigger fires.
- These headers come from `next.config.ts`, so they depend on the default Next.js output on Vercel
  (0002, 0004). A static export or another host would have to re-implement them.

## Assumptions

- **A1 (pending PRD).** No authentication, no user-generated content and no third-party scripts.
  Analytics is an open PRD question. If chosen, it must fit rule 1 or trigger a revisit.
- **A2 (pending PRD).** If a contact form is added, it is first-party (a Route Handler on the same
  origin), not an embedded third-party form.
- **A3.** The SRI finding reflects Next.js 16.4.3 with Turbopack on 2026-10-31 and should be
  re-tested on later Next.js minors.

## References

- Next.js Content Security Policy guide (nonces, static vs dynamic, experimental SRI):
  https://nextjs.org/docs/app/guides/content-security-policy
- Next.js `headers` in `next.config`:
  https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
- MDN, Content-Security-Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy
- OWASP HTTP Headers Cheat Sheet:
  https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
- HSTS preload list requirements: https://hstspreload.org/
