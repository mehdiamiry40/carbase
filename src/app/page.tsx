import Link from "next/link";
import { site } from "@/config/site";
import { areas } from "@/data/areas";
import { faqs } from "@/data/faqs";
import { QuoteForm } from "@/components/QuoteForm";
import {
  CtaBanner,
  FaqList,
  SectionHeading,
  StepsGrid,
  Testimonials,
} from "@/components/sections";
import {
  ArrowRightIcon,
  BanknoteIcon,
  BoltIcon,
  CheckIcon,
  MapPinIcon,
  ShieldIcon,
  TruckIcon,
} from "@/components/icons";

const heroPoints = [
  "Any make, model or condition — even not running",
  "Free pickup from your home or work",
  "Instant bank transfer before we take the car",
];

const trustItems = [
  {
    Icon: BoltIcon,
    title: "Same-day quotes",
    text: "Most offers go out within hours of your request.",
  },
  {
    Icon: TruckIcon,
    title: "Free pickup",
    text: "We come to you anywhere in Brisbane & the Gold Coast.",
  },
  {
    Icon: BanknoteIcon,
    title: "Paid on the spot",
    text: "Instant bank transfer before the car leaves your driveway.",
  },
  {
    Icon: ShieldIcon,
    title: "Paperwork sorted",
    text: "We handle the transfer with you — no RWC needed.",
  },
];

const vehicleTypes = [
  "Sedans",
  "Hatchbacks",
  "SUVs",
  "Utes",
  "Vans",
  "4x4s",
  "Wagons",
  "Light trucks",
  "Damaged cars",
  "Unregistered cars",
  "Not running",
  "End-of-lease",
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-brand-50 via-white to-white">
        <div
          className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-brand-100/60 blur-3xl"
          aria-hidden
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
              <MapPinIcon className="size-3.5" />
              Brisbane · Gold Coast · South East QLD
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance text-slate-900 sm:text-5xl">
              Sell your car today.{" "}
              <span className="text-brand-600">Paid on the spot.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              {site.name} buys cars of every make and condition across Brisbane
              and the Gold Coast. Get a free quote in minutes — we handle the
              pickup and the paperwork.
            </p>
            <ul className="mt-7 space-y-3">
              {heroPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-slate-700">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckIcon className="size-3" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-slate-500">
              Prefer to talk?{" "}
              <a
                href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}
                className="font-semibold text-brand-700 hover:underline"
              >
                Call {site.phone}
              </a>{" "}
              — {site.hours}.
            </p>
          </div>

          <div id="quote">
            <QuoteForm />
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <item.Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="How it works"
            title="Four simple steps to a sold car"
            lede="From first message to money in your account — usually within a day or two, sometimes the same day."
          />
          <div className="mt-12">
            <StepsGrid />
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 font-semibold text-brand-700 hover:underline"
            >
              See the full process
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* What we buy */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="What we buy"
            title="If it has wheels, we're interested"
            lede="Old or new, pristine or written off — you don't need a roadworthy certificate, and the car doesn't even need to start."
          />
          <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3">
            {vehicleTypes.map((type) => (
              <li
                key={type}
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm"
              >
                {type}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why Carbase */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Why Carbase"
            title="Selling privately is a hassle. This isn't."
            lede="No listings, no strangers test-driving your car, no tyre-kickers haggling in your driveway."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "A local team",
                text: "We're based in South East Queensland and only work Brisbane, the Gold Coast and surrounds — so we can actually turn up when we say we will.",
              },
              {
                title: "The quote is the price",
                text: "The offer we make is the amount that hits your account. No fees deducted, no towing charges, no renegotiating at pickup when the car matches its description.",
              },
              {
                title: "Done in days, not weeks",
                text: "Private sales drag on for weeks of messages and no-shows. We quote fast, collect fast and pay before the car moves an inch.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Reviews"
            title="What sellers say about us"
          />
          <div className="mt-12">
            <Testimonials />
          </div>
        </div>
      </section>

      {/* Areas */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Where we operate"
            title="Covering Brisbane, the Gold Coast & beyond"
            lede="Free pickup everywhere we operate. Find your area below."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <Link
                key={area.slug}
                href={`/service-areas/${area.slug}`}
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-300 hover:shadow-md"
              >
                <span>
                  <span className="flex items-center gap-2 font-bold text-slate-900">
                    <MapPinIcon className="size-4 text-brand-600" />
                    {area.short}
                  </span>
                  <span className="mt-1 block text-sm text-slate-500">
                    Cash for cars in {area.name}
                  </span>
                </span>
                <ArrowRightIcon className="size-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-600" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHeading eyebrow="FAQ" title="Quick answers" />
          <div className="mt-10">
            <FaqList items={faqs.slice(0, 4)} />
          </div>
          <p className="mt-8 text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 font-semibold text-brand-700 hover:underline"
            >
              Read all FAQs
              <ArrowRightIcon className="size-4" />
            </Link>
          </p>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
