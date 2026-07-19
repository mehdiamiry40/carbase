import type { Metadata } from "next";
import { site } from "@/config/site";
import { CtaBanner, SectionHeading } from "@/components/sections";
import { BanknoteIcon, MapPinIcon, ShieldIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "About Us — A Local Brisbane & Gold Coast Car Buyer",
  description: `${site.name} is a local South East Queensland car buying service. Learn who we are, how we work and why sellers across Brisbane and the Gold Coast choose us.`,
};

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
      <section className="bg-linear-to-b from-brand-50 to-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="About us"
            title={`The easiest way to sell a car in South East Queensland`}
          />
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-slate-600">
            <p>
              {site.name} started with a simple observation: selling a car
              privately is painful. Weeks of listings and messages, strangers
              test-driving your car, tyre-kickers haggling in your driveway —
              and after all that, the sale still falls through half the time.
            </p>
            <p>
              So we built the alternative. Tell us about your car once, get a
              fair cash offer fast, and have the whole thing done — inspection,
              paperwork, payment and pickup — often within a day. That's the
              entire business: buying cars across Brisbane and the Gold Coast
              and making it feel easy.
            </p>
            <p>
              We buy everything from near-new SUVs to utes with a hard life
              behind them and cars that no longer start. Whatever you're
              selling, you'll get a straight answer and a real offer.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="What we stand for" title="How we do business" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <v.Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner title="Have a car to sell?" />
    </>
  );
}
