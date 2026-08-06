// Verified business details used throughout the site. Keep display values and
// their machine-readable counterparts in sync when the business changes them.

export const site = {
  name: "Carbase",
  legalName: "Emir Group Pty Ltd",
  tagline: "Cash for old, damaged and junk cars across South East Queensland",
  description:
    "Carbase buys old, damaged, unwanted and junk cars across Brisbane, the Gold Coast and Toowoomba. Free quote, free car removal and payment before collection.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://carbase.com.au",

  phone: "0410 233 335",
  hours: "8am–5pm, 7 days a week",
  abn: "62 351 619 456",

  // Machine-readable version of `hours`, used for opening-hours structured
  // data. The business has no public street address, so none is configured or
  // emitted in structured data.
  opens: "08:00",
  closes: "17:00",

  serviceRegion: "Brisbane, Gold Coast, Toowoomba & SEQ",
} as const;

/** tel: link built from the display phone number */
export const telHref = `tel:${site.phone.replace(/[^+\d]/g, "")}`;
