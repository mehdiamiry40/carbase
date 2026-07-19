export type Area = {
  slug: string;
  name: string;
  /** Short label used on cards and in the footer */
  short: string;
  intro: string;
  suburbs: string[];
};

export const areas: Area[] = [
  {
    slug: "brisbane",
    name: "Brisbane",
    short: "Brisbane",
    intro:
      "From the CBD out to the bayside, our team covers every corner of Brisbane. Tell us about your car in the morning and in most cases we can inspect, pay and collect it the same day.",
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
      "We buy cars right along the coast, from Coomera down to Coolangatta. Wherever you are on the Gold Coast, we come to you — home, work or anywhere that suits.",
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
      "We buy cars across Ipswich and the western corridor, including the fast-growing Springfield area. Free pickup applies, same as everywhere we operate.",
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
      "From Capalaba to Cleveland and down to Redland Bay, we cover the whole Redlands coast. Selling a car here is as easy as anywhere in Brisbane.",
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
];

export function getArea(slug: string): Area | undefined {
  return areas.find((a) => a.slug === slug);
}
