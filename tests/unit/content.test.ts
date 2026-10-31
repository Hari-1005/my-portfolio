import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ContentValidationError,
  getProjectBySlug,
  getProjects,
  parseProject,
  projectFrontmatterSchema,
} from "@/lib/content";

const fixtures = path.join(__dirname, "fixtures");
const validDir = path.join(fixtures, "projects-valid");

describe("projectFrontmatterSchema", () => {
  const base = { title: "T", summary: "S", date: "2026-01-31" };

  it("applies defaults for optional fields", () => {
    expect(projectFrontmatterSchema.parse(base)).toEqual({
      ...base,
      tags: [],
      featured: false,
      draft: false,
    });
  });

  it.each([
    ["non-ISO date", { ...base, date: "31/01/2026" }],
    ["empty title", { ...base, title: "  " }],
    ["non-https repo", { ...base, repo: "http://github.com/x/y" }],
    ["unknown key", { ...base, unknown: true }],
  ])("rejects %s", (_label, input) => {
    expect(projectFrontmatterSchema.safeParse(input).success).toBe(false);
  });
});

describe("parseProject", () => {
  it("normalises YAML dates to YYYY-MM-DD", () => {
    const project = parseProject("x.mdx", "---\ntitle: X\nsummary: Y\ndate: 2026-02-03\n---\nBody");
    expect(project).toMatchObject({ slug: "x", date: "2026-02-03" });
    expect(project.body.trim()).toBe("Body");
  });
});

describe("getProjects", () => {
  it("returns an empty list when the directory does not exist", async () => {
    await expect(getProjects(path.join(fixtures, "does-not-exist"))).resolves.toEqual([]);
  });

  it("loads published MDX files newest first and skips drafts and other files", async () => {
    const projects = await getProjects(validDir);
    expect(projects.map((p) => p.slug)).toEqual(["alpha-fixture", "beta-fixture"]);
    expect(projects[0]).toMatchObject({ featured: true, tags: ["fixture"] });
  });

  it("throws a ContentValidationError naming the file for invalid frontmatter", async () => {
    const promise = getProjects(path.join(fixtures, "projects-invalid"));
    await expect(promise).rejects.toBeInstanceOf(ContentValidationError);
    await expect(promise).rejects.toThrow(/missing-title\.mdx/);
  });

  it("rejects file names that are not kebab-case slugs", async () => {
    await expect(getProjects(path.join(fixtures, "projects-bad-slug"))).rejects.toThrow(
      /kebab-case/,
    );
  });

  it("loads the real content/projects directory without errors", async () => {
    await expect(getProjects()).resolves.toBeInstanceOf(Array);
  });
});

describe("getProjectBySlug", () => {
  it("finds a published project and ignores drafts", async () => {
    await expect(getProjectBySlug("beta-fixture", validDir)).resolves.toMatchObject({
      title: "Beta fixture",
    });
    await expect(getProjectBySlug("draft-fixture", validDir)).resolves.toBeUndefined();
  });
});
