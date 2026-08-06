import Link from "next/link";
import { site, telHref } from "@/config/site";
import { areas } from "@/data/areas";
import { faqs, type Faq } from "@/data/faqs";
import { testimonials } from "@/data/testimonials";
import { Accordion } from "@/components/Accordion";
import { Reveal } from "@/components/Reveal";
import { Photo } from "@/components/Photo";
import {
  ArrowRightIcon,
  BanknoteIcon,
  CameraIcon,
  MapPinIcon,
  PhoneIcon,
  QuoteMarkIcon,
  StarIcon,
  TruckIcon,
} from "@/components/icons";

/* ── Section heading ─────────────────────────────────────────────────── */

export function SectionHeading({
  eyebrow,
  title,
  lede,
  dark = false,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  dark?: boolean;
  align?: "center" | "left";
}) {
  return (
    <div
      className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      <p
        className={`t-index border-b pb-3 ${dark ? "border-white/50 text-white" : "border-brand-300 text-brand-700"}`}
      >
        {eyebrow}
      </p>
      <h2
        className={`font-display mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.1] ${
          dark ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={`mt-4 text-lg leading-relaxed ${
            dark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {lede}
        </p>
      )}
    </div>
  );
}

/* ── Dark page hero (used on all subpages) ───────────────────────────── */

export function PageHero({
  eyebrow,
  title,
  lede,
  children,
  compact = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: string;
  children?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-ink-900 text-white">
      <Photo name="abandoned" alt="Old abandoned cars ready to be sold for removal" className="object-[55%_center]" preload />
      <span className="photo-scrim-page" aria-hidden />
      <div
        className={`shell relative ${compact ? "py-16 lg:py-20" : "py-20 lg:py-28"}`}
      >
        <div className="max-w-3xl">
          <p className="t-index w-fit border-b border-white/70 pb-3">
            {eyebrow}
          </p>
          <h1 className="font-display mt-6 text-4xl font-semibold tracking-tight text-balance text-white sm:text-6xl sm:leading-[1.04]">
            {title}
          </h1>
          {lede && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white">
              {lede}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

/* ── Brand marquee ───────────────────────────────────────────────────── */

const BRANDS = [
  "Toyota", "Mazda", "Hyundai", "Ford", "Mitsubishi", "Nissan", "Kia",
  "Honda", "Subaru", "Volkswagen", "Holden", "Mercedes-Benz", "BMW",
  "Audi", "Isuzu", "Suzuki", "Lexus", "Jeep",
];

export function BrandMarquee() {
  const row = (hidden: boolean) => (
    <ul
      className="flex shrink-0 items-center"
      aria-hidden={hidden || undefined}
    >
      {BRANDS.map((brand) => (
        <li
          key={brand}
          className="font-display flex items-center px-6 text-lg font-semibold whitespace-nowrap text-white/65 transition hover:text-white"
        >
          <span className="mr-12 inline-block h-px w-4 bg-white/40" />
          {brand}
        </li>
      ))}
    </ul>
  );
  return (
    <div className="border-y border-white/25 bg-ink-900 py-5">
      <p className="mb-3 text-center text-[11px] font-bold tracking-[0.22em] text-brand-200 uppercase">
        We buy every make &amp; model
      </p>
      <div className="edge-fade-x overflow-hidden">
        <div className="animate-marquee flex w-max">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}

/* ── Promise stats band ──────────────────────────────────────────────── */

const STATS = [
  { value: "2 min", label: "quote form" },
  { value: "$0", label: "fees or charges" },
  { value: "100%", label: "paid before pickup" },
  { value: "7 days", label: "we come to you" },
];

export function StatBand() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {STATS.map((stat, i) => (
        <Reveal key={stat.label} delay={i * 90}>
          <div className="border border-white/35 bg-ink-900/45 px-5 py-4 backdrop-blur">
            <p className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              <span>{stat.value}</span>
            </p>
            <p className="mt-1 text-[13px] font-medium text-brand-200">
              {stat.label}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ── How it works steps ──────────────────────────────────────────────── */

export const steps = [
  {
    title: "Tell us about your car",
    description:
      "Fill in the two-minute quote form — make, model, year, condition and a few photos if you have them. Or just call us.",
    Icon: CameraIcon,
  },
  {
    title: "Get your offer",
    description:
      "We'll come back with a firm cash offer, usually the same day. Free, no obligation, and it's the amount you actually receive.",
    Icon: BanknoteIcon,
  },
  {
    title: "We come to you",
    description:
      "Happy with the offer? We arrange a time that suits and come to your home or work anywhere in Brisbane, on the Gold Coast or in Toowoomba.",
    Icon: TruckIcon,
  },
  {
    title: "Paid on the spot",
    description:
      "Quick inspection, five minutes of paperwork, then instant bank transfer — before we take the car. Free pickup included.",
    Icon: ArrowRightIcon,
  },
];

export function StepsGrid({ detailed = false }: { detailed?: boolean }) {
  return (
    <ol className="relative grid gap-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      <div
        className="absolute top-7 right-[12%] left-[12%] hidden h-px bg-brand-300 lg:block"
        aria-hidden
      />
      {steps.map((step, i) => (
        <Reveal key={step.title} delay={i * 110}>
          <li className="group relative h-full border border-brand-200 bg-white p-7 transition duration-200 hover:border-brand-500">
            <div className="flex items-center justify-between">
              <span className="relative flex size-14 items-center justify-center bg-brand-600 text-white">
                <step.Icon className="size-6" />
              </span>
              <span className="font-mono text-xs font-semibold text-brand-600">
                0{i + 1}
              </span>
            </div>
            <h3 className="font-display mt-5 text-xl font-semibold text-ink-900">
              {step.title}
            </h3>
            <p
              className={`mt-2 text-[15px] leading-relaxed text-slate-600 ${
                detailed ? "" : "line-clamp-4"
              }`}
            >
              {step.description}
            </p>
          </li>
        </Reveal>
      ))}
    </ol>
  );
}

/* ── Testimonials ────────────────────────────────────────────────────── */

export function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {testimonials.map((t, i) => (
        <Reveal key={t.quote} delay={i * 110}>
          <figure className="flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-7 shadow-card transition duration-300 hover:-translate-y-1.5 hover:shadow-card-lg">
            <div className="flex items-center justify-between">
              <div
                className="flex gap-1 text-amber-400"
                aria-label={`${t.rating} out of 5 stars`}
              >
                {Array.from({ length: t.rating }).map((_, s) => (
                  <StarIcon key={s} className="size-4" />
                ))}
              </div>
              <QuoteMarkIcon className="size-8 text-brand-100" />
            </div>
            <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-700">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
              <span className="font-display flex size-10 items-center justify-center rounded-full bg-linear-to-br from-brand-500 to-accent-500 text-sm font-bold text-white">
                {t.name.trim().charAt(0).toUpperCase()}
              </span>
              <span className="text-sm">
                <span className="block font-semibold text-slate-900">
                  {t.name}
                </span>
                <span className="text-slate-500">{t.location}</span>
              </span>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}

/* ── FAQ list ────────────────────────────────────────────────────────── */

export function FaqList({ items = faqs }: { items?: Faq[] }) {
  return <Accordion items={items} />;
}

/* ── Area cards ──────────────────────────────────────────────────────── */

export function AreaCards({ dark = false }: { dark?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {areas.map((area, i) => (
        <Reveal key={area.slug} delay={(i % 3) * 100}>
          <Link
            href={`/service-areas/${area.slug}`}
            className={`group flex h-full items-center justify-between gap-4 border p-6 transition duration-200 ${
              dark
                ? "border-white/30 bg-white/5 backdrop-blur hover:border-white"
                : "border-brand-200 bg-white hover:border-brand-600"
            }`}
          >
            <span>
              <span
                className={`font-display flex items-center gap-2.5 text-lg font-bold ${
                  dark ? "text-white" : "text-slate-900"
                }`}
              >
                <span className="flex size-9 items-center justify-center bg-brand-600 text-white">
                  <MapPinIcon className="size-4" />
                </span>
                {area.short}
              </span>
              <span
                className={`mt-2.5 block text-sm ${
                  dark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {area.suburbs.length}+ suburbs · free pickup
              </span>
            </span>
            <ArrowRightIcon
              className={`size-5 shrink-0 transition duration-300 group-hover:translate-x-1.5 ${
                dark
                  ? "text-slate-500 group-hover:text-accent-300"
                  : "text-slate-300 group-hover:text-brand-600"
              }`}
            />
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

/* ── Bottom call-to-action banner ────────────────────────────────────── */

export function CtaBanner({
  title = "Ready to clear out that old car?",
  subtitle = "Get a free, no-obligation quote for an old, damaged or unwanted car — with free car removal across Brisbane, the Gold Coast and Toowoomba.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-white">
      <Reveal>
        <div className="relative overflow-hidden bg-ink-900 px-6 py-16 text-center sm:px-12 sm:py-24">
          <Photo name="pickup" alt="An old broken-down car ready to be sold and collected" />
          <span className="photo-scrim" aria-hidden />
          <div className="relative mx-auto max-w-4xl">
            <h2 className="font-display mx-auto max-w-2xl text-3xl font-bold tracking-tight text-balance text-white sm:text-[2.75rem] sm:leading-[1.12]">
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
              {subtitle}
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3.5 sm:flex-row">
              <Link href="/quote" className="btn-primary">
                Get my free quote
                <ArrowRightIcon className="size-4" />
              </Link>
              <a href={telHref} className="btn-ghost-dark">
                <PhoneIcon className="size-4 text-accent-400" />
                {site.phone}
              </a>
            </div>
            <p className="mt-6 text-[13px] font-medium text-brand-200">
              Free quote · No obligation · {site.hours}
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
