// Verified business details used throughout the site. Keep display values and
// their machine-readable counterparts in sync when the business changes them.

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://carbase.au"
).replace(/\/+$/, "");

export const site = {
  name: "Carbase",
  operatorName: "Emir Group",
  operatingBase: "Brisbane, Queensland",
  tagline: "Cash for old, damaged and unwanted cars across Brisbane",
  description:
    "Carbase buys old, damaged, non-running and unwanted cars throughout Brisbane. Get a free quote, free car removal and payment before collection.",
  url: siteUrl,

  phone: "0494 434 509",
  phoneInternational: "+61 494 434 509",
  hours: "8am–5pm, 7 days a week",
  abn: "62 351 619 456",

  // Machine-readable version of `hours`, used for opening-hours structured
  // data. Emir Group operates from Brisbane as a service-area business, but
  // has no customer-facing public street address, so none is configured or
  // emitted in structured data.
  opens: "08:00",
  closes: "17:00",

  serviceRegion: "Brisbane",
} as const;

/** tel: link built from the display phone number */
export const telHref = `tel:${site.phoneInternational.replace(/[^+\d]/g, "")}`;
