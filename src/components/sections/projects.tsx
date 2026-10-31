import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import type { Project } from "@/lib/content";
import { ProjectList } from "./project-list";

/** Home-page projects section. Renders nothing until a project is published. */
export function ProjectsSection({ projects }: { projects: readonly Project[] }) {
  if (projects.length === 0) return null;

  const featured = projects.filter((project) => project.featured);
  const shown = featured.length > 0 ? featured : projects;

  return (
    <section aria-labelledby="projects-heading" className="pb-20">
      <Container>
        <Reveal>
          <div className="mb-6 flex items-baseline justify-between">
            <h2 id="projects-heading" className="text-2xl font-semibold tracking-tight">
              Projects
            </h2>
            <Link href="/projects" className="text-sm text-accent hover:underline">
              All projects
            </Link>
          </div>
          <ProjectList projects={shown} />
        </Reveal>
      </Container>
    </section>
  );
}
