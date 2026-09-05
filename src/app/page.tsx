import type { Metadata } from "next";
import Link from "next/link";
import { site, telHref } from "@/config/site";
import { faqs } from "@/data/faqs";
import { localPages } from "@/data/localPages";
import { QuoteForm } from "@/components/QuoteForm";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { GuideLinks } from "@/components/GuideLinks";
import {
  AreaCards,
  CtaBanner,
  FaqList,
  StepsGrid,
} from "@/components/sections";
import {
  ArrowRightIcon,
  BanknoteIcon,
  FourWdIcon,
  LightTruckIcon,
  MapPinIcon,
  SedanIcon,
  SuvIcon,
  TruckIcon,
  UteIcon,
  VanIcon,
} from "@/components/icons";

const vehicleTypes = [
  {
    Icon: SedanIcon,
    label: "Sedans & hatches",
    copy: "Old, unwanted and high-kilometre everyday cars.",
  },
  {
    Icon: SuvIcon,
    label: "SUVs & wagons",
    copy: "Family vehicles in any age or condition.",
  },
  {
    Icon: UteIcon,
    label: "Utes",
    copy: "Work utes, dual-cabs and trade vehicles.",
  },
  {
    Icon: VanIcon,
    label: "Vans",
    copy: "Commercial vans, people movers and couriers.",
  },
  {
    Icon: FourWdIcon,
    label: "4x4s",
    copy: "Off-road vehicles, projects and damaged 4WDs.",
  },
  {
    Icon: LightTruckIcon,
    label: "Light trucks",
    copy: "Small trucks and commercial vehicles.",
  },
];

const reasons = [
  {
    Icon: BanknoteIcon,
    title: "A clear offer",
    copy: "Know exactly what you will receive before you arrange collection.",
  },
  {
    Icon: TruckIcon,
    title: "Pickup included",
    copy: "We collect from your home or workplace with no towing fee deducted.",
  },
  {
    Icon: MapPinIcon,
    title: "Local service",
    copy: "A Toowoomba-based team serving the city, its suburbs and towns across the Toowoomba Region.",
  },
];

export const metadata: Metadata = {
  keywords: [
    "cash for cars Toowoomba",
    "car removal Toowoomba",
    "free car removal Toowoomba",
    "sell my car Toowoomba",
    "car buyers Toowoomba",
    "cash for unwanted cars Toowoomba",
    "scrap car removal Toowoomba",
    "sell damaged car Toowoomba",
  ],
};

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink-900 text-white lg:min-h-[760px]">
        <div className="relative h-[270px] sm:h-[420px] lg:absolute lg:inset-0 lg:h-auto">
          <Photo
            name="hero"
            preload
            alt="A Carbase representative handing payment to a car owner beside their vehicle"
            className="object-right lg:object-center"
          />
          <span
            className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/35 to-transparent lg:hidden"
            aria-hidden
          />
        </div>
        <span className="photo-scrim-home hidden lg:block" aria-hidden />
        <div className="shell relative z-10 lg:flex lg:min-h-[760px] lg:items-end lg:py-16">
          <div className="hero-panel w-full py-10 sm:py-12 lg:max-w-[680px] lg:border-2 lg:border-white lg:bg-ink-900/62 lg:p-12 lg:backdrop-blur-[2px]">
            <p className="t-index text-brand-200">
              Toowoomba car buyers · Local pickup
            </p>
            <h1 className="mt-4 max-w-[14ch] font-display text-4xl font-medium leading-[1.04] tracking-tight text-balance sm:text-5xl lg:mt-5 lg:max-w-[12ch] lg:text-[4.6rem] lg:leading-[1.02]">
              A simpler way to sell your car in Toowoomba.
            </h1>
            <p className="mt-5 max-w-[54ch] text-base leading-relaxed text-white/85 sm:text-lg lg:mt-6 lg:text-white/90">
              Carbase buys old, damaged, non-running and unwanted cars
              throughout the Toowoomba Region, with a free quote, free car
              removal and payment before collection.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:mt-8">
              <a href="#quote" className="btn-primary">
                Get a free quote <ArrowRightIcon className="size-4" />
              </a>
              <a href={telHref} className="btn-ghost-dark">
                Call {site.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="quote" className="scroll-mt-28 bg-brand-50 py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-20">
          <Reveal>
            <div className="lg:sticky lg:top-36">
              <p className="t-index text-brand-700">Start here</p>
              <h2 className="mt-5 max-w-[12ch] font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink-900 sm:text-5xl">
                Tell us about the car. We&apos;ll take it from here.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                Share the make, model, year and condition. Photos are optional,
                but they help us prepare a sharper offer without making you wait
                for an inspection.
              </p>
              <dl className="mt-10 border-y border-brand-200">
                {[
                  [
                    "Usually same day",
                    "Most enquiries receive a response during business hours.",
                  ],
                  [
                    "No obligation",
                    "Review the offer and decide in your own time.",
                  ],
                  ["No hidden fees", "The agreed amount is what you receive."],
                ].map(([term, detail]) => (
                  <div
                    key={term}
                    className="grid gap-1 border-b border-brand-200 py-5 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-6"
                  >
                    <dt className="font-display text-lg font-semibold text-ink-900">
                      {term}
                    </dt>
                    <dd className="text-sm leading-relaxed text-slate-600">
                      {detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <QuoteForm heading="Request your free quote" />
          </Reveal>
        </div>
      </section>

      <section
        className="border-y border-slate-200 bg-white py-16 lg:py-20"
        aria-labelledby="toowoomba-services"
      >
        <div className="shell">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:gap-16">
              <div>
                <p className="t-index text-brand-700">Toowoomba services</p>
                <h2
                  id="toowoomba-services"
                  className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink-900 sm:text-5xl"
                >
                  Choose the help you need with your car.
                </h2>
              </div>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-600 lg:justify-self-end">
                Start with the service that best matches your situation. Both include
                a free quote, collection within our service area and payment before
                the vehicle is loaded.
              </p>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {localPages.map((page, index) => (
              <Reveal key={page.slug} delay={index * 100} className="h-full">
                <Link
                  href={`/${page.slug}`}
                  className="group flex h-full flex-col border border-brand-200 bg-brand-50 p-7 transition hover:border-brand-600 sm:p-9"
                >
                  <span className="font-mono text-xs font-semibold text-brand-700">
                    0{index + 1}
                  </span>
                  <h3 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink-900 group-hover:text-brand-700">
                    {page.navLabel}
                  </h3>
                  <p className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-600">
                    {page.seoDescription}
                  </p>
                  <span className="mt-7 inline-flex items-center gap-2 font-semibold text-brand-700 underline underline-offset-4">
                    Learn about this service
                    <ArrowRightIcon className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="shell">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:gap-16">
            <Reveal>
              <div>
                <p className="t-index text-brand-700">What we buy</p>
                <h2 className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink-900 sm:text-5xl">
                  Every make. Every model. Almost every condition.
                </h2>
              </div>
            </Reveal>
            <p className="max-w-2xl text-lg leading-relaxed text-slate-600 lg:justify-self-end">
              From a reliable runabout you no longer need to a written-off
              vehicle that cannot leave the driveway, send us the details. There
              is no need to repair, detail or advertise it first.
            </p>
          </div>
          <ul className="mt-12 grid border-l border-t border-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {vehicleTypes.map(({ Icon, label, copy }, index) => (
              <li
                key={label}
                className="group min-h-60 border-r border-b border-slate-200 p-7 transition hover:bg-brand-50 sm:p-8"
              >
                <div className="flex items-start justify-between gap-5">
                  <span className="flex size-16 items-center justify-center bg-brand-600 text-white transition group-hover:bg-ink-900">
                    <Icon className="h-8 w-14" />
                  </span>
                  <span className="font-mono text-xs text-slate-600">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-8 font-display text-2xl font-semibold text-ink-900">
                  {label}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {copy}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid bg-ink-900 text-white lg:grid-cols-2">
        <div className="relative min-h-[440px] lg:min-h-[650px]">
          <Photo
            name="pickup"
            alt="An unwanted car ready for free collection"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <span className="photo-scrim-soft" aria-hidden />
        </div>
        <div className="flex items-center px-6 py-16 sm:px-10 lg:px-16 lg:py-24 xl:px-24">
          <Reveal>
            <div className="max-w-xl">
              <p className="t-index text-brand-200">A simpler sale</p>
              <h2 className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl">
                A direct way to sell, without the usual runaround.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-white/75">
                Skip listings, low-ball messages, inspections and test drives.
                Carbase gives you one clear path from vehicle details to payment
                and pickup.
              </p>
              <ul className="mt-10 border-t border-white/25">
                {reasons.map(({ Icon, title, copy }) => (
                  <li
                    key={title}
                    className="grid grid-cols-[3rem_1fr] gap-5 border-b border-white/25 py-6"
                  >
                    <Icon className="mt-1 size-7 text-brand-300" />
                    <div>
                      <h3 className="font-display text-xl font-semibold">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/70">
                        {copy}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/how-it-works" className="btn-primary mt-9">
                See how it works <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="shell">
          <Reveal>
            <div className="max-w-3xl">
              <p className="t-index text-brand-700">
                Four straightforward steps
              </p>
              <h2 className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink-900 sm:text-5xl">
                From first details to final pickup.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
                A clear process, so you always know what happens next.
              </p>
            </div>
          </Reveal>
          <div className="mt-12">
            <StepsGrid />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="shell">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end lg:gap-16">
              <div>
                <p className="t-index text-brand-700">Our service area</p>
                <h2 className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink-900 sm:text-5xl">
                  Focused entirely on the Toowoomba Region.
                </h2>
              </div>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-600 lg:justify-self-end">
                We serve Toowoomba city and suburbs plus towns within the
                Toowoomba Regional Council area. Check the coverage page for
                the full suburb and regional-town list.
              </p>
            </div>
          </Reveal>
          <div className="mt-12">
            <AreaCards />
          </div>
        </div>
      </section>

      <GuideLinks
        title="Useful reading before you decide"
        lede="Understand what can shape an offer, whether a repair is worthwhile and how to prepare a non-running car for collection."
      />

      <section className="bg-brand-50 py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="t-index text-brand-700">Useful answers</p>
            <h2 className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink-900 sm:text-5xl">
              Before you request a quote.
            </h2>
            <Link
              href="/faq"
              className="mt-8 inline-flex items-center gap-2 font-semibold text-brand-700 underline underline-offset-4"
            >
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
