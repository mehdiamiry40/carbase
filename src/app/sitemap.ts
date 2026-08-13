import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { localPages } from "@/data/localPages";

export default function sitemap(): MetadataRoute.Sitemap {
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
    })),
    // The two distinct service pages are the commercial search targets.
    ...localPages.map((page) => ({
      url: `${site.url}/${page.slug}`,
      // This is the page's real content revision date, not the deploy time.
      lastModified: page.dateModified,
    })),
  ];
}
