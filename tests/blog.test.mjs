import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const postsSource = readFileSync(
  new URL("../src/data/blogPosts.ts", import.meta.url),
  "utf8",
);
const indexSource = readFileSync(
  new URL("../src/app/blog/page.tsx", import.meta.url),
  "utf8",
);
const articleSource = readFileSync(
  new URL("../src/app/blog/[slug]/page.tsx", import.meta.url),
  "utf8",
);
const sitemapSource = readFileSync(
  new URL("../src/app/sitemap.ts", import.meta.url),
  "utf8",
);
const headerSource = readFileSync(
  new URL("../src/components/SiteHeader.tsx", import.meta.url),
  "utf8",
);
const footerSource = readFileSync(
  new URL("../src/components/SiteFooter.tsx", import.meta.url),
  "utf8",
);

test("publishes a populated blog hub with unique starter guides", () => {
  const slugs = [...postsSource.matchAll(/^\s{4}slug: "([^"]+)",$/gm)].map(
    (match) => match[1],
  );

  assert.equal(slugs.length, 3);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.match(indexSource, /path: "\/blog"/);
  assert.match(indexSource, /"@type": "Blog"/);
});

test("prerenders known articles and rejects unknown slugs", () => {
  assert.match(articleSource, /export const dynamicParams = false/);
  assert.match(articleSource, /generateStaticParams/);
  assert.match(articleSource, /if \(!post\) notFound\(\)/);
  assert.match(articleSource, /"@type": "BlogPosting"/);
  assert.match(articleSource, /"@type": "BreadcrumbList"/);
});

test("makes the blog discoverable in navigation and the sitemap", () => {
  assert.match(headerSource, /href: "\/blog"/);
  assert.match(footerSource, /href: "\/blog"/);
  assert.match(sitemapSource, /"\/blog"/);
  assert.match(sitemapSource, /blogPosts\.map/);
  assert.match(sitemapSource, /lastModified: post\.updatedOn/);
});
