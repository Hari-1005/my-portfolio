import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectList } from "@/components/sections/project-list";
import type { Project } from "@/lib/content";

const project: Project = {
  slug: "alpha-fixture",
  title: "Alpha fixture",
  summary: "Fixture summary.",
  date: "2026-03-01",
  tags: ["fixture"],
  featured: false,
  draft: false,
  body: "",
};

describe("ProjectList", () => {
  it("renders the empty state when there are no projects", () => {
    render(<ProjectList projects={[]} emptyState={<p>Nothing yet</p>} />);
    expect(screen.getByText("Nothing yet")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders nothing for an empty list without an empty state", () => {
    const { container } = render(<ProjectList projects={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("links each project to its detail page", () => {
    render(<ProjectList projects={[project]} />);
    expect(screen.getByRole("link", { name: "Alpha fixture" })).toHaveAttribute(
      "href",
      "/projects/alpha-fixture",
    );
    expect(screen.getByText("Mar 2026")).toBeInTheDocument();
  });
});
