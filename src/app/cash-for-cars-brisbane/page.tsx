import { pageMetadata } from "@/lib/metadata";
import { requireLocalPage } from "@/data/localPages";
import { LocalLandingPage } from "@/components/LocalLandingPage";

const page = requireLocalPage("cash-for-cars-brisbane");

export const metadata = pageMetadata({
  path: `/${page.slug}`,
  title: page.seoTitle,
  description: page.seoDescription,
  keywords: page.keywords,
});

export default function CashForCarsBrisbanePage() {
  return <LocalLandingPage page={page} />;
}
