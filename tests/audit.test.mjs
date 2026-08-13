import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const layoutSource = readFileSync(
  new URL("../src/app/layout.tsx", import.meta.url),
  "utf8",
);
const homeSource = readFileSync(
  new URL("../src/app/page.tsx", import.meta.url),
  "utf8",
);
const aboutSource = readFileSync(
  new URL("../src/app/about/page.tsx", import.meta.url),
  "utf8",
);
const quoteFormSource = readFileSync(
  new URL("../src/components/QuoteForm.tsx", import.meta.url),
  "utf8",
);
const quoteRouteSource = readFileSync(
  new URL("../src/app/api/quote/route.ts", import.meta.url),
  "utf8",
);
const cssSource = readFileSync(
  new URL("../src/app/globals.css", import.meta.url),
  "utf8",
);
const revealSource = readFileSync(
  new URL("../src/components/Reveal.tsx", import.meta.url),
  "utf8",
);
const accordionSource = readFileSync(
  new URL("../src/components/Accordion.tsx", import.meta.url),
  "utf8",
);
const configSource = readFileSync(
  new URL("../next.config.ts", import.meta.url),
  "utf8",
);
const privacySource = readFileSync(
  new URL("../src/app/privacy/page.tsx", import.meta.url),
  "utf8",
);
const errorSource = readFileSync(
  new URL("../src/app/error.tsx", import.meta.url),
  "utf8",
);

test("keeps commercial keyword metadata on the homepage only", () => {
  assert.doesNotMatch(layoutSource, /keywords:\s*\[/);
  assert.match(homeSource, /"cash for cars Toowoomba"/);
  assert.match(homeSource, /"car removal Toowoomba"/);
});

test("avoids repeating the brand name in the About document title", () => {
  assert.match(aboutSource, /title: "About Us \| Toowoomba Car Buyers"/);
  assert.doesNotMatch(aboutSource, /title: "About Carbase/);
});

test("quote form is a real form with required contact fields", () => {
  assert.match(quoteFormSource, /<form[\s\S]*noValidate/);
  assert.match(quoteFormSource, /type="submit"/);
  assert.match(quoteFormSource, /name="suburb"/);
  assert.match(quoteFormSource, /autoComplete="address-level2"/);
  assert.match(quoteFormSource, /id="carbase-suburbs"/);
  assert.match(quoteFormSource, /role="progressbar"/);
});

test("quote endpoint rejects malformed optional emails without logging them", () => {
  assert.match(quoteRouteSource, /Please provide a valid email address/);
  assert.doesNotMatch(quoteRouteSource, /console\.(log|info|debug|warn|error)\([^)]*email/);
});

test("hero highlight class and no-JS reveal fallbacks are defined", () => {
  assert.match(cssSource, /\.text-gradient\s*\{/);
  assert.match(cssSource, /@media \(scripting: none\)/);
  assert.match(revealSource, /typeof IntersectionObserver === "undefined"/);
});

test("primary landmarks and disclosure widgets expose assistive names", () => {
  assert.match(layoutSource, /href="#main-content"/);
  assert.match(layoutSource, /Skip to content/);
  assert.match(layoutSource, /id="main-content"/);
  assert.match(accordionSource, /aria-controls=\{panelId\}/);
  assert.match(accordionSource, /useId\(\)/);
});

test("documents email delivery and tightens browser feature policy", () => {
  assert.match(privacySource, /Resend/);
  assert.match(configSource, /Permissions-Policy/);
  assert.match(configSource, /camera=\(\), microphone=\(\), geolocation=\(\)/);
  assert.match(errorSource, /export default function Error/);
});
