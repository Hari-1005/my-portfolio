import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { ExternalLink } from "./external-link";

function MdxLink({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) {
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} className="text-accent underline underline-offset-4" {...props}>
        {children}
      </Link>
    );
  }
  return <ExternalLink href={href}>{children}</ExternalLink>;
}

export const mdxComponents: MDXComponents = {
  h2: (props) => <h2 className="mt-10 mb-4 text-2xl font-semibold tracking-tight" {...props} />,
  h3: (props) => <h3 className="mt-8 mb-3 text-xl font-semibold" {...props} />,
  p: (props) => <p className="my-4 leading-7" {...props} />,
  ul: (props) => <ul className="my-4 list-disc space-y-2 pl-6" {...props} />,
  ol: (props) => <ol className="my-4 list-decimal space-y-2 pl-6" {...props} />,
  blockquote: (props) => (
    <blockquote className="my-6 border-l-2 border-border pl-4 text-muted" {...props} />
  ),
  code: (props) => (
    <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.9em]" {...props} />
  ),
  pre: (props) => (
    <pre
      className="my-6 overflow-x-auto rounded-card border border-border bg-surface p-4 font-mono text-sm"
      {...props}
    />
  ),
  a: MdxLink,
};
