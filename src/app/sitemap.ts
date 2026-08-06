import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { localPages } from "@/data/localPages";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const staticRoutes = [
    "",
    "/how-it-works",
    "/about",
    "/faq",
    "/service-areas",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${site.url}${path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    // The two distinct service pages are the commercial search targets.
    ...localPages.map((page) => ({
      url: `${site.url}/${page.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
