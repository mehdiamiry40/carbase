import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { site } from "@/config/site";
import { areas, getArea } from "@/data/areas";
import { CtaBanner, SectionHeading, StepsGrid } from "@/components/sections";
import { MapPinIcon } from "@/components/icons";

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

      <section className="bg-linear-to-b from-brand-50 to-white py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
            <MapPinIcon className="size-3.5" />
            Servicing {area.short} &amp; surrounds
          </p>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance text-slate-900 sm:text-5xl">
            Cash for cars in {area.name}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">{area.intro}</p>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Any make, any condition — running or not. Free pickup, all paperwork
            handled, and payment lands in your account before we take the car.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/quote"
              className="rounded-full bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Get my free quote
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-full border border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Suburbs we service"
            title={`Where we buy cars around ${area.short}`}
            lede="These are just the suburbs we visit most — if you're nearby, we'll come to you too."
          />
          <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3">
            {area.suburbs.map((suburb) => (
              <li
                key={suburb}
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm"
              >
                {suburb}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="How it works"
            title="Sold in four easy steps"
          />
          <div className="mt-12">
            <StepsGrid />
          </div>
        </div>
      </section>

      <CtaBanner
        title={`Selling a car in ${area.short}?`}
        subtitle="Get your free, no-obligation quote today — it takes about two minutes."
      />
    </>
  );
}
