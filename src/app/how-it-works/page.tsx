import { site } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";
import { Reveal } from "@/components/Reveal";
import { CtaBanner, PageHero, StepsGrid } from "@/components/sections";
import { CheckIcon } from "@/components/icons";

export const metadata = pageMetadata({
  path: "/how-it-works",
  title: "How to Sell Your Car in 4 Steps",
  description: `Sell your car to ${site.name} in four clear steps: request a quote, review your offer, arrange free pickup and receive payment before collection.`,
});

const checklist = [
  "Photo ID (driver licence or passport)",
  "Queensland registration papers, or other proof of ownership",
  "All sets of keys you have",
  "Payout letter from your lender, if the car is under finance",
  "Your BSB and account number for the transfer",
];

const knowings = [
  {
    title: "No roadworthy needed",
    text: "You're selling to a business, so no RWC is required — we buy the car exactly as it sits.",
  },
  {
    title: "Payment before pickup",
    text: "The bank transfer is made in front of you, before the car goes anywhere. We never take a vehicle unpaid.",
  },
  {
    title: "Registration & transfer",
    text: "We complete the transfer paperwork together at pickup, and you can claim back any remaining rego from TMR afterwards.",
  },
  {
    title: "Cars under finance",
    text: "Bring a payout letter and we can settle the lender directly, transferring any difference to you.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title={
          <>
            From quote to cash in{" "}
            <span className="text-gradient">four steps</span>
          </>
        }
        lede="Quotes usually go out the same day during business hours. Once you accept, we arrange the remaining steps around a suitable collection time. Here's the whole process, start to finish."
      />

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <StepsGrid detailed />
        </div>
      </section>

      <section className="bg-dots relative bg-slate-50 py-24">
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
          <Reveal>
            <div className="h-full rounded-3xl border border-slate-200/80 bg-white p-8 shadow-card sm:p-10">
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                What to have ready at pickup
              </h2>
              <p className="mt-3 leading-relaxed text-slate-600">
                Pickup takes about 15 minutes all up. To keep it quick, have
                these on hand:
              </p>
              <ul className="mt-7 space-y-4">
                {checklist.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[15px] text-slate-700"
                  >
                    <span className="mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 text-white">
                      <CheckIcon className="size-3" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="h-full rounded-3xl bg-ink-900 p-8 sm:p-10">
              <h2 className="font-display text-2xl font-bold tracking-tight text-white">
                A few things worth knowing
              </h2>
              <dl className="mt-7 space-y-6">
                {knowings.map((k) => (
                  <div key={k.title}>
                    <dt className="font-display font-bold text-brand-300">
                      {k.title}
                    </dt>
                    <dd className="mt-1.5 text-[15px] leading-relaxed text-slate-400">
                      {k.text}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="bg-white pt-24">
        <CtaBanner title="Start with a free quote" />
      </div>
    </>
  );
}
