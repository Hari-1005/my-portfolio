import { Hero } from "@/components/sections/hero";
import { ProjectsSection } from "@/components/sections/projects";
import { getProjects } from "@/lib/content";

export default async function HomePage() {
  const projects = await getProjects();

  return (
    <>
      <Hero />
      <ProjectsSection projects={projects} />
    </>
  );
}
