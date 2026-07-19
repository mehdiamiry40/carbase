import Link from "next/link";
import { site, telHref } from "@/config/site";
import { faqs, type Faq } from "@/data/faqs";
import { testimonials } from "@/data/testimonials";
import {
  ArrowRightIcon,
  BanknoteIcon,
  CameraIcon,
  ChevronDownIcon,
  PhoneIcon,
  StarIcon,
  TruckIcon,
} from "@/components/icons";

/* ── Section heading ─────────────────────────────────────────────────── */

export function SectionHeading({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold tracking-widest text-brand-600 uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {lede && <p className="mt-4 text-lg leading-relaxed text-slate-600">{lede}</p>}
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
      "Happy with the offer? We arrange a time that suits and come to your home or work anywhere in Brisbane or on the Gold Coast.",
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
    <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <span className="absolute -top-3.5 left-6 flex size-7 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-sm">
            {i + 1}
          </span>
          <step.Icon className="size-7 text-brand-600" />
          <h3 className="mt-4 text-base font-bold text-slate-900">{step.title}</h3>
          <p
            className={`mt-2 text-sm leading-relaxed text-slate-600 ${detailed ? "" : "line-clamp-4"}`}
          >
            {step.description}
          </p>
        </li>
      ))}
    </ol>
  );
}

/* ── Testimonials ────────────────────────────────────────────────────── */

export function Testimonials() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {testimonials.map((t) => (
        <figure
          key={t.quote}
          className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex gap-1 text-amber-400" aria-label={`${t.rating} out of 5 stars`}>
            {Array.from({ length: t.rating }).map((_, i) => (
              <StarIcon key={i} className="size-4" />
            ))}
          </div>
          <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-700">
            “{t.quote}”
          </blockquote>
          <figcaption className="mt-4 text-sm">
            <span className="font-semibold text-slate-900">{t.name}</span>
            <span className="text-slate-500"> · {t.location}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/* ── FAQ accordion (no JS needed) ────────────────────────────────────── */

export function FaqList({ items = faqs }: { items?: Faq[] }) {
  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm">
      {items.map((faq) => (
        <details key={faq.question} className="group px-6 py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
            {faq.question}
            <ChevronDownIcon className="size-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

/* ── Bottom call-to-action banner ────────────────────────────────────── */

export function CtaBanner({
  title = "Ready to sell your car?",
  subtitle = "Get a free, no-obligation quote today — free pickup and payment on the spot anywhere in Brisbane and on the Gold Coast.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-brand-700">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="max-w-2xl text-lg leading-relaxed text-brand-100">{subtitle}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/quote"
            className="rounded-full bg-white px-8 py-3.5 text-base font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
          >
            Get my free quote
          </Link>
          <a
            href={telHref}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-300 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-brand-600"
          >
            <PhoneIcon className="size-4" />
            {site.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
