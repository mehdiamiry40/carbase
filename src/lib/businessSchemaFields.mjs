const days = Object.freeze([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

/**
 * @typedef {object} BusinessSchemaDetails
 * @property {string=} phone
 * @property {string=} phoneInternational
 * @property {string=} email
 * @property {string=} abn
 * @property {string=} opens
 * @property {string=} closes
 */

/**
 * Return only verified optional business fields that are safe to publish.
 * No address is generated because the service-area business has no
 * customer-facing public address. No price field is generated because no
 * verified range has been supplied.
 *
 * @param {BusinessSchemaDetails} details
 */
export function buildBusinessSchemaFields(details) {
  const phone = details.phoneInternational?.trim() || details.phone?.trim();
  const email = details.email?.trim();
  const abn = details.abn?.trim();
  const opens = details.opens?.trim();
  const closes = details.closes?.trim();

  return {
    ...(phone ? { telephone: phone } : {}),
    ...(email ? { email } : {}),
    ...(abn ? { taxID: abn } : {}),
    ...(opens && closes
      ? {
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: days,
            opens,
            closes,
          },
        }
      : {}),
    ...(phone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            telephone: phone,
            contactType: "sales",
            areaServed: "Toowoomba Region",
          },
        }
      : {}),
  };
}
