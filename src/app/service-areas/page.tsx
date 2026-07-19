import type { Metadata } from "next";
import Link from "next/link";
import { areas } from "@/data/areas";
import { CtaBanner, SectionHeading } from "@/components/sections";
import { ArrowRightIcon, MapPinIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Areas We Cover — Brisbane, Gold Coast & Surrounds",
  description:
    "Carbase buys cars across Brisbane, the Gold Coast, Logan, Ipswich, the Redlands and Moreton Bay — with free pickup everywhere we operate.",
};

export default function ServiceAreasPage() {
  return (
    <>
      <section className="bg-linear-to-b from-brand-50 to-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Service areas"
            title="Wherever you are in SEQ, we come to you"
            lede="Free pickup applies across every area below. Not on the list? Ask anyway — we can often make it work."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <Link
                key={area.slug}
                href={`/service-areas/${area.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-brand-300 hover:shadow-md"
              >
                <span className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <MapPinIcon className="size-5 text-brand-600" />
                  {area.short}
                </span>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
                  {area.intro}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                  Cash for cars {area.short}
                  <ArrowRightIcon className="size-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
