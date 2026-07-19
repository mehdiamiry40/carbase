import type { Metadata } from "next";
import { faqs } from "@/data/faqs";
import { Reveal } from "@/components/Reveal";
import { CtaBanner, FaqList, PageHero } from "@/components/sections";

export const metadata: Metadata = {
  title: "FAQ — Selling Your Car to Carbase",
  description:
    "Answers to the questions we hear most: what cars we buy, how fast you're paid, what paperwork you need, cars under finance and more.",
};

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
