import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { site } from "@/config/site";
import { areas, getArea } from "@/data/areas";
import { Reveal } from "@/components/Reveal";
import {
  CtaBanner,
  PageHero,
  SectionHeading,
  StepsGrid,
} from "@/components/sections";
import { ArrowRightIcon, MapPinIcon } from "@/components/icons";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return areas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const area = getArea(slug);
  if (!area) return {};
  return {
    title: `Cash for Cars ${area.short} — Sell Your Car Today`,
    description: `${site.name} buys cars across ${area.short} in any condition. Free quote, free pickup and instant payment. ${area.intro}`,
  };
}

export default async function AreaPage({ params }: Props) {
  const { slug } = await params;
  const area = getArea(slug);
  if (!area) notFound();

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Cash for cars in ${area.short}`,
    serviceType: "Car buying service",
    areaServed: { "@type": "City", name: area.short },
    provider: {
      "@type": "LocalBusiness",
      name: site.name,
      telephone: site.phone,
      url: site.url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      <PageHero
        eyebrow={`Servicing ${area.short} & surrounds`}
        title={
          <>
            Cash for cars in{" "}
            <span className="text-gradient">{area.name}</span>
          </>
        }
        lede={area.intro}
      >
        <div className="mt-9 flex flex-col justify-center gap-3.5 sm:flex-row">
          <Link href="/quote" className="btn-primary">
            Get my free quote
            <ArrowRightIcon className="size-4" />
          </Link>
          <Link href="/how-it-works" className="btn-ghost-dark">
            How it works
          </Link>
        </div>
      </PageHero>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Suburbs we service"
              title={`Where we buy cars around ${area.short}`}
              lede="These are just the suburbs we visit most — if you're nearby, we'll come to you too."
            />
          </Reveal>
          <Reveal delay={120}>
            <ul className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-3">
              {area.suburbs.map((suburb) => (
                <li
                  key={suburb}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-card transition hover:border-brand-300 hover:text-brand-700"
                >
                  <MapPinIcon className="size-3.5 text-brand-500" />
                  {suburb}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="bg-dots relative bg-slate-50 py-24">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title="Sold in four easy steps"
            />
          </Reveal>
          <div className="mt-14">
            <StepsGrid />
          </div>
        </div>
      </section>

      <div className="bg-white pt-24">
        <CtaBanner
          title={`Selling a car in ${area.short}?`}
          subtitle="Get your free, no-obligation quote today — it takes about two minutes."
        />
      </div>
    </>
  );
}
