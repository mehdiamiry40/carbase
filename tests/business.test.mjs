import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildBusinessSchemaFields } from "../src/lib/businessSchemaFields.mjs";

const siteSource = readFileSync(
  new URL("../src/config/site.ts", import.meta.url),
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

test("uses the owner-verified business details and timing boundaries", () => {
  for (const expected of [
    'legalName: "Emir Group Pty Ltd"',
    'phone: "0410 233 335"',
    'hours: "8am–5pm, 7 days a week"',
    'abn: "62 351 619 456"',
    'opens: "08:00"',
    'closes: "17:00"',
  ]) {
    assert.match(siteSource, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotMatch(siteSource, /PLACEHOLDER|0400 000 000|quotes@carbase\.com\.au/);
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
    legalName: "Emir Group Pty Ltd",
    phone: "0410 233 335",
    abn: "62 351 619 456",
    opens: "08:00",
    closes: "17:00",
  };
  const fields = buildBusinessSchemaFields(details);

  assert.equal(fields.legalName, details.legalName);
  assert.equal(fields.telephone, details.phone);
  assert.equal("email" in fields, false);
  assert.equal(fields.taxID, details.abn);
  assert.equal(fields.openingHoursSpecification.opens, details.opens);
  assert.equal(fields.openingHoursSpecification.closes, details.closes);
  assert.equal("address" in fields, false);
  assert.equal("priceRange" in fields, false);
  assert.deepEqual(
    buildBusinessSchemaFields({
      legalName: " ",
      phone: " ",
      email: " ",
      abn: " ",
      opens: " ",
      closes: " ",
    }),
    {},
  );
});
