import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";
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
  return pageMetadata({
    path: `/service-areas/${area.slug}`,
    title:
      area.seoTitle ??
      `Cash for Cars ${area.short} & Free Car Removal`,
    description:
      area.seoDescription ??
      `${site.name} buys cars across ${area.short} in any condition. Cash for cars and free car removal with free quote, free pickup and payment before collection. ${area.intro}`,
    keywords:
      area.keywords ?? [
        `cash for cars ${area.short}`,
        `car removal ${area.short}`,
        `sell my car ${area.short}`,
        `free car removal ${area.short}`,
      ],
  });
}

export default async function AreaPage({ params }: Props) {
  const { slug } = await params;
  const area = getArea(slug);
  if (!area) notFound();

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${site.url}/service-areas/${area.slug}#service`,
    name: `Cash for cars and car removal in ${area.short}`,
    serviceType: ["Cash for cars", "Car removal"],
    description:
      area.seoDescription ??
      `${site.name} offers cash for cars and free car removal across ${area.short}.`,
    areaServed: { "@type": "City", name: area.short },
    provider: {
      "@type": "LocalBusiness",
      name: site.name,
      telephone: site.phone,
      url: site.url,
    },
    url: `${site.url}/service-areas/${area.slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Service areas",
        item: `${site.url}/service-areas`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: area.short,
        item: `${site.url}/service-areas/${area.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <PageHero
        eyebrow={`Cash for cars & car removal · ${area.short}`}
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

      {area.seoSections && area.seoSections.length > 0 && (
        <section className="bg-brand-50 py-20 lg:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Reveal>
              <div className="space-y-12">
                {area.seoSections.map((section) => (
                  <div key={section.heading}>
                    <h2 className="font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
                      {section.heading}
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-slate-600">
                      {section.body}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

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
          title={`Need cash for cars or car removal in ${area.short}?`}
          subtitle="Get your free, no-obligation quote today — it takes about two minutes."
        />
      </div>
    </>
  );
}
