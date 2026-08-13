// Keyword-targeted local landing pages.
//
// These sit at the root of the site (e.g. /cash-for-cars-toowoomba) so the
// search term appears in the URL itself. Each page owns ONE primary keyword —
// keep the copy genuinely different between them, otherwise the pages compete
// with each other for the same result instead of ranking separately.

import type { Faq } from "@/data/faqs";
import type { PhotoKey } from "@/data/photos";

export type LocalPage = {
  /** Root-level URL slug — this is the keyword, hyphenated */
  slug: string;
  /** Area in `areas.ts` this page draws its suburb list from */
  areaSlug: string;
  /** The single search term this page is built to rank for */
  primaryKeyword: string;
  /** Real content dates used for WebPage schema and accurate sitemap hints */
  datePublished: string;
  dateModified: string;
  /** Anchor text for sitewide nav links — keep it exact-match on the keyword */
  navLabel: string;
  eyebrow: string;
  /** Split so the second half can carry the gradient treatment in the hero */
  h1Lead: string;
  h1Highlight: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  heroPhoto: PhotoKey;
  heroPhotoAlt: string;
  lede: string;
  /** Scannable, claim-safe details shown immediately after the hero */
  highlights: { label: string; value: string }[];
  /** Name used in the Service schema block */
  serviceName: string;
  serviceType: string[];
  sections: { heading: string; body: string }[];
  faqs: Faq[];
  /** Primary-source guidance that supports high-stakes paperwork content */
  officialLinks: { href: string; label: string; description: string }[];
  /** Contextual internal links — keep the anchor text keyword-bearing */
  related: { href: string; label: string }[];
};

export const localPages: LocalPage[] = [
  {
    slug: "cash-for-cars-toowoomba",
    areaSlug: "toowoomba",
    primaryKeyword: "cash for cars Toowoomba",
    datePublished: "2026-08-06",
    dateModified: "2026-08-13",
    navLabel: "Cash for cars Toowoomba",
    eyebrow: "Cash for cars · Toowoomba",
    h1Lead: "Cash for cars",
    h1Highlight: "Toowoomba",
    seoTitle: "Cash for Cars Toowoomba | Free Quote & Pickup",
    seoDescription:
      "Cash for cars in Toowoomba for old, damaged and non-running vehicles. Get a free quote, firm offer, payment before collection and free pickup.",
    keywords: [
      "cash for cars Toowoomba",
      "cash for cars toowoomba",
      "sell my car Toowoomba",
      "car buyers Toowoomba",
      "cash for junk cars Toowoomba",
      "cash for unwanted cars Toowoomba",
      "instant cash for cars Toowoomba",
      "sell damaged car Toowoomba",
    ],
    heroPhoto: "damaged",
    heroPhotoAlt: "Old damaged car ready to be valued and sold",
    lede:
      "Carbase buys cars throughout the Toowoomba Region. Send through the make, model, year and condition, and you get a firm offer — usually the same day — with payment before the car goes anywhere.",
    highlights: [
      { label: "Quote", value: "Free and no obligation" },
      { label: "Payment", value: "Bank transfer before pickup" },
      { label: "Collection", value: "Included in the offer" },
      { label: "Coverage", value: "Toowoomba Region only" },
    ],
    serviceName: "Cash for cars in Toowoomba",
    serviceType: ["Cash for cars", "Car buying", "Vehicle valuation"],
    sections: [
      {
        heading: "What a car is actually worth in Toowoomba",
        body: "Four things move the number: the make and model, the year and kilometres, the condition, and what the parts and metal are currently worth. A tidy runner with rego is valued on what it will resell for. A write-off or non-runner is valued on its salvageable parts and weight. Either way you get one figure that already includes pickup, so nothing is deducted later. If you would rather sanity-check the offer against the market first, do — there is no obligation attached to it.",
      },
      {
        heading: "The cars we pay cash for",
        body: "Sedans, hatches, SUVs, wagons, utes, vans, 4x4s and light trucks. Running or not, registered or long expired, roadworthy or written off. High-kilometre cars nobody wants to buy privately, hail-damaged and accident-damaged vehicles, mechanical failures that cost more to fix than the car is worth, and cars that have simply been sitting under a tarp for a few years. If you are unsure whether yours qualifies, send the details anyway — quotes are free.",
      },
      {
        heading: "How and when you get the money",
        body: "By bank transfer, on the spot, before the car is loaded. You watch the transfer leave our account while we are still standing there with you. We do not take a vehicle first and settle up afterwards, and we do not deduct a towing fee, an admin fee or a fuel levy from the agreed figure. What you accepted in writing is what arrives in your account.",
      },
      {
        heading: "Paperwork for a Queensland sale",
        body: "Bring photo ID and proof that the car is yours — usually the Queensland registration papers, a purchase receipt or another ownership record that identifies the vehicle. Safety-certificate and registration steps depend on whether the car is registered and how the sale is processed. Unregistered vehicles can be sold without a safety certificate, but Queensland still requires a signed paper trail. Tell us the registration status when you request a quote and we will confirm what needs to be ready before pickup.",
      },
    ],
    faqs: [
      {
        question: "How much cash can I get for my car in Toowoomba?",
        answer:
          "It depends on the make, model, year, kilometres and condition, plus what the parts and metal are currently worth. Rather than guess, send the details through the quote form — the offer is free, usually comes back the same day during business hours, and there is no obligation to accept it.",
      },
      {
        question: "Do you pay cash for cars that do not run?",
        answer:
          "Yes. Non-runners are a large part of what we buy. Flat battery, blown engine, seized gearbox, no wheels, sitting in a shed for five years — none of it rules the car out. It only affects how we get it onto the truck, which is our problem to solve, not yours.",
      },
      {
        question: "Is the cash offer firm, or does it change at pickup?",
        answer:
          "It is firm. The only time an offer changes is if the car turns out to be materially different from what was described — a missing engine that was not mentioned, for example. Describe it accurately and the figure you accepted is the figure you are paid.",
      },
      {
        question: "Can I sell a car in Toowoomba that is still under finance?",
        answer:
          "Often, yes. Get a payout figure from your lender and mention it in the quote form. If our offer covers the payout we can pay the lender directly and transfer the balance to you.",
      },
      {
        question: "Do you buy utes, 4WDs and light trucks in Toowoomba?",
        answer:
          "Yes. We quote work utes, dual-cabs, 4WDs, vans and light commercial vehicles as well as passenger cars. Include the vehicle's size, condition and exact pickup location so we can value it and plan the right collection equipment.",
      },
    ],
    officialLinks: [
      {
        href: "https://www.qld.gov.au/transport/registration/roadworthy",
        label: "Queensland safety certificate rules",
        description:
          "When a safety certificate is required and the exemptions that may apply.",
      },
      {
        href: "https://www.qld.gov.au/transport/buying/unregistered/selling",
        label: "Selling an unregistered vehicle",
        description:
          "The ownership record and signed paper trail Queensland asks sellers to keep.",
      },
      {
        href: "https://www.qld.gov.au/transport/registration/transfer/online",
        label: "Transferring Queensland registration",
        description:
          "Official seller steps for eligible registered vehicles.",
      },
    ],
    related: [
      { href: "/car-removal-toowoomba", label: "Free car removal in Toowoomba" },
      {
        href: "/service-areas",
        label: "Toowoomba suburbs we collect from",
      },
      { href: "/how-it-works", label: "How selling to Carbase works" },
    ],
  },
  {
    slug: "car-removal-toowoomba",
    areaSlug: "toowoomba",
    primaryKeyword: "car removal Toowoomba",
    datePublished: "2026-08-06",
    dateModified: "2026-08-13",
    navLabel: "Car removal Toowoomba",
    eyebrow: "Car removal · Toowoomba",
    h1Lead: "Car removal",
    h1Highlight: "Toowoomba",
    seoTitle: "Car Removal Toowoomba | Free Pickup & Quote",
    seoDescription:
      "Book free car removal in Toowoomba for scrap, unwanted and non-running vehicles. Get a quote, payment before pickup and no towing fee.",
    keywords: [
      "car removal Toowoomba",
      "car removal toowoomba",
      "free car removal Toowoomba",
      "junk car removal Toowoomba",
      "scrap car removal Toowoomba",
      "old car removal Toowoomba",
      "unwanted car removal Toowoomba",
      "car disposal Toowoomba",
    ],
    heroPhoto: "pickup",
    heroPhotoAlt: "Broken-down car ready to be loaded for vehicle removal",
    lede:
      "Carbase removes old, scrap and unwanted cars from anywhere within the Toowoomba Region at no charge. There is no towing fee to pay and nothing deducted from your offer — you are paid first, then we load the car and take it away.",
    highlights: [
      { label: "Pickup fee", value: "$0 across our service area" },
      { label: "Condition", value: "Running or non-running" },
      { label: "Payment", value: "Before the vehicle is loaded" },
      { label: "Coverage", value: "Toowoomba Region only" },
    ],
    serviceName: "Free car removal in Toowoomba",
    serviceType: ["Car removal", "Scrap car removal", "Vehicle towing"],
    sections: [
      {
        heading: "Car removal in Toowoomba with no towing fee",
        body: "Most people searching for car removal in Toowoomba are expecting to pay someone to take the car away. You do not. Removal is included, the truck and driver are our cost, and the amount we agreed is transferred to you before the car moves. There is no call-out charge for a vehicle elsewhere within the Toowoomba Region, and no extra added for a car that has to be winched rather than driven on.",
      },
      {
        heading: "What we will remove",
        body: "Scrap and junk cars, statutory and repairable write-offs, unregistered vehicles, insurance total-losses, cars stripped for parts, flood and hail-damaged vehicles, abandoned cars left on a property, and cars that simply failed one roadworthy too many. Sedans through to light trucks. Missing wheels, missing keys, missing engine — all workable. If a car has been sitting long enough to have grass growing through it, that is exactly the kind of job this service exists for.",
      },
      {
        heading: "What happens on removal day",
        body: "We agree a window that suits you and turn up with a tilt tray. You do not need to be there the whole time, but someone does need to be present to sign the transfer paperwork and confirm the transfer has landed. Have your photo ID and proof of ownership handy. Clear a path to the vehicle if you can, and let us know in advance if the car is behind a locked gate, down a steep drive, in a tight carport or on soft ground — it changes what equipment gets sent, and we would rather know before the truck leaves.",
      },
      {
        heading: "Before the truck arrives",
        body: "Take everything out of the car — glovebox, boot, under the seats, sun visors and the spare wheel well. Do not remove the plates until we confirm whether the registration will be transferred or cancelled. If the vehicle is being deregistered, Queensland requires the registered operator to complete the cancellation process and usually surrender the plates. A current registration may qualify for a partial refund after the cancellation fee.",
      },
      {
        heading: "Where the car ends up",
        body: "Nothing is dumped. Usable panels, engines, gearboxes and electronics are pulled for reuse, fluids and batteries are drained and handled separately, and the remaining shell is processed for scrap steel. It is a much cleaner outcome than leaving a vehicle to rust in a shed or back paddock on a Toowoomba Region property.",
      },
    ],
    faqs: [
      {
        question: "Is car removal in Toowoomba really free?",
        answer:
          "Yes. There is no towing fee, no call-out fee and no admin fee, and nothing is taken out of your offer to cover the truck. You are paid the agreed amount by bank transfer before the vehicle is loaded.",
      },
      {
        question: "Do you remove cars that are unregistered or have no plates?",
        answer:
          "Yes. Registration is not required for us to remove a car — we only need photo ID and proof that the vehicle is yours to sell. If it is unregistered, alternative proof of ownership is fine.",
      },
      {
        question: "Can you remove a car that will not start or has no wheels?",
        answer:
          "Yes. Our trucks are set up to winch and load vehicles that cannot be driven. Just tell us in the quote form what condition the car is in and where it is sitting so the right truck is sent out.",
      },
      {
        question: "How quickly can you remove a car in Toowoomba?",
        answer:
          "Quotes usually go out the same day during business hours. Once you accept, we arrange removal around your location and the available collection schedule.",
      },
      {
        question: "Do I have to be home when the car is removed?",
        answer:
          "Someone needs to be there to sign the transfer paperwork, hand over the keys if there are any, and confirm the payment has arrived. It only takes a few minutes, and we book a window that works around you.",
      },
      {
        question: "What happens to my number plates and registration?",
        answer:
          "That depends on whether the registered vehicle is transferred or deregistered. Keep the plates on until we confirm the sale paperwork. If the registration is being cancelled, the registered operator normally completes the Queensland cancellation form and surrenders the plates; TMR may refund part of a current registration after its fee.",
      },
    ],
    officialLinks: [
      {
        href: "https://www.qld.gov.au/transport/registration/cancel",
        label: "Cancelling Queensland registration",
        description:
          "Official forms, number-plate rules and information about possible refunds.",
      },
      {
        href: "https://www.qld.gov.au/transport/buying/unregistered/selling",
        label: "Selling an unregistered vehicle",
        description:
          "The details Queensland says to include in the sale record.",
      },
      {
        href: "https://www.qld.gov.au/transport/vehicle-safety/written-off-vehicles/notify",
        label: "Notifying TMR about a written-off vehicle",
        description:
          "What to do when an insurer has not already recorded a write-off.",
      },
    ],
    related: [
      { href: "/cash-for-cars-toowoomba", label: "Cash for cars in Toowoomba" },
      {
        href: "/service-areas",
        label: "Toowoomba suburbs we collect from",
      },
      { href: "/faq", label: "Common questions about selling" },
    ],
  },
];

export function getLocalPage(slug: string): LocalPage | undefined {
  return localPages.find((page) => page.slug === slug);
}

/**
 * Same lookup, but for the hard-coded routes that are guaranteed to exist —
 * a missing slug is a data bug, so fail the build rather than the request.
 */
export function requireLocalPage(slug: string): LocalPage {
  const page = getLocalPage(slug);
  if (!page) throw new Error(`No local landing page defined for "${slug}"`);
  return page;
}

/** Landing pages tied to a given service area, for cross-linking */
export function localPagesForArea(areaSlug: string): LocalPage[] {
  return localPages.filter((page) => page.areaSlug === areaSlug);
}
