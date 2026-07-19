import type { Metadata } from "next";
import { faqs } from "@/data/faqs";
import { CtaBanner, FaqList, SectionHeading } from "@/components/sections";

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
      <section className="bg-linear-to-b from-brand-50 to-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently asked questions"
            lede="Everything sellers usually want to know. Can't find your answer? Just call — we're happy to talk it through."
          />
          <div className="mt-10">
            <FaqList />
          </div>
        </div>
      </section>
      <CtaBanner title="Still thinking it over?" subtitle="A quote is free and doesn't commit you to anything — find out what your car is worth today." />
    </>
  );
}
