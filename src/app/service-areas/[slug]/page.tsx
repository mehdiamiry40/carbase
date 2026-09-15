import { notFound, permanentRedirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

/** Preserve the per-area coverage URL without reviving other regions. */
export default async function LegacyAreaPage({ params }: Props) {
  const { slug } = await params;

  if (slug === "brisbane") {
    permanentRedirect("/service-areas");
  }

  notFound();
}
