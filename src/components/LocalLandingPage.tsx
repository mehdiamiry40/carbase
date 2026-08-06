import Link from "next/link";
import { site, telHref } from "@/config/site";
import { getArea } from "@/data/areas";
import type { LocalPage } from "@/data/localPages";
import { Accordion } from "@/components/Accordion";
import { Reveal } from "@/components/Reveal";
import { CtaBanner, PageHero, SectionHeading, StepsGrid } from "@/components/sections";
import { ArrowRightIcon, MapPinIcon, PhoneIcon } from "@/components/icons";

/**
 * Renders a keyword-targeted local landing page (see `data/localPages.ts`).
 *
 * The three JSON-LD blocks are the point of this page as much as the copy is:
 * Service tells Google what is offered and where, FAQPage is what earns the
 * expanded result, and BreadcrumbList replaces the bare URL in the SERP.
 */
export function LocalLandingPage({ page }: { page: LocalPage }) {
  const area = getArea(page.areaSlug);
  const url = `${site.url}/${page.slug}`;
  const suburbs = area ? [...area.suburbs, ...(area.nearby ?? [])] : [];

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: page.serviceName,
    serviceType: page.serviceType,
    description: page.seoDescription,
    url,
    provider: { "@id": `${site.url}/#business` },
    areaServed: [
      { "@type": "City", name: area?.short ?? page.areaSlug },
      ...suburbs.map((suburb) => ({ "@type": "Place", name: suburb })),
    ],
    offers: {
      "@type": "Offer",
      priceCurrency: "AUD",
      availability: "https://schema.org/InStock",
      description: "Free quote, free vehicle pickup and payment before collection.",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: page.seoTitle, item: url },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <PageHero
        eyebrow={page.eyebrow}
        title={
          <>
            {page.h1Lead}{" "}
            <span className="text-gradient">{page.h1Highlight}</span>
          </>
        }
        lede={page.lede}
      >
        <div className="mt-9 flex flex-col gap-3.5 sm:flex-row">
          <Link href="/quote" className="btn-primary">
            Get my free quote
            <ArrowRightIcon className="size-4" />
          </Link>
          <a href={telHref} className="btn-ghost-dark">
            <PhoneIcon className="size-4 text-accent-400" />
            {site.phone}
          </a>
        </div>
      </PageHero>

      <section className="bg-brand-50 py-16 lg:py-24">
        <div className="shell max-w-3xl">
          <div className="space-y-12">
            {page.sections.map((section) => (
              <Reveal key={section.heading}>
                <div>
                  <h2 className="font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
                    {section.heading}
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-slate-600">
                    {section.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {area && (
        <section className="bg-white py-16 lg:py-24">
          <div className="shell">
            <Reveal>
              <SectionHeading
                eyebrow="Where we come to you"
                title={`${page.h1Highlight} suburbs and surrounding towns`}
                lede="These are the areas we visit most. If yours is not here but you are nearby, ask anyway — we can usually make it work."
              />
            </Reveal>
            <Reveal delay={120}>
              <ul className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-3">
                {suburbs.map((suburb) => (
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
      )}

      <section className="bg-dots relative bg-slate-50 py-16 lg:py-24">
        <div className="shell relative">
          <Reveal>
            <SectionHeading eyebrow="How it works" title="Sold in four easy steps" />
          </Reveal>
          <div className="mt-14">
            <StepsGrid />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="t-index text-brand-700">Questions</p>
            <h2 className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink-900 sm:text-5xl">
              {page.navLabel}, answered.
            </h2>
            <ul className="mt-8 space-y-3">
              {page.related.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 font-semibold text-brand-700 underline underline-offset-4"
                  >
                    {link.label}
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Accordion items={page.faqs} />
        </div>
      </section>

      <CtaBanner
        title={`Ready to sort out the car?`}
        subtitle={`Free quote, free pickup and payment before collection — anywhere in ${area?.short ?? page.h1Highlight} and the surrounding region.`}
      />
    </>
  );
}
