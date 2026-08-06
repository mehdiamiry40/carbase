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
    "Carbase buys old, damaged, unwanted and junk cars across Brisbane, the Gold Coast and Toowoomba. Free quote, free car removal and payment before collection.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://carbase.com.au",

  phone: "0400 000 000", // PLACEHOLDER — your real mobile/landline
  email: "quotes@carbase.com.au", // PLACEHOLDER — your real inbox
  hours: "7 days, 7am – 7pm", // PLACEHOLDER — your real hours
  abn: "ABN 00 000 000 000", // PLACEHOLDER — your ABN

  // Machine-readable version of `hours`, used for opening-hours structured
  // data. Keep these two in sync — Google treats a mismatch between what the
  // page says and what the schema says as a quality signal against you.
  opens: "07:00", // PLACEHOLDER
  closes: "19:00", // PLACEHOLDER

  // Region the business trades in. There is no shopfront address to publish,
  // so structured data carries the state only — never invent a street address
  // for a LocalBusiness, it is a fast way to lose a Google Business listing.
  addressRegion: "QLD",
  addressCountry: "AU",

  serviceRegion: "Brisbane, Gold Coast, Toowoomba & SEQ",
} as const;

/** tel: link built from the display phone number */
export const telHref = `tel:${site.phone.replace(/[^+\d]/g, "")}`;
