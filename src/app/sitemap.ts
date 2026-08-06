import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { areas } from "@/data/areas";
import { localPages } from "@/data/localPages";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const staticRoutes = [
    "",
    "/quote",
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
    // Keyword landing pages sit above the area pages — these are the ones we
    // most want crawled and indexed.
    ...localPages.map((page) => ({
      url: `${site.url}/${page.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...areas.map((area) => ({
      url: `${site.url}/service-areas/${area.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
