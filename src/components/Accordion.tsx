"use client";

import { useId, useState } from "react";
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
  const accordionId = useId();

  return (
    <div className="divide-y divide-brand-200 border-y border-brand-200 bg-transparent">
      {items.map((faq, i) => {
        const isOpen = open === i;
        const buttonId = `${accordionId}-button-${i}`;
        const panelId = `${accordionId}-panel-${i}`;
        return (
          <div key={faq.question}>
            <button
              type="button"
              id={buttonId}
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-display text-lg font-semibold text-ink-900">
                {faq.question}
              </span>
              <span
                className={`flex size-8 shrink-0 items-center justify-center border transition-all duration-200 ${
                  isOpen
                    ? "rotate-180 border-brand-200 bg-brand-50 text-brand-600"
                    : "border-slate-200 text-slate-400"
                }`}
              >
                <ChevronDownIcon className="size-4" />
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-3xl pb-6 pr-12 text-[15px] leading-relaxed text-slate-600">
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
