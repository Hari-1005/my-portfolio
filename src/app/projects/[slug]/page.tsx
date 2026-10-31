import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Container } from "@/components/ui/container";
import { ExternalLink } from "@/components/ui/external-link";
import { mdxComponents } from "@/components/ui/mdx-components";
import { getProjectBySlug, getProjects } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { formatMonthYear } from "@/lib/utils";

// Only slugs returned by generateStaticParams exist; anything else is a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return buildMetadata({
    title: project.title,
    description: project.summary,
    pathname: `/projects/${project.slug}`,
  });
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <Container as="article" className="py-16">
      <Link href="/projects" className="text-sm text-muted hover:text-accent">
        ← All projects
      </Link>
      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{project.title}</h1>
        <p className="mt-2 text-sm text-muted">
          <time dateTime={project.date}>{formatMonthYear(project.date)}</time>
        </p>
        <p className="mt-4 text-lg">{project.summary}</p>
        {(project.repo || project.url) && (
          <ul className="mt-4 flex flex-wrap gap-4 text-sm">
            {project.url && (
              <li>
                <ExternalLink href={project.url}>Live site</ExternalLink>
              </li>
            )}
            {project.repo && (
              <li>
                <ExternalLink href={project.repo}>Source code</ExternalLink>
              </li>
            )}
          </ul>
        )}
      </header>
      <div className="mt-10">
        <MDXRemote source={project.body} components={mdxComponents} />
      </div>
    </Container>
  );
}
