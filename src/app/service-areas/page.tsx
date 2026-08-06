import { Reveal } from "@/components/Reveal";
import { pageMetadata } from "@/lib/metadata";
import { AreaCards, CtaBanner, PageHero } from "@/components/sections";

export const metadata = pageMetadata({
  path: "/service-areas",
  title: "Cash for Cars & Car Removal Service Areas in SEQ",
  description:
    "Carbase buys old, damaged and junk cars across Brisbane, Gold Coast, Toowoomba, Logan, Ipswich, Redlands and Moreton Bay, with free car removal and vehicle pickup.",
  keywords: [
    "cash for cars Toowoomba",
    "car removal Toowoomba",
    "cash for cars Brisbane",
    "cash for cars Gold Coast",
    "car removal South East Queensland",
  ],
});

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
        lede="Free pickup and car removal apply across every area below — including cash for cars Toowoomba and surrounds. Not on the list? Ask anyway — we can often make it work."
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
