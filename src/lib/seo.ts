import type { Metadata } from "next";
import { profile } from "@content/profile";

const LOCAL_URL = "http://localhost:3000";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Resolves the canonical site URL:
 * 1. NEXT_PUBLIC_SITE_URL (explicit, e.g. a custom domain)
 * 2. VERCEL_PROJECT_PRODUCTION_URL (set by Vercel, host only, no scheme)
 * 3. http://localhost:3000 for local development
 */
export function getSiteUrl(env: NodeJS.ProcessEnv = process.env): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return stripTrailingSlash(`https://${vercel.replace(/^https?:\/\//, "")}`);

  return LOCAL_URL;
}

export const siteConfig = {
  name: profile.name,
  title: profile.name,
  description: `Portfolio of ${profile.name}.`,
} as const;

export function absoluteUrl(pathname: string, siteUrl: string = getSiteUrl()): string {
  return new URL(pathname, `${siteUrl}/`).toString();
}

export function buildMetadata({
  title,
  description = siteConfig.description,
  pathname = "/",
}: {
  title?: string;
  description?: string;
  pathname?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: pathname },
    openGraph: { title: title ?? siteConfig.title, description, url: pathname },
  };
}
