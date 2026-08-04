import { site } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";
import { Reveal } from "@/components/Reveal";
import { CtaBanner, PageHero, SectionHeading } from "@/components/sections";
import { BanknoteIcon, MapPinIcon, ShieldIcon } from "@/components/icons";

export const metadata = pageMetadata({
  path: "/about",
  title: "About Carbase — A Local Brisbane & Gold Coast Car Buyer",
  description: `${site.name} is a South East Queensland car buying service. Learn how our quotes, free pickup, paperwork and payment process work.`,
});

const values = [
  {
    Icon: BanknoteIcon,
    title: "Straight-up pricing",
    text: "The number we quote is the number you're paid. No admin fees, no towing charges and no surprise deductions at pickup.",
  },
  {
    Icon: MapPinIcon,
    title: "Genuinely local",
    text: "We only operate in South East Queensland. That means real people who know the area, and pickups that happen when we say they will.",
  },
  {
    Icon: ShieldIcon,
    title: "Do it properly",
    text: "Correct transfer paperwork, payment before the car moves, and clear communication the whole way through.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title={
          <>
            The easiest way to sell a car in{" "}
            <span className="text-gradient">South East Queensland</span>
          </>
        }
      />

      <section className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <div className="space-y-6 text-lg leading-relaxed text-slate-600">
              <p>
                {site.name} started with a simple observation:{" "}
                <span className="font-semibold text-slate-900">
                  selling a car privately is painful.
                </span>{" "}
                Weeks of listings and messages, strangers test-driving your
                car, tyre-kickers haggling in your driveway — and after all
                that, the sale still falls through half the time.
              </p>
              <p>
                So we built the alternative. Tell us about your car once, get a
                fair cash offer fast, and have the whole thing done —
                inspection, paperwork, payment and pickup — often within a day.
                That&apos;s the entire business: buying cars across Brisbane and
                the Gold Coast and making it feel easy.
              </p>
              <p>
                We buy everything from near-new SUVs to utes with a hard life
                behind them and cars that no longer start. Whatever you&apos;re
                selling, you&apos;ll get a straight answer and a real offer.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-dots relative bg-slate-50 py-24">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="What we stand for"
              title="How we do business"
            />
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 110}>
                <div className="group h-full rounded-3xl border border-slate-200/80 bg-white p-8 shadow-card transition duration-300 hover:-translate-y-1.5 hover:shadow-card-lg">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-brand-600 to-brand-500 text-white shadow-glow-sm transition duration-300 group-hover:scale-105">
                    <v.Icon className="size-5.5" />
                  </span>
                  <h3 className="font-display mt-5 text-xl font-bold text-slate-900">
                    {v.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                    {v.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-white pt-24">
        <CtaBanner title="Have a car to sell?" />
      </div>
    </>
  );
}
