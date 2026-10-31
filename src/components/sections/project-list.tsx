import Link from "next/link";
import type { ReactNode } from "react";
import type { Project } from "@/lib/content";
import { formatMonthYear } from "@/lib/utils";

interface ProjectListProps {
  projects: readonly Project[];
  /** Rendered when there are no projects; omit to render nothing. */
  emptyState?: ReactNode;
}

export function ProjectList({ projects, emptyState = null }: ProjectListProps) {
  if (projects.length === 0) return <>{emptyState}</>;

  return (
    <ul className="grid gap-4">
      {projects.map((project) => (
        <li key={project.slug}>
          <article className="relative rounded-card border border-border p-5 transition-colors hover:border-accent">
            <h3 className="text-lg font-semibold">
              <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
                {project.title}
              </Link>
            </h3>
            <p className="mt-1 text-sm text-muted">
              <time dateTime={project.date}>{formatMonthYear(project.date)}</time>
            </p>
            <p className="mt-3">{project.summary}</p>
            {project.tags.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tags">
                {project.tags.map((tag) => (
                  <li key={tag} className="rounded bg-surface px-2 py-0.5 font-mono text-xs">
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
}
