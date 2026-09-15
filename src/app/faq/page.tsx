import { faqs } from "@/data/faqs";
import { pageMetadata } from "@/lib/metadata";
import { serializeJsonLd } from "@/lib/jsonLd";
import { Reveal } from "@/components/Reveal";
import { CtaBanner, FaqList, PageHero } from "@/components/sections";

export const metadata = pageMetadata({
  path: "/faq",
  title: "Selling Your Car FAQs | Brisbane",
  description:
    "Answers for Brisbane car sellers about eligible vehicles, quote timing, free pickup, payment and Queensland paperwork.",
  keywords: [
    "selling a car Brisbane FAQ",
    "Brisbane car quote questions",
    "vehicle sale paperwork Queensland",
  ],
});

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />
      <PageHero
        eyebrow="FAQ"
        title={
          <>
            Questions? <span className="text-gradient">Answered.</span>
          </>
        }
        lede="Everything sellers usually want to know. Can't find your answer? Just call — we're happy to talk it through."
        compact
      />
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <FaqList />
          </Reveal>
        </div>
      </section>
      <CtaBanner
        title="Still thinking it over?"
        subtitle="A quote is free and doesn't commit you to anything — find out what your car is worth today."
      />
    </>
  );
}
