// ─────────────────────────────────────────────────────────────────────────
//  EDIT YOUR REAL BUSINESS DETAILS HERE.
//  The whole site (header, footer, contact buttons, SEO tags, emails)
//  reads from this one file — update it here and it changes everywhere.
//  Values marked PLACEHOLDER must be replaced before launch.
// ─────────────────────────────────────────────────────────────────────────

export const site = {
  name: "Carbase",
  legalName: "Carbase", // shown in the footer, e.g. "Carbase Pty Ltd"
  tagline: "Cash for old, damaged and junk cars across South East Queensland",
  description:
    "Carbase buys old, damaged, unwanted and junk cars across Brisbane and the Gold Coast. Free quote, free pickup and payment before collection.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://carbase.com.au",

  phone: "0400 000 000", // PLACEHOLDER — your real mobile/landline
  email: "quotes@carbase.com.au", // PLACEHOLDER — your real inbox
  hours: "7 days, 7am – 7pm", // PLACEHOLDER — your real hours
  abn: "ABN 00 000 000 000", // PLACEHOLDER — your ABN

  serviceRegion: "Brisbane, Gold Coast & South East Queensland",
} as const;

/** tel: link built from the display phone number */
export const telHref = `tel:${site.phone.replace(/[^+\d]/g, "")}`;
