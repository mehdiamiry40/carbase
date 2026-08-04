// Review these answers and adjust them to match how you actually operate —
// they describe your process to customers, so they need to be accurate.

export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: "What kinds of cars do you buy?",
    answer:
      "We specialise in old, unwanted and end-of-life vehicles — including high-kilometre cars, accident-damaged cars, write-offs, unregistered vehicles and cars that no longer run. Sedans, SUVs, utes, vans, 4x4s and light trucks are all welcome. If you're not sure, send the details through anyway; quotes are free and there's no obligation.",
  },
  {
    question: "How quickly will I get a quote?",
    answer:
      "Most quotes go out the same day during business hours, often within the hour. The more detail (and photos) you give us in the form, the faster and sharper the offer.",
  },
  {
    question: "How and when do I get paid?",
    answer:
      "By instant bank transfer, on the spot, before we take the car anywhere. You'll see the money leave our account while we're still with you — we never take a vehicle without the payment being made first.",
  },
  {
    question: "Do you really pick the car up for free?",
    answer:
      "Yes. Pickup is free anywhere in our service area across Brisbane, the Gold Coast and surrounds, whether the car drives or not. There are no towing fees, admin fees or hidden charges taken out of your offer.",
  },
  {
    question: "Does the car need a roadworthy certificate (RWC)?",
    answer:
      "No. Because you're selling to a business rather than a private buyer, you don't need to supply a roadworthy certificate. We buy the car exactly as it is.",
  },
  {
    question: "What paperwork do I need?",
    answer:
      "Photo ID and proof you own the car — usually the Queensland registration papers. If the car is unregistered, other proof of ownership works too. We sort the transfer paperwork with you at pickup, and it only takes a few minutes.",
  },
  {
    question: "Can you buy a car that's still under finance?",
    answer:
      "Often, yes. Get a payout figure from your lender and let us know in the form. If our offer covers the payout we can pay the lender directly and transfer the difference to you.",
  },
  {
    question: "How do you work out your prices?",
    answer:
      "We look at the make, model, year, kilometres and condition, plus what the car is genuinely worth in the current market. The offer we give you is the amount that lands in your account — no fees deducted afterwards and no last-minute renegotiation at pickup unless the car is materially different from what was described.",
  },
  {
    question: "Which areas do you cover?",
    answer:
      "All of Brisbane and the Gold Coast, plus surrounding areas including Logan, Ipswich, the Redlands and Moreton Bay. Outside those areas? Ask anyway — we can often make it work.",
  },
];
