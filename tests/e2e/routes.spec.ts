import { readdirSync } from "node:fs";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const SETTLED_TRANSFORMS = new Set(["none", "matrix(1, 0, 0, 1, 0, 0)"]);

/** Resolves once every motion-driven element has reached its final position. */
async function waitForAnimationsToSettle(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        (settled) =>
          Array.from(document.querySelectorAll<HTMLElement>("[style*='transform']")).every(
            (element) => settled.includes(getComputedStyle(element).transform),
          ),
        [...SETTLED_TRANSFORMS],
      ),
    )
    .toBe(true);
}

async function expectNoA11yViolations(page: Page) {
  await waitForAnimationsToSettle(page);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

function collectCspViolations(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /Content Security Policy/i.test(message.text())) {
      errors.push(message.text());
    }
  });
  return errors;
}

const projectSlugs = readdirSync(path.join(process.cwd(), "content", "projects"))
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => file.replace(/\.mdx$/, ""));

test.describe("home", () => {
  test("renders, sends security headers and passes axe", async ({ page }) => {
    const cspErrors = collectCspViolations(page);
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    const headers = response?.headers() ?? {};
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");

    await expect(page.getByRole("heading", { level: 1, name: "Kasani Hariteja" })).toBeVisible();
    await expect(page.getByRole("link", { name: /GitHub/ }).first()).toHaveAttribute(
      "href",
      "https://github.com/Hari-1005",
    );
    await expectNoA11yViolations(page);
    expect(cspErrors).toEqual([]);
  });
});

test.describe("projects index", () => {
  test("renders and passes axe", async ({ page }) => {
    const cspErrors = collectCspViolations(page);
    const response = await page.goto("/projects");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
    await expectNoA11yViolations(page);
    expect(cspErrors).toEqual([]);
  });
});

test.describe("project detail", () => {
  for (const slug of projectSlugs) {
    test(`/projects/${slug} renders and passes axe`, async ({ page }) => {
      const response = await page.goto(`/projects/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoA11yViolations(page);
    });
  }

  test("unknown slug returns 404", async ({ page }) => {
    const response = await page.goto("/projects/this-project-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("content is visible and lands in place without animating", async ({ page }) => {
    await page.goto("/");
    const heading = page.getByRole("heading", { level: 1, name: "Kasani Hariteja" });
    await expect(heading).toBeVisible();
    const wrapper = heading.locator("..");
    await expect(wrapper).toHaveCSS("opacity", "1");
    await expect
      .poll(() => wrapper.evaluate((element) => getComputedStyle(element).transform), {
        timeout: 1_000,
      })
      .toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
  });
});

test.describe("not found", () => {
  test("renders the 404 page and passes axe", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
    await expectNoA11yViolations(page);
  });
});

test.describe("metadata routes", () => {
  test("robots.txt, sitemap.xml and the Open Graph image are served", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Sitemap:");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("/projects");

    const og = await request.get("/opengraph-image");
    expect(og.status()).toBe(200);
    expect(og.headers()["content-type"]).toContain("image/png");
  });
});
