// Keyword-targeted local landing pages.
//
// These sit at the root of the site (e.g. /cash-for-cars-toowoomba) so the
// search term appears in the URL itself. Each page owns ONE primary keyword —
// keep the copy genuinely different between them, otherwise the pages compete
// with each other for the same result instead of ranking separately.

import type { Faq } from "@/data/faqs";

export type LocalPage = {
  /** Root-level URL slug — this is the keyword, hyphenated */
  slug: string;
  /** Area in `areas.ts` this page draws its suburb list from */
  areaSlug: string;
  /** The single search term this page is built to rank for */
  primaryKeyword: string;
  /** Anchor text for sitewide nav links — keep it exact-match on the keyword */
  navLabel: string;
  eyebrow: string;
  /** Split so the second half can carry the gradient treatment in the hero */
  h1Lead: string;
  h1Highlight: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  lede: string;
  /** Name used in the Service schema block */
  serviceName: string;
  serviceType: string[];
  sections: { heading: string; body: string }[];
  faqs: Faq[];
  /** Contextual internal links — keep the anchor text keyword-bearing */
  related: { href: string; label: string }[];
};

export const localPages: LocalPage[] = [
  {
    slug: "cash-for-cars-toowoomba",
    areaSlug: "toowoomba",
    primaryKeyword: "cash for cars Toowoomba",
    navLabel: "Cash for cars Toowoomba",
    eyebrow: "Cash for cars · Toowoomba",
    h1Lead: "Cash for cars in",
    h1Highlight: "Toowoomba",
    seoTitle: "Cash for Cars Toowoomba, Paid Before Pickup",
    seoDescription:
      "Cash for cars in Toowoomba — Carbase makes a firm offer on old, damaged and non-running vehicles, pays by bank transfer before pickup, and collects for free.",
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
    lede:
      "Carbase pays cash for cars across Toowoomba and the Darling Downs. Send through the make, model, year and condition, and you get a firm offer — usually the same day — with free pickup and payment before the car goes anywhere.",
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
        body: "Bring photo ID and something showing the car is yours — usually the Queensland registration papers. If it is unregistered, other proof of ownership is fine. You will not need a roadworthy certificate, because you are selling to a business rather than a private buyer. Remember to remove your plates and cancel the registration with TMR afterwards to stop the rego clock running. We fill in the transfer paperwork with you at pickup; it takes about five minutes.",
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
    ],
    related: [
      { href: "/car-removal-toowoomba", label: "Free car removal in Toowoomba" },
      {
        href: "/service-areas/toowoomba",
        label: "Toowoomba suburbs we collect from",
      },
      { href: "/how-it-works", label: "How selling to Carbase works" },
    ],
  },
  {
    slug: "car-removal-toowoomba",
    areaSlug: "toowoomba",
    primaryKeyword: "car removal Toowoomba",
    navLabel: "Car removal Toowoomba",
    eyebrow: "Car removal · Toowoomba",
    h1Lead: "Free car removal in",
    h1Highlight: "Toowoomba",
    seoTitle: "Free Car Removal Toowoomba, No Towing Fees",
    seoDescription:
      "Free car removal in Toowoomba for scrap, junk, unregistered and non-running cars. No towing fee, no admin charges — we pay you first, then tow the car away.",
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
    lede:
      "Carbase removes old, scrap and unwanted cars from anywhere in Toowoomba at no charge. There is no towing fee to pay and nothing deducted from your offer — you are paid first, then we load the car and take it away.",
    serviceName: "Free car removal in Toowoomba",
    serviceType: ["Car removal", "Scrap car removal", "Vehicle towing"],
    sections: [
      {
        heading: "Car removal in Toowoomba with no towing fee",
        body: "Most people searching for car removal in Toowoomba are expecting to pay someone to take the car away. You do not. Removal is included, the truck and driver are our cost, and the amount we agreed is transferred to you before the car moves. There is no call-out charge if the vehicle is further out on the Downs, and no extra added for a car that has to be winched rather than driven on.",
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
        body: "Take everything out of the car — glovebox, boot, under the seats, sun visors and the spare wheel well. Removed cars are dismantled, so anything left behind is gone for good. Take your plates off as well; you will need them to cancel the registration with the Queensland Department of Transport and Main Roads, and cancelling promptly is what stops you being billed for rego on a car you no longer own. You can also claim a refund on any unused registration once it is cancelled.",
      },
      {
        heading: "Where the car ends up",
        body: "Nothing is dumped. Usable panels, engines, gearboxes and electronics are pulled for reuse, fluids and batteries are drained and handled separately, and the remaining shell is processed for scrap steel. It is a much cleaner outcome than a car slowly rusting into a back paddock, which is where a lot of Darling Downs vehicles end up by default.",
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
    ],
    related: [
      { href: "/cash-for-cars-toowoomba", label: "Cash for cars in Toowoomba" },
      {
        href: "/service-areas/toowoomba",
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
