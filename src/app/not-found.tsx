import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="py-24">
      <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-4 text-muted">The page you are looking for does not exist.</p>
      <p className="mt-8">
        <Link href="/" className="text-accent underline underline-offset-4">
          Back to home
        </Link>
      </p>
    </Container>
  );
}
