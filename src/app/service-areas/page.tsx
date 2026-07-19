import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { AreaCards, CtaBanner, PageHero } from "@/components/sections";

export const metadata: Metadata = {
  title: "Areas We Cover — Brisbane, Gold Coast & Surrounds",
  description:
    "Carbase buys cars across Brisbane, the Gold Coast, Logan, Ipswich, the Redlands and Moreton Bay — with free pickup everywhere we operate.",
};

export default function ServiceAreasPage() {
  return (
    <>
      <PageHero
        eyebrow="Service areas"
        title={
          <>
            Wherever you are in SEQ,{" "}
            <span className="text-gradient">we come to you</span>
          </>
        }
        lede="Free pickup applies across every area below. Not on the list? Ask anyway — we can often make it work."
        compact
      />
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <AreaCards />
          </Reveal>
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
