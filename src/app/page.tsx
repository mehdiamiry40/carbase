import Link from "next/link";
import { site, telHref } from "@/config/site";
import { faqs } from "@/data/faqs";
import { QuoteForm } from "@/components/QuoteForm";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import {
  AreaCards,
  BrandMarquee,
  CtaBanner,
  FaqList,
  SectionHeading,
  StatBand,
  StepsGrid,
} from "@/components/sections";
import {
  ArrowRightIcon,
  FourWdIcon,
  LightTruckIcon,
  SedanIcon,
  SuvIcon,
  UteIcon,
  VanIcon,
} from "@/components/icons";

const vehicleTypes = [
  { Icon: SedanIcon, label: "Sedans & hatches" },
  { Icon: SuvIcon, label: "SUVs & wagons" },
  { Icon: UteIcon, label: "Utes" },
  { Icon: VanIcon, label: "Vans" },
  { Icon: FourWdIcon, label: "4x4s" },
  { Icon: LightTruckIcon, label: "Light trucks" },
];

const offerFactors = [
  ["Vehicle details", "Make, model, year, kilometres and transmission."],
  ["Condition", "Mechanical, body, interior and registration condition."],
  ["Current market", "Comparable demand and value in South East Queensland."],
  ["Collection", "Your suburb, access and whether the vehicle drives."],
];

const sellerPromises = [
  ["A clear offer", "You see the amount you will receive before arranging pickup."],
  ["No collection fee", "Pickup is included throughout our listed service area."],
  ["Payment first", "Bank transfer is made before the vehicle leaves your possession."],
];

export default function HomePage() {
  const homeFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.slice(0, 5).map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqJsonLd) }}
      />

      <section className="relative min-h-[720px] overflow-hidden bg-ink-900 text-white lg:min-h-[calc(100svh-6rem)]">
        <Photo
          name="hero"
          preload
          alt="A modern car on the road, representing Carbase cash for cars"
          className="object-[58%_center]"
        />
        <span className="photo-scrim" aria-hidden />

        <div className="shell relative z-10 py-16 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="t-index w-fit border-b border-white/70 pb-3">
                Cash for cars · South East Queensland
              </p>
              <h1 className="mt-7 max-w-[12ch] font-display text-5xl font-semibold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
                Sell your car without the runaround.
              </h1>
              <p className="mt-7 max-w-[58ch] text-lg leading-relaxed text-white">
                Request a clear offer for any make, model or condition. Carbase arranges free pickup across Brisbane and the Gold Coast, completes the paperwork and pays before the car moves.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/quote" className="btn-primary bg-white text-ink-900 hover:bg-brand-200">
                  Get a free quote
                </Link>
                <a href={telHref} className="btn-ghost-dark">
                  Call {site.phone}
                </a>
              </div>
            </div>

            <div id="quote" className="lg:pl-6">
              <QuoteForm heading="Tell us about your car" />
            </div>
          </div>

          <div className="mt-14">
            <StatBand />
          </div>
        </div>
      </section>

      <BrandMarquee />

      <section className="border-t hair bg-white py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <Reveal>
            <div>
              <p className="section-rule"><span>How offers are prepared</span><span>01</span></p>
              <h2 className="mt-7 max-w-[14ch] font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
                A useful quote starts with the right details.
              </h2>
              <p className="mt-6 max-w-xl leading-relaxed text-slate-600">
                Tell us what you are selling once. We use the vehicle details, condition, current market and collection location to prepare your offer—without listings, test drives or weeks of messages.
              </p>
              <dl className="mt-8 border-y hair">
                {offerFactors.map(([term, detail]) => (
                  <div key={term} className="grid gap-1 border-b hair py-4 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-6">
                    <dt className="font-semibold text-ink-900">{term}</dt>
                    <dd className="text-sm text-slate-600">{detail}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/how-it-works" className="mt-8 inline-flex items-center gap-2 font-semibold underline underline-offset-4">
                See the full process <ArrowRightIcon className="size-5" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="relative min-h-[520px] overflow-hidden bg-brand-100">
              <Photo name="inspection" alt="A car prepared for a straightforward Carbase offer" sizes="(max-width: 1024px) 100vw, 50vw" />
              <span className="photo-scrim-soft" aria-hidden />
              <p className="absolute right-5 bottom-5 left-5 z-10 border-t border-white/60 pt-4 text-sm font-semibold text-white">
                One enquiry. One clear next step.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t hair bg-slate-50 py-16 lg:py-24">
        <div className="shell">
          <Reveal>
            <SectionHeading
              eyebrow="The process · 02"
              title="From vehicle details to payment in four steps."
              lede="A simple path from your first enquiry to collection, with no obligation to continue after receiving an offer."
            />
          </Reveal>
          <div className="mt-14"><StepsGrid /></div>
        </div>
      </section>

      <section className="relative flex min-h-[520px] items-center overflow-hidden bg-ink-900 text-white">
        <Photo name="suv" alt="A four-wheel drive representing the range of cars Carbase buys" />
        <span className="photo-scrim" aria-hidden />
        <div className="shell relative z-10 py-20 text-center">
          <p className="t-index mx-auto w-fit border-b border-white/70 pb-3">Any make · Any condition</p>
          <h2 className="mx-auto mt-6 max-w-[15ch] font-display text-4xl font-semibold leading-[1.08] sm:text-5xl">
            Running, damaged, unregistered or simply ready to sell.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white">
            You do not need to repair, detail or advertise the vehicle before requesting a quote.
          </p>
          <Link href="/quote" className="btn-primary mt-8 bg-white text-ink-900 hover:bg-brand-200">
            Request an offer
          </Link>
        </div>
      </section>

      <section className="border-t hair bg-white py-16 lg:py-24">
        <div className="shell">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="t-index mb-4 text-brand-700">What we buy · 03</p>
              <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Vehicles of every kind.</h2>
            </div>
            <Link href="/quote" className="inline-flex items-center gap-2 font-semibold underline underline-offset-4">
              Get a quote <ArrowRightIcon className="size-5" />
            </Link>
          </div>

          <ul className="mt-10 grid grid-cols-2 border-l border-t hair sm:grid-cols-3 lg:grid-cols-6">
            {vehicleTypes.map(({ Icon, label }, index) => (
              <li key={label} className="flex min-h-44 flex-col justify-between border-r border-b hair p-5">
                <span className="font-mono text-xs text-brand-600">{String(index + 1).padStart(2, "0")}</span>
                <Icon className="h-9 w-16 text-brand-600" />
                <span className="font-display text-lg font-semibold text-ink-900">{label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-slate-600">
            Including high-kilometre, damaged, non-running, end-of-lease and unregistered vehicles.
          </p>
        </div>
      </section>

      <section className="border-t hair bg-ink-900 py-16 text-white lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="t-index mb-4 text-brand-200">Seller clarity · 04</p>
            <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Know the terms before pickup.</h2>
            <p className="mt-6 text-brand-200">Clear expectations make a car sale easier for everyone.</p>
          </div>
          <dl className="border-y border-white/30">
            {sellerPromises.map(([term, detail], index) => (
              <div key={term} className="grid gap-3 border-b border-white/30 py-6 last:border-b-0 sm:grid-cols-[3rem_12rem_1fr] sm:gap-6">
                <span className="font-mono text-xs text-brand-200">{String(index + 1).padStart(2, "0")}</span>
                <dt className="font-display text-xl font-semibold">{term}</dt>
                <dd className="text-sm leading-relaxed text-brand-200">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t hair bg-slate-50 py-16 lg:py-24">
        <div className="shell">
          <Reveal>
            <SectionHeading
              eyebrow="Service area · 05"
              title="Free pickup across Brisbane, the Gold Coast and surrounding regions."
              lede="Choose your region for local suburb coverage and service information."
            />
          </Reveal>
          <div className="mt-14"><AreaCards /></div>
        </div>
      </section>

      <section className="border-t hair bg-white py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div>
            <p className="t-index mb-4 text-brand-700">Useful answers · 06</p>
            <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Before you request a quote.</h2>
            <Link href="/faq" className="mt-8 inline-flex items-center gap-2 font-semibold underline underline-offset-4">
              Read all FAQs <ArrowRightIcon className="size-5" />
            </Link>
          </div>
          <FaqList items={faqs.slice(0, 5)} />
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
