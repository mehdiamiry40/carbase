"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import type { Faq } from "@/data/faqs";

/** Smoothly animated FAQ accordion. */
export function Accordion({
  items,
  defaultOpen = 0,
}: {
  items: Faq[];
  defaultOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div className="divide-y divide-slate-200/80 rounded-3xl border border-slate-200/80 bg-white shadow-card">
      {items.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={faq.question}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left sm:px-8"
            >
              <span className="font-display text-[15px] font-semibold text-slate-900 sm:text-base">
                {faq.question}
              </span>
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                  isOpen
                    ? "rotate-180 border-brand-200 bg-brand-50 text-brand-600"
                    : "border-slate-200 text-slate-400"
                }`}
              >
                <ChevronDownIcon className="size-4" />
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 text-[15px] leading-relaxed text-slate-600 sm:px-8">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
