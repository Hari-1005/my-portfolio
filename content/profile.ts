/**
 * Verified profile facts only. Do not add anything here that has not been
 * supplied by Kasani; every field is rendered on the public site.
 */
export const profile = {
  name: "Kasani Hariteja",
  githubUsername: "Hari-1005",
  githubUrl: "https://github.com/Hari-1005",
} as const;

export type Profile = typeof profile;
