import type { Faq } from "@/data/faqs";

export type Area = {
  slug: string;
  name: string;
  /** Short label used on cards and in the footer */
  short: string;
  intro: string;
  suburbs: string[];
  /** Surrounding towns we also cover — picks up long-tail "near me" searches */
  nearby?: string[];
  /**
   * Optional hero overrides. Used when an area has its own dedicated keyword
   * landing pages — the area page then plays a supporting, coverage-focused
   * role, so its H1 must not repeat the keyword those pages are targeting.
   */
  heroEyebrow?: string;
  heroTitleLead?: string;
  /** Optional SEO overrides for the area landing page */
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
  /** Extra on-page sections that strengthen local search intent */
  seoSections?: { heading: string; body: string }[];
  /** Area-specific questions, rendered on the page and as FAQPage schema */
  faqs?: Faq[];
};

export const areas: Area[] = [
  {
    slug: "brisbane",
    name: "Brisbane",
    short: "Brisbane",
    intro:
      "From the CBD out to the bayside, we buy old, damaged and unwanted cars across Brisbane. Tell us about your car and we will usually prepare a quote the same day during business hours, then arrange pickup around a suitable collection time.",
    suburbs: [
      "Brisbane CBD",
      "Fortitude Valley",
      "South Brisbane",
      "Chermside",
      "Carindale",
      "Mount Gravatt",
      "Indooroopilly",
      "Wynnum",
      "Sunnybank",
      "Stafford",
      "Toowong",
      "Salisbury",
    ],
  },
  {
    slug: "gold-coast",
    name: "the Gold Coast",
    short: "Gold Coast",
    intro:
      "We buy old, damaged and junk cars right along the coast, from Coomera down to Coolangatta. Wherever you are on the Gold Coast, we come to you — home, work or anywhere that suits.",
    suburbs: [
      "Southport",
      "Surfers Paradise",
      "Broadbeach",
      "Robina",
      "Nerang",
      "Burleigh Heads",
      "Coomera",
      "Helensvale",
      "Palm Beach",
      "Coolangatta",
      "Ashmore",
      "Mudgeeraba",
    ],
  },
  {
    slug: "logan",
    name: "Logan",
    short: "Logan",
    intro:
      "Sitting right between Brisbane and the Gold Coast, Logan is home turf for us. We're often in the area, so pickups can usually be arranged fast.",
    suburbs: [
      "Springwood",
      "Underwood",
      "Beenleigh",
      "Shailer Park",
      "Logan Central",
      "Browns Plains",
      "Marsden",
      "Loganholme",
    ],
  },
  {
    slug: "ipswich",
    name: "Ipswich",
    short: "Ipswich",
    intro:
      "We buy old, damaged and unwanted cars across Ipswich and the western corridor, including the fast-growing Springfield area. Free pickup applies, same as everywhere we operate.",
    suburbs: [
      "Ipswich Central",
      "Springfield",
      "Springfield Lakes",
      "Goodna",
      "Booval",
      "Redbank Plains",
      "Ripley",
      "Brassall",
    ],
  },
  {
    slug: "redlands",
    name: "the Redlands",
    short: "Redlands",
    intro:
      "From Capalaba to Cleveland and down to Redland Bay, we collect old, damaged and unwanted cars across the whole Redlands coast. Selling your car here is as easy as anywhere in Brisbane.",
    suburbs: [
      "Capalaba",
      "Cleveland",
      "Victoria Point",
      "Redland Bay",
      "Alexandra Hills",
      "Birkdale",
      "Wellington Point",
      "Thornlands",
    ],
  },
  {
    slug: "moreton-bay",
    name: "Moreton Bay",
    short: "Moreton Bay",
    intro:
      "We service the whole Moreton Bay region on Brisbane's northside — from North Lakes and Redcliffe up to Caboolture — with the same free pickup and on-the-spot payment.",
    suburbs: [
      "North Lakes",
      "Redcliffe",
      "Caboolture",
      "Strathpine",
      "Kallangur",
      "Morayfield",
      "Deception Bay",
      "Petrie",
    ],
  },
  {
    slug: "toowoomba",
    name: "Toowoomba",
    short: "Toowoomba",
    intro:
      "Carbase covers Toowoomba and the wider Darling Downs — the CBD, every suburb on the range, and the towns beyond it. Here is where we collect from, how far out we travel, and what to expect when you sell us a car up here.",
    heroEyebrow: "Service area · Toowoomba",
    heroTitleLead: "Car buyers across",
    suburbs: [
      "Toowoomba City",
      "Newtown",
      "Rangeville",
      "Middle Ridge",
      "Wilsonton",
      "Harristown",
      "Kearneys Spring",
      "Darling Heights",
      "Glenvale",
      "Centenary Heights",
      "Drayton",
      "Mount Lofty",
      "North Toowoomba",
      "South Toowoomba",
      "East Toowoomba",
      "Harlaxton",
      "Rockville",
      "Cranley",
      "Wilsonton Heights",
      "Torrington",
      "Wellcamp",
    ],
    nearby: [
      "Highfields",
      "Westbrook",
      "Gowrie Junction",
      "Kingsthorpe",
      "Kleinton",
      "Cabarlah",
      "Withcott",
      "Meringandan West",
      "Cambooya",
      "Wyreema",
      "Oakey",
      "Jondaryan",
      "Pittsworth",
      "Crows Nest",
      "Hodgson Vale",
    ],
    seoTitle: "Car Buyers Toowoomba — Suburbs We Cover",
    seoDescription:
      "Carbase buys cars right across Toowoomba and the Darling Downs, from the CBD and Rangeville out to Highfields, Oakey and Pittsworth. See the suburbs we cover, then get a free quote with free pickup.",
    keywords: [
      "car buyers Toowoomba",
      "sell my car Toowoomba",
      "we buy cars Toowoomba",
      "car removal Darling Downs",
      "cash for cars Toowoomba suburbs",
      "scrap car buyers Toowoomba",
    ],
    seoSections: [
      {
        heading: "Toowoomba and the Darling Downs, suburb by suburb",
        body: "Carbase covers the whole Toowoomba region rather than just the CBD. We regularly collect from Rangeville, Middle Ridge, Wilsonton, Harristown, Glenvale and Centenary Heights, and we head out to Highfields, Westbrook, Withcott, Oakey, Pittsworth and Crows Nest just as readily. If your suburb is not listed below, ask anyway — the range is a guide, not a boundary.",
      },
      {
        heading: "One team for the whole sale",
        body: "The same people who quote your car are the ones who turn up to collect it. That means no third-party towing contractor, no handover between call centres and no renegotiation on the driveway. You get a firm figure up front, a collection time that suits you, and the money in your account before the car is loaded.",
      },
      {
        heading: "Selling from a rural block or acreage",
        body: "Plenty of cars on the Downs have been sitting in a shed or back paddock for years. Flat tyres, no battery, no rego, half-dismantled — none of that stops us. Tell us roughly where the vehicle sits and how much room there is to get a truck in, and we will let you know what is possible when we send the quote.",
      },
    ],
    faqs: [
      {
        question: "Do you charge to come out to Toowoomba from Brisbane?",
        answer:
          "No. Pickup is free everywhere we operate, and that includes Toowoomba and the surrounding Darling Downs towns. The travel is our cost, not yours — the figure we quote is the figure that lands in your account.",
      },
      {
        question: "Which Toowoomba suburbs do you collect from?",
        answer:
          "All of them. We are in Rangeville, Newtown, Wilsonton, Harristown, Glenvale, Middle Ridge, Kearneys Spring, Drayton and the CBD most often, and we also cover Highfields, Westbrook, Gowrie Junction, Withcott, Cambooya, Oakey, Pittsworth and Crows Nest.",
      },
      {
        question: "How long does it take to get a car collected in Toowoomba?",
        answer:
          "Most Toowoomba quotes go out the same day during business hours. Once you accept, we arrange collection around your location and the available schedule.",
      },
    ],
  },
];

export function getArea(slug: string): Area | undefined {
  return areas.find((a) => a.slug === slug);
}
