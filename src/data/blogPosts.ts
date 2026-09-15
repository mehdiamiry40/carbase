import type { PhotoKey } from "@/data/photos";

export type BlogSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
  points?: readonly string[];
  note?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishedOn: string;
  updatedOn: string;
  photoName: PhotoKey;
  photoAlt: string;
  takeaway: string;
  sections: readonly BlogSection[];
};

export const blogPosts: readonly BlogPost[] = [
  {
    slug: "what-affects-unwanted-car-value",
    title: "What Affects the Value of an Unwanted Car?",
    excerpt:
      "A practical look at the vehicle, condition and collection details that can shape an offer for an old or unwanted car.",
    category: "Selling guide",
    readTime: "5 min read",
    publishedOn: "2026-08-22",
    updatedOn: "2026-08-22",
    photoName: "junkyard",
    photoAlt: "Damaged and unwanted cars stored in an automotive yard",
    takeaway:
      "An unwanted car is valued as a complete vehicle, not by age alone. Accurate details about its identity, condition, completeness and location make an offer more useful.",
    sections: [
      {
        id: "vehicle-details",
        title: "Start with the vehicle itself",
        paragraphs: [
          "Make, model, year and variant establish what the car is. Two vehicles that look similar can use different engines, transmissions and equipment, so the exact badge or variant can matter.",
          "If you are unsure, check the registration papers, compliance plate or owner handbook before requesting a quote. A registration number or VIN can also help a buyer identify the vehicle correctly, but only share those details through a trusted quote process.",
        ],
        points: [
          "Make, model, year and body style",
          "Engine and transmission type, if known",
          "Odometer reading",
          "Registration status",
        ],
      },
      {
        id: "condition",
        title: "Condition is more than whether it starts",
        paragraphs: [
          "A non-running car is not automatically worth less than every running car. The cause of the fault, accident damage, corrosion, missing parts and the overall state of the vehicle all contribute to the assessment.",
          "Describe known problems plainly. Photos of each side, the interior, the engine bay and any damaged area can reduce guesswork and make it easier to discuss a realistic offer before collection.",
        ],
      },
      {
        id: "completeness",
        title: "Completeness can change the picture",
        paragraphs: [
          "A complete car generally gives a buyer more options than one that has already been stripped. Missing wheels, catalytic components, battery, engine, transmission or interior pieces should be mentioned at the start.",
          "Keys and any available service history can also be useful. They do not guarantee a higher offer, but they help show what is included with the vehicle.",
        ],
      },
      {
        id: "collection-access",
        title: "Location and access affect collection planning",
        paragraphs: [
          "A vehicle parked on a clear driveway is different from one in a low car park, behind a locked car, on soft ground or without wheels. Collection access may determine what equipment is needed and whether the vehicle can be moved safely.",
          "Share access details before agreeing on a collection time. For Carbase, the vehicle must be within our Brisbane service area.",
        ],
        note: "The clearest quote requests include accurate vehicle details, honest condition notes, useful photos and a short description of where the car is parked.",
      },
    ],
  },
  {
    slug: "repair-damaged-car-before-selling",
    title: "Should You Repair a Damaged Car Before Selling It?",
    excerpt:
      "A simple way to compare repair cost, time and likely benefit before spending more money on a damaged vehicle.",
    category: "Decision guide",
    readTime: "6 min read",
    publishedOn: "2026-08-22",
    updatedOn: "2026-08-22",
    photoName: "damaged",
    photoAlt: "An old damaged car with a broken windscreen",
    takeaway:
      "Repairing before sale only makes sense when the likely improvement in sale outcome comfortably exceeds the full cost, delay and uncertainty of the work.",
    sections: [
      {
        id: "price-the-repair",
        title: "Price the whole repair, not just the first part",
        paragraphs: [
          "Begin with a written estimate where possible. Include diagnosis, parts, labour, towing, inspection fees and any follow-up work that may appear once repairs begin.",
          "Cosmetic damage can also expand quickly. Paint matching, hidden panel damage and broken mounting points may turn a small-looking job into a larger one, so leave room for uncertainty in your comparison.",
        ],
      },
      {
        id: "compare-outcomes",
        title: "Compare the car in both conditions",
        paragraphs: [
          "Estimate what the car could reasonably sell for as it stands, then compare that with a realistic repaired value. Use comparable vehicles with a similar year, variant, kilometres and history rather than the highest advertised price you can find.",
          "The difference between those two values is the most a repair could add in a perfect outcome. Your actual margin should be comfortably larger than the repair bill before the work is worth considering.",
        ],
        points: [
          "Likely sale result in its current condition",
          "Realistic sale result after repair",
          "Total repair and transport cost",
          "Time without the vehicle and risk of extra faults",
        ],
      },
      {
        id: "small-jobs",
        title: "Small preparation can still be worthwhile",
        paragraphs: [
          "You do not need to rebuild a damaged car to present it accurately. Removing personal belongings, locating the keys, checking which documents you have and taking clear photos can make the selling process easier without a major outlay.",
          "Avoid temporary fixes that hide a problem. A clear description of the damage gives a buyer the information needed to assess the vehicle and helps prevent surprises at collection.",
        ],
      },
      {
        id: "when-to-sell-as-is",
        title: "When selling as-is may be the cleaner option",
        paragraphs: [
          "Selling in its current condition may be sensible when repair costs are uncertain, parts are difficult to source, the car has several faults or you do not want to manage the time and risk of the work.",
          "Before deciding, request an as-is quote and compare it with your repair estimate. That gives you two concrete paths instead of relying on guesswork.",
        ],
        note: "Do not drive an unsafe or unroadworthy vehicle simply to obtain a quote. Share its condition and location first so the next step can be planned appropriately.",
      },
    ],
  },
  {
    slug: "prepare-non-running-car-for-collection",
    title: "How to Prepare a Non-Running Car for Collection",
    excerpt:
      "A calm, practical checklist for the day an old or non-running vehicle is due to be collected.",
    category: "Pickup checklist",
    readTime: "4 min read",
    publishedOn: "2026-08-22",
    updatedOn: "2026-08-22",
    photoName: "pickup",
    photoAlt: "An old non-running car ready for collection",
    takeaway:
      "The best preparation is simple: confirm access, remove personal items, gather everything included with the car and disclose anything that could affect safe collection.",
    sections: [
      {
        id: "confirm-access",
        title: "Confirm where the vehicle is parked",
        paragraphs: [
          "Tell the collector whether the car is on a driveway, street, sloped surface, grass, underground parking or behind another vehicle. Mention height restrictions, narrow gates and any distance from a firm access point.",
          "If the steering is locked, the tyres are flat, wheels are missing or the car cannot roll, say so before collection day. These details can affect the equipment and space needed.",
        ],
      },
      {
        id: "clear-the-car",
        title: "Remove belongings and check every compartment",
        paragraphs: [
          "Empty the cabin, boot, glovebox, centre console, door pockets and under-seat areas. Remember toll tags, garage remotes, child seats, charging cables and number-plate accessories that belong to you.",
          "Take a final look after the vehicle has been moved into a clear position. Small personal items are much harder to recover once collection is complete.",
        ],
      },
      {
        id: "gather-items",
        title: "Gather the keys and available vehicle information",
        paragraphs: [
          "Put the main key, spare keys, owner handbook and any relevant records together. Have the identifying and ownership information requested by the buyer ready for the handover.",
          "Ask the buyer in advance what they need from you. Requirements can depend on the vehicle and circumstances, so it is better to confirm than assume.",
        ],
        points: [
          "Main and spare keys",
          "Available registration or vehicle details",
          "Any agreed accessories or loose parts",
          "The phone number used to arrange collection",
        ],
      },
      {
        id: "safety-check",
        title: "Flag leaks, sharp damage and other hazards",
        paragraphs: [
          "Do not try to start, push or repair a vehicle if doing so could be unsafe. Tell the collector about leaking fluids, loose panels, broken glass, fire damage, unstable wheels or anything else that may require extra care.",
          "Keep children, pets and bystanders away from the working area during loading. Leave enough space for the collection vehicle to approach and depart when it is safe to do so.",
        ],
        note: "A short access update before the appointment is useful if the car has moved or site conditions have changed since the quote was arranged.",
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function formatBlogDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value + "T00:00:00Z"));
}
