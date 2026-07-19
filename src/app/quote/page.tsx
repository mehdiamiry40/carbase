import type { Metadata } from "next";
import { site, telHref } from "@/config/site";
import { QuoteForm } from "@/components/QuoteForm";
import { Reveal } from "@/components/Reveal";
import { CheckIcon, PhoneIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Get a Free Quote — Sell Your Car Today",
  description: `Tell us about your car and get a free, no-obligation cash quote from ${site.name}. Free pickup across Brisbane and the Gold Coast, payment on the spot.`,
};

const reassurance = [
  "Free quote with no obligation to sell",
  "Any make, model or condition — running or not",
  "Free pickup across Brisbane & the Gold Coast",
  "Instant bank transfer before we take the car",
];

export default function QuotePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink-900">
        <div className="bg-dots-dark absolute inset-0" aria-hidden />
        <div
          className="absolute -top-40 left-1/2 h-[28rem] w-[48rem] -translate-x-1/2 rounded-full bg-brand-600/20 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8 lg:pt-40">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-bold tracking-[0.16em] text-accent-300 uppercase backdrop-blur">
                Free quote
              </p>
              <h1 className="font-display mt-5 text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl sm:leading-[1.1]">
                Tell us about your car.{" "}
                <span className="text-gradient">We'll do the rest.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
                Three quick steps and we&apos;ll come back with a firm cash
                offer — usually the same day.
              </p>
              <ul className="mt-8 space-y-3.5">
                {reassurance.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[15px] text-slate-200"
                  >
                    <span className="mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 text-white">
                      <CheckIcon className="size-3" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-sm font-semibold text-slate-300">
                  Rather talk it through?
                </p>
                <a
                  href={telHref}
                  className="mt-2 inline-flex items-center gap-2.5 text-xl font-bold text-white transition hover:text-brand-300"
                >
                  <PhoneIcon className="size-5 text-accent-400" />
                  {site.phone}
                </a>
                <p className="mt-1 text-sm text-slate-400">{site.hours}</p>
              </div>
            </div>
            <Reveal delay={100}>
              <div className="relative">
                <div
                  className="absolute -inset-4 rounded-[2rem] bg-linear-to-br from-brand-500/40 via-accent-400/20 to-transparent opacity-60 blur-2xl"
                  aria-hidden
                />
                <div className="relative">
                  <QuoteForm heading="Get your free quote" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
