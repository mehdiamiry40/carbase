import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { areas } from "@/data/areas";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/quote", "/how-it-works", "/about", "/faq", "/service-areas"];
  return [
    ...staticRoutes.map((path) => ({
      url: `${site.url}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...areas.map((area) => ({
      url: `${site.url}/service-areas/${area.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
