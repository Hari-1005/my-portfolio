import { profile } from "@content/profile";
import { ProjectList } from "@/components/sections/project-list";
import { Container } from "@/components/ui/container";
import { ExternalLink } from "@/components/ui/external-link";
import { getProjects } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Projects",
  description: `Projects by ${profile.name}.`,
  pathname: "/projects",
});

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      <div className="mt-8">
        <ProjectList
          projects={projects}
          emptyState={
            <p className="text-muted">
              No project write-ups are published yet. Public repositories are on{" "}
              <ExternalLink href={profile.githubUrl}>GitHub</ExternalLink>.
            </p>
          }
        />
      </div>
    </Container>
  );
}
