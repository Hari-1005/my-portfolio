import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type ExternalLinkProps = Omit<ComponentPropsWithoutRef<"a">, "target" | "rel"> & { href: string };

/** Link to another origin; opens in a new tab without leaking window.opener. */
export function ExternalLink({ className, children, ...props }: ExternalLinkProps) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-accent underline decoration-1 underline-offset-4 hover:decoration-2",
        className,
      )}
      {...props}
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
