import type { Metadata } from "next";
import { site } from "@/config/site";
import { CtaBanner, SectionHeading, StepsGrid } from "@/components/sections";
import { CheckIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "How It Works — Sell Your Car in 4 Easy Steps",
  description: `Selling your car to ${site.name} takes four simple steps: get a quote, accept your offer, free pickup, instant payment. Here's exactly what to expect.`,
};

const checklist = [
  "Photo ID (driver licence or passport)",
  "Queensland registration papers, or other proof of ownership",
  "All sets of keys you have",
  "Payout letter from your lender, if the car is under finance",
  "Your BSB and account number for the transfer",
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-linear-to-b from-brand-50 to-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="How it works"
            title="From quote to cash in four steps"
            lede="Most sales wrap up within a day or two of the first message — and often the same day. Here's the whole process, start to finish."
          />
          <div className="mt-14">
            <StepsGrid detailed />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              What to have ready at pickup
            </h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              Pickup takes about 15 minutes all up. To keep it quick, have these
              on hand:
            </p>
            <ul className="mt-6 space-y-3">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-700">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckIcon className="size-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              A few things worth knowing
            </h2>
            <dl className="mt-6 space-y-5 text-sm leading-relaxed">
              <div>
                <dt className="font-bold text-slate-900">No roadworthy needed</dt>
                <dd className="mt-1 text-slate-600">
                  You're selling to a business, so no RWC is required — we buy
                  the car exactly as it sits.
                </dd>
              </div>
              <div>
                <dt className="font-bold text-slate-900">Payment before pickup</dt>
                <dd className="mt-1 text-slate-600">
                  The bank transfer is made in front of you, before the car goes
                  anywhere. We never take a vehicle unpaid.
                </dd>
              </div>
              <div>
                <dt className="font-bold text-slate-900">Registration &amp; transfer</dt>
                <dd className="mt-1 text-slate-600">
                  We complete the transfer paperwork together at pickup, and you
                  can claim back any remaining rego from TMR afterwards.
                </dd>
              </div>
              <div>
                <dt className="font-bold text-slate-900">Cars under finance</dt>
                <dd className="mt-1 text-slate-600">
                  Bring a payout letter and we can settle the lender directly,
                  transferring any difference to you.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <CtaBanner title="Start with a free quote" />
    </>
  );
}
