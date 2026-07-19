// ─────────────────────────────────────────────────────────────────────────
//  ⚠️  PLACEHOLDER TESTIMONIALS — these are sample reviews for layout only.
//  Replace every entry below with REAL reviews from your actual customers
//  (with their permission) before launching the site. Publishing invented
//  reviews as if they were real can breach Australian Consumer Law.
// ─────────────────────────────────────────────────────────────────────────

export type Testimonial = {
  quote: string;
  name: string;
  location: string;
  rating: 1 | 2 | 3 | 4 | 5;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Filled in the form on my lunch break, had a quote by the afternoon and the car was picked up the next morning. Money hit my account before they left the driveway.",
    name: "Sample review — replace me",
    location: "Gold Coast",
    rating: 5,
  },
  {
    quote:
      "My old wagon hadn't started in months and I assumed I'd have to pay someone to tow it away. Carbase bought it as-is and handled all the paperwork on the spot.",
    name: "Sample review — replace me",
    location: "Brisbane",
    rating: 5,
  },
  {
    quote:
      "Straightforward from start to finish. The price they quoted was the price I was paid — no haggling at pickup, no fees taken out. Would use them again.",
    name: "Sample review — replace me",
    location: "Logan",
    rating: 5,
  },
];
