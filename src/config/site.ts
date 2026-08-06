// Verified business details used throughout the site. Keep display values and
// their machine-readable counterparts in sync when the business changes them.

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://carbase.au"
).replace(/\/+$/, "");

export const site = {
  name: "Carbase",
  legalName: "Emir Group Pty Ltd",
  tagline: "Cash for old, damaged and unwanted cars across the Toowoomba Region",
  description:
    "Carbase buys old, damaged, non-running and unwanted cars throughout the Toowoomba Region. Get a free quote, free car removal and payment before collection.",
  url: siteUrl,

  phone: "0410 233 335",
  hours: "8am–5pm, 7 days a week",
  abn: "62 351 619 456",

  // Machine-readable version of `hours`, used for opening-hours structured
  // data. The business has no public street address, so none is configured or
  // emitted in structured data.
  opens: "08:00",
  closes: "17:00",

  serviceRegion: "Toowoomba Region",
} as const;

/** tel: link built from the display phone number */
export const telHref = `tel:${site.phone.replace(/[^+\d]/g, "")}`;
