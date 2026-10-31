import { profile } from "@content/profile";
import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-8 text-sm text-muted">
      <Container className="flex flex-wrap items-center justify-between gap-4">
        <p>{profile.name}</p>
        <a href={profile.githubUrl} rel="noopener noreferrer" className="hover:text-accent">
          github.com/{profile.githubUsername}
        </a>
      </Container>
    </footer>
  );
}
