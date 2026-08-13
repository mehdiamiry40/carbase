import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

function readSourceTree(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return readSourceTree(path);
    return /\.(?:ts|tsx|mjs)$/.test(entry) ? [readFileSync(path, "utf8")] : [];
  });
}

const srcDirectory = fileURLToPath(new URL("../src/", import.meta.url));
const publicSource = readSourceTree(srcDirectory).join("\n");
const areaSource = readFileSync(
  new URL("../src/data/areas.ts", import.meta.url),
  "utf8",
);
const siteSource = readFileSync(
  new URL("../src/config/site.ts", import.meta.url),
  "utf8",
);
const sitemapSource = readFileSync(
  new URL("../src/app/sitemap.ts", import.meta.url),
  "utf8",
);
const legacyAreaSource = readFileSync(
  new URL("../src/app/service-areas/[slug]/page.tsx", import.meta.url),
  "utf8",
);
const coverageSource = readFileSync(
  new URL("../src/app/service-areas/page.tsx", import.meta.url),
  "utf8",
);
const headerSource = readFileSync(
  new URL("../src/components/SiteHeader.tsx", import.meta.url),
  "utf8",
);

test("does not claim a motor dealer licence that has not been verified", () => {
  assert.doesNotMatch(publicSource, /licensed motor dealer/i);
});

test("limits every public service-area signal to the Toowoomba Region", () => {
  assert.doesNotMatch(
    publicSource,
    /Brisbane|Gold Coast|Logan|Ipswich|Redlands|Moreton Bay|South East Queensland|\bSEQ\b|Darling Downs|\bWithcott\b|AU-QLD|Southport/i,
  );
  assert.deepEqual(
    [...areaSource.matchAll(/^\s{4}slug:\s*"([^"]+)"/gm)].map((match) => match[1]),
    ["toowoomba"],
  );
  assert.match(siteSource, /serviceRegion: "Toowoomba Region"/);
});

test("uses one canonical coverage hub and retires former area routes", () => {
  assert.doesNotMatch(sitemapSource, /service-areas\/\$\{area\.slug\}/);
  assert.match(
    legacyAreaSource,
    /slug === "toowoomba"[\s\S]*permanentRedirect\("\/service-areas"\)/,
  );
  assert.match(legacyAreaSource, /notFound\(\)/);
  assert.match(coverageSource, /"@type": "CollectionPage"/);
  assert.match(coverageSource, /"@type": "ItemList"/);
});

test("keeps distinct search intent for the two Toowoomba service pages", () => {
  assert.match(
    publicSource,
    /seoTitle: "Cash for Cars Toowoomba \| Free Quote & Pickup"/,
  );
  assert.match(
    publicSource,
    /seoTitle: "Car Removal Toowoomba \| Free Pickup & Quote"/,
  );
});

test("promotes both commercial pages in the primary navigation", () => {
  assert.match(headerSource, /href: "\/cash-for-cars-toowoomba"/);
  assert.match(headerSource, /href: "\/car-removal-toowoomba"/);
});

test("uses accurate content dates for commercial pages without deploy-time churn", () => {
  assert.doesNotMatch(sitemapSource, /new Date\(\)|changeFrequency|priority/);
  assert.match(sitemapSource, /lastModified: page\.dateModified/);
  assert.equal(
    [...publicSource.matchAll(/dateModified: "(\d{4}-\d{2}-\d{2})"/g)].length,
    2,
  );
});
