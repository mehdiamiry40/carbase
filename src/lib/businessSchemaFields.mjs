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
 * @property {string=} legalName
 * @property {string=} phone
 * @property {string=} email
 * @property {string=} abn
 * @property {string=} opens
 * @property {string=} closes
 */

/**
 * Return only verified optional business fields that are safe to publish.
 * No address or price field is generated because neither has a verified value.
 *
 * @param {BusinessSchemaDetails} details
 */
export function buildBusinessSchemaFields(details) {
  const legalName = details.legalName?.trim();
  const phone = details.phone?.trim();
  const email = details.email?.trim();
  const abn = details.abn?.trim();
  const opens = details.opens?.trim();
  const closes = details.closes?.trim();

  return {
    ...(legalName ? { legalName } : {}),
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
            areaServed: "AU-QLD",
          },
        }
      : {}),
  };
}
