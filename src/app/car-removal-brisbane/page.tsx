import { pageMetadata } from "@/lib/metadata";
import { requireLocalPage } from "@/data/localPages";
import { LocalLandingPage } from "@/components/LocalLandingPage";

const page = requireLocalPage("car-removal-brisbane");

export const metadata = pageMetadata({
  path: `/${page.slug}`,
  title: page.seoTitle,
  description: page.seoDescription,
  keywords: page.keywords,
});

export default function CarRemovalBrisbanePage() {
  return <LocalLandingPage page={page} />;
}
