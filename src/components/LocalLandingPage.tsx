import Link from "next/link";
import { site, telHref } from "@/config/site";
import { getArea } from "@/data/areas";
import type { LocalPage } from "@/data/localPages";
import { serializeJsonLd } from "@/lib/jsonLd";
import { Accordion } from "@/components/Accordion";
import { QuoteForm } from "@/components/QuoteForm";
import { Reveal } from "@/components/Reveal";
import {
  CtaBanner,
  PageHero,
  SectionHeading,
  StepsGrid,
} from "@/components/sections";
import {
  ArrowRightIcon,
  CheckIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/icons";

/**
 * Renders a keyword-targeted local landing page (see `data/localPages.ts`).
 *
 * The connected JSON-LD graph describes the page, service, questions and
 * breadcrumb trail without pretending the business has a Toowoomba shopfront.
 */
export function LocalLandingPage({ page }: { page: LocalPage }) {
  const area = getArea(page.areaSlug);
  const url = `${site.url}/${page.slug}`;
  const exampleLocations = area
    ? [...area.suburbs, ...(area.nearby ?? [])].slice(0, 6)
    : [];
  const webPageId = `${url}#webpage`;
  const serviceId = `${url}#service`;
  const faqId = `${url}#faq`;
  const breadcrumbId = `${url}#breadcrumb`;

  const serviceJsonLd = {
    "@type": "Service",
    "@id": serviceId,
    name: page.serviceName,
    serviceType: page.serviceType,
    description: page.seoDescription,
    url,
    mainEntityOfPage: { "@id": webPageId },
    provider: { "@id": `${site.url}/#business` },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Toowoomba Region, Queensland",
    },
  };

  const faqJsonLd = {
    "@type": "FAQPage",
    "@id": faqId,
    url: `${url}#questions`,
    isPartOf: { "@id": webPageId },
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const breadcrumbJsonLd = {
    "@type": "BreadcrumbList",
    "@id": breadcrumbId,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: page.navLabel,
        item: url,
      },
    ],
  };

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": webPageId,
        url,
        name: page.seoTitle,
        description: page.seoDescription,
        inLanguage: "en-AU",
        datePublished: page.datePublished,
        dateModified: page.dateModified,
        headline: page.primaryKeyword,
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": serviceId },
        mainEntity: { "@id": serviceId },
        breadcrumb: { "@id": breadcrumbId },
        citation: page.officialLinks.map((link) => link.href),
        spatialCoverage: {
          "@type": "AdministrativeArea",
          name: "Toowoomba Region, Queensland",
        },
      },
      serviceJsonLd,
      faqJsonLd,
      breadcrumbJsonLd,
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(pageJsonLd) }}
      />

      <PageHero
        eyebrow={page.eyebrow}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: `/${page.slug}`, label: page.navLabel },
        ]}
        photoName={page.heroPhoto}
        photoAlt={page.heroPhotoAlt}
        title={
          <>
            {page.h1Lead}{" "}
            <span className="text-gradient">{page.h1Highlight}</span>
          </>
        }
        lede={page.lede}
      >
        <div className="mt-9 flex flex-col gap-3.5 sm:flex-row">
          <a href="#local-quote" className="btn-primary">
            Get my free quote
            <ArrowRightIcon className="size-4" />
          </a>
          <a href={telHref} className="btn-ghost-dark">
            <PhoneIcon className="size-4 text-accent-400" />
            {site.phone}
          </a>
        </div>
      </PageHero>

      <section
        aria-labelledby={`${page.slug}-highlights`}
        className="border-b border-brand-300 bg-brand-700 text-white"
      >
        <div className="shell py-8 lg:py-10">
          <h2 id={`${page.slug}-highlights`} className="sr-only">
            {page.navLabel} service details
          </h2>
          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {page.highlights.map((item) => (
              <div key={item.label} className="border-l border-brand-300 pl-4">
                <dt className="text-xs font-bold tracking-[0.16em] text-brand-100 uppercase">
                  {item.label}
                </dt>
                <dd className="mt-2 font-display text-lg font-semibold text-white">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="local-quote" className="scroll-mt-28 bg-white py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-20">
          <Reveal>
            <div className="lg:sticky lg:top-36">
              <p className="t-index text-brand-700">Free local quote</p>
              <h2 className="mt-5 max-w-[13ch] font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink-900 sm:text-5xl">
                Get a quote for your car in {area?.short ?? page.h1Highlight}.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                Share the vehicle details and pickup suburb. Accurate photos and
                condition notes help us give you a clearer written offer and
                arrange the right truck.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Free quote with no obligation to accept",
                  "Pickup included across the listed service area",
                  "Payment confirmed before the vehicle is loaded",
                  "Paperwork requirements confirmed before collection",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-700">
                    <span className="mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <CheckIcon className="size-3" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <QuoteForm heading={`Get a ${area?.short ?? "local"} quote`} />
          </Reveal>
        </div>
      </section>

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

      <section className="bg-white py-16 lg:py-20">
        <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-20">
          <Reveal>
            <div>
              <p className="t-index text-brand-700">Local and accountable</p>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
                Know who you are selling your car to.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div>
              <p className="text-lg leading-relaxed text-slate-600">
                Carbase is based in Toowoomba and serves the Toowoomba Region
                only. It is operated by {site.operatorName} (ABN {site.abn}), so
                the business name, service boundary and contact details are
                clear before you share your vehicle information.
              </p>
              <dl className="mt-8 grid gap-5 border-y border-slate-200 py-6 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase">
                    Phone
                  </dt>
                  <dd className="mt-2">
                    <a
                      href={telHref}
                      className="font-display text-xl font-semibold text-ink-900 underline decoration-brand-300 underline-offset-4"
                    >
                      {site.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase">
                    Hours
                  </dt>
                  <dd className="mt-2 font-display text-xl font-semibold text-ink-900">
                    {site.hours}
                  </dd>
                </div>
              </dl>
              <Link
                href="/about"
                className="mt-7 inline-flex items-center gap-2 font-semibold text-brand-700 underline underline-offset-4"
              >
                About Carbase and our process
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        className="bg-slate-50 py-16 lg:py-20"
        aria-labelledby="official-guidance"
      >
        <div className="shell">
          <Reveal>
            <div className="max-w-3xl">
              <p className="t-index text-brand-700">Official guidance</p>
              <h2
                id="official-guidance"
                className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
              >
                Check the Queensland vehicle paperwork.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Registered, unregistered and written-off vehicles can require
                different steps. These Queensland Government pages are the
                source of truth; we will confirm which process applies before
                collection.
              </p>
            </div>
          </Reveal>
          <ul className="mt-10 grid gap-4 lg:grid-cols-3">
            {page.officialLinks.map((link, index) => (
              <li key={link.href}>
                <Reveal delay={index * 80} className="h-full">
                  <a
                    href={link.href}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="group block h-full border border-slate-200 bg-white p-6 shadow-card transition hover:border-brand-300"
                  >
                    <span className="flex items-start justify-between gap-4">
                      <span className="font-display text-xl font-semibold text-ink-900 group-hover:text-brand-700">
                        {link.label}
                      </span>
                      <ArrowRightIcon className="mt-1 size-4 shrink-0 text-brand-600" />
                    </span>
                    <span className="mt-3 block text-sm leading-relaxed text-slate-600">
                      {link.description}
                    </span>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {area && (
        <section className="bg-white py-16 lg:py-24">
          <div className="shell">
            <Reveal>
              <SectionHeading
                eyebrow="Where we come to you"
                title="Serving the Toowoomba Region"
                lede="A few of our regular collection locations are shown below. Our coverage is limited to addresses within the Toowoomba Region."
              />
            </Reveal>
            <Reveal delay={120}>
              <ul className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-3">
                {exampleLocations.map((suburb) => (
                  <li
                    key={suburb}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-card transition hover:border-brand-300 hover:text-brand-700"
                  >
                    <MapPinIcon className="size-3.5 text-brand-500" />
                    {suburb}
                  </li>
                ))}
              </ul>
              <div className="mt-9 text-center">
                <Link
                  href="/service-areas"
                  className="inline-flex items-center gap-2 font-semibold text-brand-700 underline underline-offset-4"
                >
                  See every Toowoomba Region location we cover
                  <ArrowRightIcon className="size-4" />
                </Link>
              </div>
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

      <section id="questions" className="scroll-mt-28 bg-white py-16 lg:py-24">
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
        subtitle="Free quote, free pickup and payment before collection throughout the Toowoomba Region."
      />
    </>
  );
}
