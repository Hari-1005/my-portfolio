import { profile } from "@content/profile";
import { Container } from "@/components/ui/container";
import { ExternalLink } from "@/components/ui/external-link";
import { Reveal } from "@/components/ui/reveal";

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <h1 id="hero-heading" className="text-4xl font-bold tracking-tight sm:text-5xl">
            {profile.name}
          </h1>
          <p className="mt-6 text-lg text-muted">
            Code and open-source work on{" "}
            <ExternalLink href={profile.githubUrl}>GitHub</ExternalLink>.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
