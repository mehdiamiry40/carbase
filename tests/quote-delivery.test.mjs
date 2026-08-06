import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  logQuoteDeliveryFailure,
  logQuoteDeliveryUnavailable,
  quoteDeliveryUnavailable,
  resolveQuoteDelivery,
} from "../src/lib/quoteDelivery.mjs";

const routeSource = readFileSync(
  new URL("../src/app/api/quote/route.ts", import.meta.url),
  "utf8",
);

test("missing Resend configuration fails closed with a 503 contract", () => {
  assert.equal(resolveQuoteDelivery({}, "mehdiamiry40@gmail.com"), null);
  assert.equal(resolveQuoteDelivery({ RESEND_API_KEY: "   " }, "mehdiamiry40@gmail.com"), null);
  assert.equal(quoteDeliveryUnavailable.status, 503);
  assert.deepEqual(quoteDeliveryUnavailable.body, {
    ok: false,
    error: "Online quote requests are temporarily unavailable. Please call us instead.",
  });
  assert.match(routeSource, /status: quoteDeliveryUnavailable\.status/);
  assert.doesNotMatch(routeSource, /delivered:\s*false/);
});

test("configured delivery defaults to the verified quote inbox", () => {
  assert.match(
    routeSource,
    /const DEFAULT_QUOTE_TO_EMAIL = "mehdiamiry40@gmail\.com";/,
  );
  assert.match(
    routeSource,
    /resolveQuoteDelivery\(process\.env, DEFAULT_QUOTE_TO_EMAIL\)/,
  );
  assert.deepEqual(
    resolveQuoteDelivery(
      {
        RESEND_API_KEY: "  re_test_key  ",
        QUOTE_TO_EMAIL: "   ",
        QUOTE_FROM_EMAIL: "   ",
      },
      "mehdiamiry40@gmail.com",
    ),
    {
      apiKey: "re_test_key",
      destination: "mehdiamiry40@gmail.com",
      sender: "Carbase Website <onboarding@resend.dev>",
    },
  );
});

test("delivery diagnostics never include customer data", () => {
  const messages = [];
  const logger = {
    warn: (message) => messages.push(message),
    error: (message) => messages.push(message),
  };
  logQuoteDeliveryUnavailable(logger);
  logQuoteDeliveryFailure(logger);

  const output = messages.join(" ");
  for (const privateValue of [
    "Privacy Test Person",
    "0499 888 777",
    "privacy-test@example.com",
    "Privacy Test Suburb",
  ]) {
    assert.doesNotMatch(output, new RegExp(privateValue));
  }
  assert.doesNotMatch(routeSource, /console\.|\.\.\.lead|\{\s*lead\s*\}/);
});
