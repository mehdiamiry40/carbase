import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildBusinessSchemaFields } from "../src/lib/businessSchemaFields.mjs";

const siteSource = readFileSync(
  new URL("../src/config/site.ts", import.meta.url),
  "utf8",
);
const structuredDataSource = readFileSync(
  new URL("../src/lib/structuredData.ts", import.meta.url),
  "utf8",
);
const footerSource = readFileSync(
  new URL("../src/components/SiteFooter.tsx", import.meta.url),
  "utf8",
);
const testimonialSource = readFileSync(
  new URL("../src/data/testimonials.ts", import.meta.url),
  "utf8",
);
const timingSource = [
  "../src/data/localPages.ts",
  "../src/data/areas.ts",
  "../src/data/faqs.ts",
  "../src/app/about/page.tsx",
  "../src/app/how-it-works/page.tsx",
]
  .map((path) => readFileSync(new URL(path, import.meta.url), "utf8"))
  .join("\n");

test("uses the owner-verified operator details and timing boundaries", () => {
  for (const expected of [
    'operatorName: "Emir Group"',
    'operatingBase: "Brisbane, Queensland"',
    'phone: "0494 434 509"',
    'phoneInternational: "+61 494 434 509"',
    'hours: "8am–5pm, 7 days a week"',
    'abn: "62 351 619 456"',
    'opens: "08:00"',
    'closes: "17:00"',
  ]) {
    assert.match(siteSource, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotMatch(siteSource, /PLACEHOLDER|0400 000 000|quotes@carbase\.com\.au/);
  assert.doesNotMatch(siteSource, /Emir Group Pty Ltd|legalName:/);
  assert.doesNotMatch(siteSource, /mehdiamiry40@gmail\.com/);
  assert.doesNotMatch(
    timingSource,
    /often within the hour|within a day or two|often within a day|inspect, pay and collect it the same day|offer is free, comes back the same day|Most sales wrap up/i,
  );
});

test("ships no sample or invented customer reviews", () => {
  assert.match(testimonialSource, /export const testimonials: Testimonial\[\] = \[\];/);
  assert.doesNotMatch(testimonialSource, /Sample review|replace me/i);
});

test("business schema uses verified optional fields and omits invented ones", () => {
  const details = {
    phone: "0494 434 509",
    phoneInternational: "+61 494 434 509",
    abn: "62 351 619 456",
    opens: "08:00",
    closes: "17:00",
  };
  const fields = buildBusinessSchemaFields(details);

  assert.equal(fields.telephone, details.phoneInternational);
  assert.equal(fields.contactPoint.areaServed, "Brisbane");
  assert.equal("email" in fields, false);
  assert.equal(fields.taxID, details.abn);
  assert.equal(fields.openingHoursSpecification.opens, details.opens);
  assert.equal(fields.openingHoursSpecification.closes, details.closes);
  assert.equal("address" in fields, false);
  assert.equal("legalName" in fields, false);
  assert.equal("priceRange" in fields, false);
  assert.deepEqual(
    buildBusinessSchemaFields({
      phone: " ",
      phoneInternational: " ",
      email: " ",
      abn: " ",
      opens: " ",
      closes: " ",
    }),
    {},
  );
});

test("identifies the Brisbane operator without publishing a street address", () => {
  assert.match(footerSource, /Operated by/);
  assert.match(footerSource, /site\.operatorName/);
  assert.match(structuredDataSource, /"@type": "Place"/);
  assert.match(structuredDataSource, /details\.operatingBase\.trim\(\)/);
  assert.match(structuredDataSource, /name: operatorName \|\| details\.name/);
  assert.match(structuredDataSource, /alternateName: details\.name/);
  assert.match(structuredDataSource, /"@type": "Brand"/);
  assert.doesNotMatch(
    structuredDataSource,
    /PostalAddress|streetAddress|addressLocality|postalCode/,
  );
});
