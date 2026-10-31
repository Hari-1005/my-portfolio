import Link from "next/link";
import { profile } from "@content/profile";
import { Container } from "@/components/ui/container";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          {profile.name}
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-6 text-sm">
            <li>
              <Link href="/projects" className="hover:text-accent">
                Projects
              </Link>
            </li>
            <li>
              <a href={profile.githubUrl} rel="noopener noreferrer" className="hover:text-accent">
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      </Container>
    </header>
  );
}
