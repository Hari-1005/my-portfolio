import { describe, expect, it } from "vitest";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";

const env = (vars: Record<string, string>) => vars as unknown as NodeJS.ProcessEnv;

describe("getSiteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL and strips trailing slashes", () => {
    expect(
      getSiteUrl(
        env({
          NEXT_PUBLIC_SITE_URL: "https://example.com/",
          VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app",
        }),
      ),
    ).toBe("https://example.com");
  });

  it("falls back to VERCEL_PROJECT_PRODUCTION_URL with https", () => {
    expect(getSiteUrl(env({ VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" }))).toBe(
      "https://x.vercel.app",
    );
  });

  it("falls back to localhost", () => {
    expect(getSiteUrl(env({}))).toBe("http://localhost:3000");
  });
});

describe("absoluteUrl", () => {
  it("joins paths onto the site URL", () => {
    expect(absoluteUrl("/projects", "https://example.com")).toBe("https://example.com/projects");
  });
});
