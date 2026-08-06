export type Area = {
  slug: string;
  name: string;
  /** Short label used on cards and in the footer */
  short: string;
  intro: string;
  suburbs: string[];
  /** Optional SEO overrides for the area landing page */
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
  /** Extra on-page sections that strengthen local search intent */
  seoSections?: { heading: string; body: string }[];
};

export const areas: Area[] = [
  {
    slug: "brisbane",
    name: "Brisbane",
    short: "Brisbane",
    intro:
      "From the CBD out to the bayside, we buy old, damaged and unwanted cars across Brisbane. Tell us about your car in the morning and in most cases we can inspect, pay and collect it the same day.",
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
      "Looking for cash for cars Toowoomba locals can trust? Carbase buys old, damaged, unwanted and non-running vehicles across Toowoomba and the Darling Downs — with free car removal, a clear cash offer and payment before we take the car.",
    suburbs: [
      "Toowoomba CBD",
      "Newtown",
      "Rangeville",
      "Middle Ridge",
      "Wilsonton",
      "Harristown",
      "Kearneys Spring",
      "Darling Heights",
      "Highfields",
      "Glenvale",
      "Centenary Heights",
      "Drayton",
    ],
    seoTitle: "Cash for Cars Toowoomba & Free Car Removal",
    seoDescription:
      "Cash for cars Toowoomba and free car removal Toowoomba with Carbase. We buy old, damaged and junk cars across Toowoomba and surrounds — free quote, free pickup and payment before collection.",
    keywords: [
      "cash for cars toowoomba",
      "car removal toowoomba",
      "cash for cars Toowoomba",
      "car removal Toowoomba",
      "sell my car Toowoomba",
      "junk car removal Toowoomba",
      "free car removal Toowoomba",
      "cash for junk cars Toowoomba",
    ],
    seoSections: [
      {
        heading: "Cash for cars Toowoomba — any condition",
        body: "Whether your car still drives or has been sitting for months, Carbase pays cash for cars in Toowoomba in almost every condition. Old sedans, damaged utes, written-off SUVs, unregistered vehicles and non-runners are all welcome. Tell us the make, model, year and condition for a free no-obligation quote — no roadworthy certificate required.",
      },
      {
        heading: "Free car removal across Toowoomba",
        body: "Need car removal in Toowoomba without towing fees? We collect from your home, workplace or roadside across Toowoomba and nearby suburbs. With free car removal, you keep the agreed cash amount — paid before the vehicle leaves — with no admin fees, no surprise deductions and no waiting around for a private buyer.",
      },
      {
        heading: "Sell your car fast across the Darling Downs",
        body: "From the CBD and Rangeville through to Highfields, Glenvale and Drayton, we make selling a car in Toowoomba simple. Most quotes go out the same day during business hours, and collection can often be arranged quickly once you accept. Whether you need cash for cars or reliable car removal in Toowoomba, start with a free quote and we will handle the rest.",
      },
    ],
  },
];

export function getArea(slug: string): Area | undefined {
  return areas.find((a) => a.slug === slug);
}
