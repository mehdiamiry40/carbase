"use client";

import { useEffect } from "react";
import { GoogleAnalytics, sendGAEvent } from "@next/third-parties/google";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function trackQuoteSubmission() {
  if (!measurementId) return;

  sendGAEvent("event", "generate_lead", {
    form_name: "vehicle_quote",
  });
}

export function SiteAnalytics({ nonce }: { nonce?: string }) {
  useEffect(() => {
    if (!measurementId) return;

    function trackPhoneClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest('a[href^="tel:"]')) return;

      sendGAEvent("event", "phone_click", {
        contact_method: "phone",
      });
    }

    document.addEventListener("click", trackPhoneClick);
    return () => document.removeEventListener("click", trackPhoneClick);
  }, []);

  if (!measurementId) return null;

  return <GoogleAnalytics gaId={measurementId} nonce={nonce} />;
}
