import Link from "next/link";
import { site } from "@/config/site";
import { areas } from "@/data/areas";
import { localPagesForArea } from "@/data/localPages";
import { pageMetadata } from "@/lib/metadata";
import { serializeJsonLd } from "@/lib/jsonLd";
import { Accordion } from "@/components/Accordion";
import { Reveal } from "@/components/Reveal";
import {
  CtaBanner,
  PageHero,
  SectionHeading,
  StepsGrid,
} from "@/components/sections";
import { ArrowRightIcon, MapPinIcon } from "@/components/icons";

const area = areas[0];

if (!area) {
  throw new Error("The Toowoomba Region service area is not configured.");
}

const locations = [...area.suburbs, ...(area.nearby ?? [])];
const landingPages = localPagesForArea(area.slug);
const pageUrl = `${site.url}/service-areas`;

export const metadata = pageMetadata({
  path: "/service-areas",
  title: "Toowoomba Region Service Area",
  description:
    "Carbase serves the Toowoomba Region only. Check the Toowoomba suburbs, towns and regional communities included in our vehicle collection area.",
  keywords: [
    "Toowoomba Region service area",
    "vehicle collection Toowoomba Region",
    "Toowoomba suburbs",
    "Toowoomba regional towns",
  ],
});

export default function ServiceAreasPage() {
  const webPageId = `${pageUrl}#webpage`;
  const placeListId = `${pageUrl}#locations`;
  const faqId = `${pageUrl}#faq`;
  const breadcrumbId = `${pageUrl}#breadcrumb`;

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": webPageId,
        url: pageUrl,
        name: "Toowoomba Region Service Area",
        description:
          "The Toowoomba Region suburbs, towns and communities served by Carbase.",
        inLanguage: "en-AU",
        isPartOf: { "@id": `${site.url}/#website` },
        about: {
          "@type": "AdministrativeArea",
          name: "Toowoomba Region, Queensland",
        },
        mainEntity: { "@id": placeListId },
        breadcrumb: { "@id": breadcrumbId },
      },
      {
        "@type": "ItemList",
        "@id": placeListId,
        name: "Carbase Toowoomba Region collection locations",
        numberOfItems: locations.length,
        itemListElement: locations.map((location, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Place",
            name: location,
            containedInPlace: {
              "@type": "AdministrativeArea",
              name: "Toowoomba Region, Queensland",
            },
          },
        })),
      },
      ...(area.faqs?.length
        ? [
            {
              "@type": "FAQPage",
              "@id": faqId,
              url: `${pageUrl}#questions`,
              isPartOf: { "@id": webPageId },
              mainEntity: area.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: { "@type": "Answer", text: faq.answer },
              })),
            },
          ]
        : []),
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "Toowoomba Region service area",
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(pageJsonLd) }}
      />

      <PageHero
        eyebrow="Our only service region"
        title={
          <>
            Vehicle collection across the{" "}
            <span className="text-gradient">Toowoomba Region</span>
          </>
        }
        lede={area.intro}
        compact
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
        <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
          {landingPages.map((page) => (
            <li key={page.slug}>
              <Link
                href={`/${page.slug}`}
                className="inline-flex items-center gap-2 font-semibold text-white underline decoration-brand-400 underline-offset-8"
              >
                {page.navLabel}
                <ArrowRightIcon className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
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

      <section className="bg-white py-20 lg:py-24">
        <div className="shell">
          <Reveal>
            <SectionHeading
              eyebrow="Suburbs and regional towns"
              title="Check your Toowoomba Region location"
              lede="The locations below are all within our sole collection area. If your Toowoomba Region address is not listed, call us to confirm the pickup details."
            />
          </Reveal>
          <Reveal delay={120}>
            <ul className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-3">
              {locations.map((location) => (
                <li
                  key={location}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-card transition hover:border-brand-300 hover:text-brand-700"
                >
                  <MapPinIcon className="size-3.5 text-brand-500" />
                  {location}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="bg-dots relative bg-slate-50 py-20 lg:py-24">
        <div className="shell relative">
          <Reveal>
            <SectionHeading eyebrow="How it works" title="Sold in four easy steps" />
          </Reveal>
          <div className="mt-14">
            <StepsGrid />
          </div>
        </div>
      </section>

      {area.faqs && area.faqs.length > 0 && (
        <section id="questions" className="scroll-mt-28 bg-white py-20 lg:py-24">
          <div className="shell grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="t-index text-brand-700">Coverage questions</p>
              <h2 className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink-900 sm:text-5xl">
                Collecting within the Toowoomba Region.
              </h2>
              <Link
                href="/faq"
                className="mt-8 inline-flex items-center gap-2 font-semibold text-brand-700 underline underline-offset-4"
              >
                Read all FAQs <ArrowRightIcon className="size-5" />
              </Link>
            </div>
            <Accordion items={area.faqs} />
          </div>
        </section>
      )}

      <CtaBanner
        title="Ready to sell your car in the Toowoomba Region?"
        subtitle="Get a free, no-obligation quote with free pickup anywhere within our listed service area."
      />
    </>
  );
}
