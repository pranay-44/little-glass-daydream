import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "AI Traffic Analysis | Sem 5 CEP Community Website",
      },
      {
        name: "description",
        content:
          "A mobile-first static website translating AI traffic monitoring into peak-hour charts, honest data and road safety tips for the local community.",
      },
      { property: "og:title", content: "AI Traffic Analysis | Sem 5 CEP Community Website" },
      {
        property: "og:description",
        content:
          "How AI counts vehicles, what we measured at our local junction, and practical road safety tips — a Sem 5 Community Engagement Project.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

/**
 * The deliverable of this project is a pure static site (per the PRD tech
 * stack: HTML/CSS/JS + Python), served from /public/site and intended for
 * GitHub Pages. The app shell simply previews it full-screen.
 */
function Index() {
  return (
    <iframe
      src="/site/index.html"
      title="AI Traffic Analysis — CEP website preview"
      style={{ width: "100%", height: "100dvh", border: "none", display: "block" }}
    />
  );
}
