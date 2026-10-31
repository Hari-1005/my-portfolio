import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();

  return [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/projects"), changeFrequency: "monthly", priority: 0.8 },
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: project.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
