import Link from "next/link";
import { site, telHref } from "@/config/site";
import { faqs } from "@/data/faqs";
import { QuoteForm } from "@/components/QuoteForm";
import { Reveal } from "@/components/Reveal";
import {
  AreaCards,
  BrandMarquee,
  CtaBanner,
  FaqList,
  SectionHeading,
  StatBand,
  StepsGrid,
  Testimonials,
} from "@/components/sections";
import {
  ArrowRightIcon,
  BanknoteIcon,
  BoltIcon,
  CheckIcon,
  FourWdIcon,
  LightTruckIcon,
  MapPinIcon,
  SedanIcon,
  ShieldIcon,
  SuvIcon,
  UteIcon,
  VanIcon,
} from "@/components/icons";

const heroPoints = [
  "Any make, model or condition — even not running",
  "Free pickup from your home or work",
  "Instant bank transfer before we take the car",
];

const vehicleTypes = [
  { Icon: SedanIcon, label: "Sedans & hatches" },
  { Icon: SuvIcon, label: "SUVs & wagons" },
  { Icon: UteIcon, label: "Utes" },
  { Icon: VanIcon, label: "Vans" },
  { Icon: FourWdIcon, label: "4x4s" },
  { Icon: LightTruckIcon, label: "Light trucks" },
];

const conditionChips = [
  "Damaged",
  "Unregistered",
  "Not running",
  "High kilometres",
  "End-of-lease",
  "Written off",
];

const whyCards = [
  {
    Icon: MapPinIcon,
    title: "A genuinely local team",
    text: "We're based in South East Queensland and only work Brisbane, the Gold Coast and surrounds — so we actually turn up when we say we will.",
    featured: false,
  },
  {
    Icon: BanknoteIcon,
    title: "The quote is the price",
    text: "The offer we make is the amount that hits your account. No fees deducted, no towing charges, no renegotiating at pickup when the car matches its description.",
    featured: true,
  },
  {
    Icon: BoltIcon,
    title: "Done in days, not weeks",
    text: "Private sales drag on for weeks of messages and no-shows. We quote fast, collect fast and pay before the car moves an inch.",
    featured: false,
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink-900">
        <div className="bg-dots-dark absolute inset-0" aria-hidden />
        <div
          className="absolute -top-48 -left-40 h-[36rem] w-[36rem] rounded-full bg-brand-600/25 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute top-24 -right-48 h-[30rem] w-[30rem] rounded-full bg-accent-500/12 blur-3xl"
          aria-hidden
        />
        <div
          className="animate-float absolute top-40 right-[38%] hidden size-2.5 rounded-full bg-accent-400/80 lg:block"
          aria-hidden
        />
        <div
          className="animate-float-late absolute top-[68%] left-[46%] hidden size-2 rounded-full bg-brand-400/70 lg:block"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-4 pt-32 pb-16 sm:px-6 lg:px-8 lg:pt-40 lg:pb-20">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-accent-400" />
                </span>
                Buying cars now across Brisbane &amp; the Gold Coast
              </p>

              <h1 className="font-display mt-6 text-[2.75rem] leading-[1.08] font-bold tracking-tight text-balance text-white sm:text-6xl">
                Sell your car today.{" "}
                <span className="text-gradient">Paid on the spot.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                {site.name} buys cars of every make and condition across South
                East Queensland. Get a free quote in minutes — we handle the
                pickup, the paperwork and the payment before we take the keys.
              </p>

              <ul className="mt-8 space-y-3.5">
                {heroPoints.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 text-[15px] text-slate-200"
                  >
                    <span className="mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 text-white">
                      <CheckIcon className="size-3" strokeWidth={3} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a href={telHref} className="btn-ghost-dark !py-3 text-sm">
                  <span className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-brand-500 to-brand-700">
                    <PhoneGlyph />
                  </span>
                  <span className="text-left leading-tight">
                    <span className="block text-[11px] font-medium text-slate-400">
                      Prefer to talk? {site.hours}
                    </span>
                    {site.phone}
                  </span>
                </a>
              </div>
            </div>

            {/* Wizard card */}
            <div className="relative" id="quote">
              <div
                className="absolute -inset-4 rounded-[2rem] bg-linear-to-br from-brand-500/40 via-accent-400/20 to-transparent opacity-60 blur-2xl"
                aria-hidden
              />
              <div className="relative">
                <QuoteForm />
              </div>
            </div>
          </div>

          <div className="mt-16">
            <StatBand />
          </div>
        </div>

        <BrandMarquee />
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title="Four simple steps to a sold car"
              lede="From first message to money in your account — usually within a day or two, sometimes the same day."
            />
          </Reveal>
          <div className="mt-14">
            <StepsGrid />
          </div>
          <Reveal>
            <div className="mt-12 text-center">
              <Link
                href="/how-it-works"
                className="group inline-flex items-center gap-2 font-semibold text-brand-700 transition hover:text-brand-800"
              >
                See the full process
                <ArrowRightIcon className="size-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── What we buy ──────────────────────────────────────────── */}
      <section className="bg-dots relative bg-slate-50 py-24">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="What we buy"
              title="If it has wheels, we're interested"
              lede="Old or new, pristine or written off — you don't need a roadworthy certificate, and the car doesn't even need to start."
            />
          </Reveal>
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {vehicleTypes.map((v, i) => (
              <Reveal key={v.label} delay={i * 70}>
                <div className="group flex h-full flex-col items-center gap-4 rounded-3xl border border-slate-200/80 bg-white px-4 py-7 text-center shadow-card transition duration-300 hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-card-lg">
                  <v.Icon className="h-9 w-16 text-slate-400 transition duration-300 group-hover:scale-110 group-hover:text-brand-600" />
                  <span className="text-sm font-semibold text-slate-800">
                    {v.label}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="mt-8 flex flex-wrap justify-center gap-2.5">
              {conditionChips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[13px] font-medium text-slate-600"
                >
                  <CheckIcon className="size-3.5 text-emerald-500" strokeWidth={3} />
                  {chip} — no problem
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Why Carbase (dark band) ──────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink-900 py-24">
        <div className="bg-dots-dark absolute inset-0" aria-hidden />
        <div
          className="absolute -top-40 right-0 size-96 rounded-full bg-brand-600/15 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              dark
              eyebrow="Why Carbase"
              title="Selling privately is a hassle. This isn't."
              lede="No listings, no strangers test-driving your car, no tyre-kickers haggling in your driveway."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {whyCards.map((card, i) => (
              <Reveal key={card.title} delay={i * 110}>
                <div
                  className={`h-full rounded-3xl p-8 transition duration-300 hover:-translate-y-1.5 ${
                    card.featured
                      ? "bg-linear-to-br from-brand-600 to-brand-800 shadow-glow"
                      : "border border-white/10 bg-white/5 backdrop-blur hover:border-white/20"
                  }`}
                >
                  <span
                    className={`flex size-12 items-center justify-center rounded-2xl ${
                      card.featured
                        ? "bg-white/15 text-white"
                        : "bg-linear-to-br from-brand-600 to-brand-500 text-white"
                    }`}
                  >
                    <card.Icon className="size-5.5" />
                  </span>
                  <h3 className="font-display mt-5 text-xl font-bold text-white">
                    {card.title}
                  </h3>
                  <p
                    className={`mt-3 text-[15px] leading-relaxed ${
                      card.featured ? "text-brand-100" : "text-slate-400"
                    }`}
                  >
                    {card.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Reviews"
              title="What sellers say about us"
            />
          </Reveal>
          <div className="mt-14">
            <Testimonials />
          </div>
        </div>
      </section>

      {/* ── Areas ────────────────────────────────────────────────── */}
      <section className="bg-dots relative bg-slate-50 py-24">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Where we operate"
              title="Covering Brisbane, the Gold Coast & beyond"
              lede="Free pickup everywhere we operate. Find your area below."
            />
          </Reveal>
          <div className="mt-14">
            <AreaCards />
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-8">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow="FAQ"
                title="Questions? Answered."
                lede="The things sellers usually want to know before they hit send. Can't find your answer? Just call — we're happy to talk it through."
              />
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/faq"
                  className="group inline-flex items-center gap-2 font-semibold text-brand-700 transition hover:text-brand-800"
                >
                  Read all FAQs
                  <ArrowRightIcon className="size-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <FaqList items={faqs.slice(0, 5)} />
          </Reveal>
        </div>
      </section>

      {/* ── Trust strip + CTA ────────────────────────────────────── */}
      <section className="bg-white pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-slate-100 pt-10 pb-14 text-sm font-medium text-slate-500">
              <span className="inline-flex items-center gap-2">
                <ShieldIcon className="size-4.5 text-brand-600" />
                Paperwork handled at pickup
              </span>
              <span className="inline-flex items-center gap-2">
                <BanknoteIcon className="size-4.5 text-brand-600" />
                Paid before the car moves
              </span>
              <span className="inline-flex items-center gap-2">
                <BoltIcon className="size-4.5 text-brand-600" />
                Same-day quotes
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

function PhoneGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 text-white"
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
