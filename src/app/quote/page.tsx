import type { Metadata } from "next";
import { site, telHref } from "@/config/site";
import { QuoteForm } from "@/components/QuoteForm";
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
    <section className="bg-linear-to-b from-brand-50 to-white py-14">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-5 lg:gap-16">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Get your free quote
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Tell us a bit about your car and we&apos;ll come back with a firm
            cash offer — usually the same day.
          </p>
          <ul className="mt-8 space-y-3">
            {reassurance.map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-700">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckIcon className="size-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Rather talk it through?
            </p>
            <a
              href={telHref}
              className="mt-2 inline-flex items-center gap-2 text-lg font-bold text-brand-700 hover:underline"
            >
              <PhoneIcon className="size-5" />
              {site.phone}
            </a>
            <p className="mt-1 text-sm text-slate-500">{site.hours}</p>
          </div>
        </div>
        <div className="lg:col-span-3">
          <QuoteForm heading="Tell us about your car" />
        </div>
      </div>
    </section>
  );
}
