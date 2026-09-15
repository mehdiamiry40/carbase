import type { Faq } from "@/data/faqs";

export type Area = {
  slug: string;
  name: string;
  /** Short label used on cards and in the footer */
  short: string;
  intro: string;
  suburbs: string[];
  /** Outer City Council suburbs covered beyond the inner and middle ring */
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
      "Carbase serves Brisbane only — from the CBD and inner suburbs out to the edges of the Brisbane City Council boundary. See where we collect and what to expect when you sell us a car.",
    heroEyebrow: "Service area · Brisbane",
    heroTitleLead: "Vehicle collection across",
    suburbs: [
      "Brisbane City",
      "Fortitude Valley",
      "South Brisbane",
      "West End",
      "Woolloongabba",
      "Kangaroo Point",
      "New Farm",
      "Newstead",
      "Bowen Hills",
      "Spring Hill",
      "Milton",
      "Paddington",
      "Toowong",
      "St Lucia",
      "Indooroopilly",
      "Ashgrove",
      "Mitchelton",
      "Chermside",
      "Nundah",
      "Coorparoo",
      "Carindale",
      "Mount Gravatt",
      "Sunnybank",
      "Moorooka",
    ],
    nearby: [
      "Bracken Ridge",
      "Bald Hills",
      "Sandgate",
      "Brighton",
      "Taigum",
      "Fitzgibbon",
      "Bridgeman Downs",
      "McDowall",
      "Ferny Grove",
      "The Gap",
      "Moggill",
      "Bellbowrie",
      "Anstead",
      "Pullenvale",
      "Brookfield",
      "Karana Downs",
      "Mount Crosby",
      "Forest Lake",
      "Calamvale",
      "Parkinson",
      "Drewvale",
      "Rochedale",
      "Burbank",
      "Gumdale",
      "Wakerley",
      "Wynnum",
      "Manly",
    ],
    seoTitle: "Brisbane Service Area | Carbase",
    seoDescription:
      "Carbase buys cars across Brisbane, from the CBD and Toowong to Chermside, Carindale, Sunnybank, Forest Lake and Wynnum. Check our coverage and get a free quote.",
    keywords: [
      "Brisbane service area",
      "vehicle collection Brisbane",
      "Brisbane suburbs",
      "Brisbane northside and southside",
    ],
    seoSections: [
      {
        heading: "Brisbane, suburb by suburb",
        body: "Carbase focuses exclusively on Brisbane. We collect from Toowong, Indooroopilly, Ashgrove, Chermside, Nundah, Coorparoo, Carindale and Sunnybank, and from outer suburbs including Bracken Ridge, The Gap, Moggill, Forest Lake, Calamvale and Wynnum. The coverage list below follows the Brisbane City Council area.",
      },
      {
        heading: "One team for the whole sale",
        body: "The same people who quote your car are the ones who turn up to collect it. That means no third-party towing contractor, no handover between call centres and no renegotiation on the driveway. You get a firm figure up front, a collection time that suits you, and the money in your account before the car is loaded.",
      },
      {
        heading: "Tight driveways, unit blocks and acreage",
        body: "Brisbane throws up every kind of access problem: a basement car park with a low clearance bar, a narrow inner-city street with no room for a tilt tray, a steep Paddington driveway, or a car that has sat in a shed on an acreage block out at Moggill or Brookfield for years. Flat tyres, no battery, no rego, half-dismantled — none of that stops us. Tell us roughly where the vehicle sits and how much room there is to get a truck in, and we will let you know what is possible when we send the quote.",
      },
    ],
    faqs: [
      {
        question: "Is Carbase only available in Brisbane?",
        answer:
          "Yes. Carbase serves Brisbane only. That includes the CBD and inner suburbs plus outer suburbs within the Brisbane City Council area such as Bracken Ridge, The Gap, Moggill, Forest Lake, Calamvale and Wynnum. Pickup is included within this service area.",
      },
      {
        question: "Which Brisbane suburbs do you collect from?",
        answer:
          "We cover the Brisbane CBD and suburbs including Fortitude Valley, West End, Toowong, Indooroopilly, Ashgrove, Chermside, Nundah, Coorparoo, Carindale and Sunnybank, plus outer suburbs such as Bracken Ridge, The Gap, Moggill, Forest Lake, Calamvale, Rochedale and Wynnum.",
      },
      {
        question: "How long does it take to get a car collected in Brisbane?",
        answer:
          "Most Brisbane quotes go out the same day during business hours. Once you accept, we arrange collection around your location and the available schedule.",
      },
    ],
  },
];

export function getArea(slug: string): Area | undefined {
  return areas.find((a) => a.slug === slug);
}
