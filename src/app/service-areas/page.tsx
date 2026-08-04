import { Reveal } from "@/components/Reveal";
import { pageMetadata } from "@/lib/metadata";
import { AreaCards, CtaBanner, PageHero } from "@/components/sections";

export const metadata = pageMetadata({
  path: "/service-areas",
  title: "Cash for Cars Service Areas in South East Queensland",
  description: "Carbase buys old, damaged and junk cars across Brisbane, Gold Coast, Logan, Ipswich, Redlands and Moreton Bay, with free vehicle pickup.",
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
