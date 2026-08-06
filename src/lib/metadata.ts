import type { Metadata } from "next";
import { site } from "@/config/site";

export function pageMetadata({
  path,
  title,
  description,
  keywords,
  index = true,
  follow = true,
}: {
  path: string;
  title: string;
  description: string;
  keywords?: string | string[];
  index?: boolean;
  follow?: boolean;
}): Metadata {
  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: path },
    robots: { index, follow },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_AU",
      url: path,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
