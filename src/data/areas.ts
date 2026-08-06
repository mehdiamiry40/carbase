import type { Faq } from "@/data/faqs";

export type Area = {
  slug: string;
  name: string;
  /** Short label used on cards and in the footer */
  short: string;
  intro: string;
  suburbs: string[];
  /** Regional Council towns and communities covered outside the city */
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
    slug: "toowoomba",
    name: "Toowoomba",
    short: "Toowoomba",
    intro:
      "Carbase serves the Toowoomba Region only — from the city and every suburb on the range to the rural towns within the Regional Council boundary. See where we collect and what to expect when you sell us a car.",
    heroEyebrow: "Service area · Toowoomba",
    heroTitleLead: "Vehicle collection across",
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
      "Meringandan",
      "Meringandan West",
      "Cambooya",
      "Wyreema",
      "Charlton",
      "Oakey",
      "Jondaryan",
      "Pittsworth",
      "Crows Nest",
      "Hodgson Vale",
      "Goombungee",
      "Hampton",
      "Cooyar",
      "Yarraman",
      "Greenmount",
      "Nobby",
      "Clifton",
      "Millmerran",
      "Cecil Plains",
    ],
    seoTitle: "Toowoomba Region Service Area | Carbase",
    seoDescription:
      "Carbase buys cars across the Toowoomba Region, from the city and Rangeville to Highfields, Oakey, Pittsworth and Millmerran. Check our coverage and get a free quote.",
    keywords: [
      "Toowoomba Region service area",
      "vehicle collection Toowoomba Region",
      "Toowoomba suburbs",
      "Toowoomba regional towns",
    ],
    seoSections: [
      {
        heading: "The Toowoomba Region, suburb by suburb",
        body: "Carbase focuses exclusively on the Toowoomba Region. We collect from Rangeville, Middle Ridge, Wilsonton, Harristown, Glenvale and Centenary Heights, and from regional communities including Highfields, Westbrook, Oakey, Pittsworth, Crows Nest and Millmerran. The coverage list below follows the Toowoomba Regional Council area.",
      },
      {
        heading: "One team for the whole sale",
        body: "The same people who quote your car are the ones who turn up to collect it. That means no third-party towing contractor, no handover between call centres and no renegotiation on the driveway. You get a firm figure up front, a collection time that suits you, and the money in your account before the car is loaded.",
      },
      {
        heading: "Selling from a rural block or acreage",
        body: "Plenty of cars on rural Toowoomba Region properties have been sitting in a shed or back paddock for years. Flat tyres, no battery, no rego, half-dismantled — none of that stops us. Tell us roughly where the vehicle sits and how much room there is to get a truck in, and we will let you know what is possible when we send the quote.",
      },
    ],
    faqs: [
      {
        question: "Is Carbase only available in the Toowoomba Region?",
        answer:
          "Yes. Carbase serves the Toowoomba Region only. That includes Toowoomba city and suburbs plus Regional Council communities such as Highfields, Oakey, Pittsworth, Crows Nest, Clifton and Millmerran. Pickup is included within this service area.",
      },
      {
        question: "Which Toowoomba suburbs do you collect from?",
        answer:
          "We cover Toowoomba city and suburbs including Rangeville, Newtown, Wilsonton, Harristown, Glenvale, Middle Ridge, Kearneys Spring and Drayton, plus Toowoomba Region towns such as Highfields, Westbrook, Oakey, Pittsworth, Crows Nest, Clifton and Millmerran.",
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
