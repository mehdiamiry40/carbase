import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const analyticsSource = await readFile(
  new URL("../src/components/SiteAnalytics.tsx", import.meta.url),
  "utf8",
);
const quoteFormSource = await readFile(
  new URL("../src/components/QuoteForm.tsx", import.meta.url),
  "utf8",
);

test("analytics stays disabled without a configured measurement ID", () => {
  assert.match(analyticsSource, /if \(!measurementId\) return null/);
});

test("only successful quote requests emit a lead event", () => {
  const responseCheck = quoteFormSource.indexOf("if (!res.ok)");
  const deliveredCheck = quoteFormSource.indexOf("if (body?.delivered)");
  const leadEvent = quoteFormSource.indexOf("trackQuoteSubmission();");
  const successState = quoteFormSource.indexOf('setStatus("success")');

  assert.ok(responseCheck >= 0);
  assert.ok(deliveredCheck > responseCheck);
  assert.ok(leadEvent > deliveredCheck);
  assert.ok(successState > leadEvent);
});

test("analytics events contain no quote or customer fields", () => {
  for (const field of [
    "name",
    "email",
    "suburb",
    "vehicle",
    "make",
    "model",
    "year",
    "photo",
  ]) {
    assert.doesNotMatch(analyticsSource, new RegExp(`\\b${field}\\b`, "i"));
  }

  assert.doesNotMatch(analyticsSource, /\.(?:href|textContent|innerText)\b/);
});
