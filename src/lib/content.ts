import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

export const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const projectFrontmatterSchema = z
  .object({
    title: z.string().trim().min(1),
    summary: z.string().trim().min(1).max(300),
    date: z.iso.date(),
    tags: z.array(z.string().trim().min(1)).default([]),
    repo: z.url({ protocol: /^https$/ }).optional(),
    url: z.url({ protocol: /^https$/ }).optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  })
  .strict();

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;

export interface Project extends ProjectFrontmatter {
  slug: string;
  body: string;
}

export class ContentValidationError extends Error {
  constructor(file: string, detail: string) {
    super(`Invalid content in ${file}: ${detail}`);
    this.name = "ContentValidationError";
  }
}

/**
 * gray-matter parses YAML dates into Date objects; normalise them back to
 * `YYYY-MM-DD` strings so the schema sees a single canonical format.
 */
function normaliseDates(data: Record<string, unknown>): Record<string, unknown> {
  const value = data.date;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return { ...data, date: value.toISOString().slice(0, 10) };
  }
  return data;
}

export function parseProject(fileName: string, raw: string): Project {
  const slug = fileName.replace(/\.mdx$/, "");
  if (!SLUG_PATTERN.test(slug)) {
    throw new ContentValidationError(fileName, "file name must be lowercase kebab-case");
  }

  const { data, content } = matter(raw);
  const result = projectFrontmatterSchema.safeParse(normaliseDates(data));
  if (!result.success) {
    throw new ContentValidationError(fileName, z.prettifyError(result.error));
  }

  return { ...result.data, slug, body: content };
}

async function listMdxFiles(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(/* turbopackIgnore: true */ dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

/**
 * Loads every published project, newest first. Any invalid file throws,
 * which fails `next build` so bad content never ships.
 */
export async function getProjects(dir: string = PROJECTS_DIR): Promise<Project[]> {
  const files = await listMdxFiles(dir);
  const projects = await Promise.all(
    files.map(async (file) =>
      // The directory is a parameter (tests pass fixture dirs), so opt out of
      // whole-project tracing; next.config.ts traces content/ explicitly.
      parseProject(file, await readFile(path.join(/* turbopackIgnore: true */ dir, file), "utf8")),
    ),
  );

  return projects
    .filter((project) => !project.draft)
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export async function getProjectBySlug(
  slug: string,
  dir: string = PROJECTS_DIR,
): Promise<Project | undefined> {
  const projects = await getProjects(dir);
  return projects.find((project) => project.slug === slug);
}
