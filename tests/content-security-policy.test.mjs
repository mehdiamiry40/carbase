import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  googleAnalyticsInlineSource,
  inlineScripts,
  requiredScriptHashes,
  sha256Source,
  stripPreviewToolbar,
  uncoveredInlineScripts,
} from "../src/lib/csp-inline.mjs";
import {
  CSP_HASH_PLACEHOLDER,
  assertProductionScriptSrc,
  buildContentSecurityPolicy,
  buildDevContentSecurityPolicy,
  directiveValue,
} from "../src/lib/csp-policy.mjs";
import { assertDeploymentOutput, publishInlineScriptHashes } from "../src/lib/csp-publish.mjs";

const configSource = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
const layoutSource = readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const analyticsSource = readFileSync(
  new URL("../src/components/SiteAnalytics.tsx", import.meta.url),
  "utf8",
);
const cronSource = readFileSync(
  new URL("../src/app/api/cron/quote-outbox/route.ts", import.meta.url),
  "utf8",
);
const packageSource = readFileSync(new URL("../package.json", import.meta.url), "utf8");

const GTAG = "window.dataLayer = window.dataLayer || [];";

function page(extra = "") {
  const payload = JSON.stringify([0, { children: GTAG, id: "google-analytics" }]);
  return `<!doctype html><script src="/_next/static/chunks/app.js"></script>
<script type="application/ld+json">{"@type":"WebSite"}</script>
<script>(self.__next_s=self.__next_s||[]).push(${payload})</script>
<script>(self.__next_f=self.__next_f||[]).push([0])</script>
${extra}`;
}

function directive(policy, name) {
  return directiveValue(policy, name);
}

test("hashes the script source the browser hashes", () => {
  assert.equal(
    sha256Source("window.__ok = 1"),
    "'sha256-jHIk/15hbltKLWfuHJjRVWpRTvmtGvByNu5yNRfH7oc='",
  );
});

test("ignores JSON-LD and external scripts, and hashes next/script payloads", () => {
  const scripts = inlineScripts(page());
  assert.equal(scripts.length, 2);
  assert.deepEqual(scripts[0]?.dynamic, [GTAG]);
  const hashes = requiredScriptHashes(page());
  assert.ok(hashes.includes(sha256Source(scripts[0].text)));
  assert.ok(hashes.includes(sha256Source(GTAG)));
  assert.ok(hashes.includes(sha256Source("(self.__next_f=self.__next_f||[]).push([0])")));
});

test("production CSP uses sha256 hashes and the existing analytics hosts", () => {
  const policy = buildContentSecurityPolicy([sha256Source("var ready = true;")]);

  assert.match(directive(policy, "script-src"), /'self'/);
  assert.match(directive(policy, "script-src"), /'sha256-/);
  assert.match(directive(policy, "script-src"), /https:\/\/www\.googletagmanager\.com/);
  assert.equal(directive(policy, "script-src-attr"), "'none'");
  assert.equal(directive(policy, "style-src"), "'self'");
  assert.equal(directive(policy, "style-src-attr"), "'unsafe-inline'");
  assert.equal(directive(policy, "default-src"), "'self'");
  assert.equal(directive(policy, "object-src"), "'none'");
  assert.equal(directive(policy, "base-uri"), "'self'");
  assert.equal(directive(policy, "form-action"), "'self'");
  assert.equal(directive(policy, "frame-ancestors"), "'none'");
  assert.equal(directive(policy, "frame-src"), "'none'");
  assert.equal(directive(policy, "worker-src"), "'none'");
  assert.equal(directive(policy, "font-src"), "'self'");
  assert.match(directive(policy, "img-src"), /'self' blob:/);
  assert.match(directive(policy, "connect-src"), /'self'/);
  assert.doesNotMatch(directive(policy, "script-src"), /unsafe-inline|unsafe-eval|strict-dynamic|nonce-/);
  assert.doesNotMatch(directive(policy, "style-src"), /unsafe-inline/);
  assert.doesNotMatch(policy, /vercel\.live/);
  assert.doesNotMatch(policy, /upgrade-insecure-requests/);
  assert.doesNotMatch(policy, /(^|\s)\*(;|\s|$)/);
  assert.doesNotMatch(policy, /https:\/\/\*\.google\.com/);
  assert.doesNotMatch(policy, /doubleclick|googlesyndication|googleadservices|va\.vercel-scripts/);
  assert.doesNotThrow(() => assertProductionScriptSrc(policy));
  assert.equal(uncoveredInlineScripts("<script>var ready = true;</script>", policy).length, 0);
});

test("analytics origins are limited to the gtag hosts the site loads", () => {
  const policy = buildContentSecurityPolicy([sha256Source("var ready = true;")]);

  for (const origin of [
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
  ]) {
    assert.match(policy, new RegExp(origin.replace(/[.*]/g, "\\$&")));
  }
  assert.doesNotMatch(directive(policy, "script-src"), /google-analytics\.com/);
});

test("ships a placeholder until the post-build step fills hashes", () => {
  const policy = buildContentSecurityPolicy([]);
  assert.ok(policy.includes(CSP_HASH_PLACEHOLDER));
  assert.throws(() => assertProductionScriptSrc(policy), /placeholder/);
});

test("development CSP allows the eval React uses for debugging", () => {
  const dev = buildDevContentSecurityPolicy();
  assert.match(directive(dev, "script-src"), /'unsafe-eval'/);
  assert.match(directive(dev, "script-src"), /'unsafe-inline'/);
  assert.match(directive(dev, "style-src"), /'unsafe-inline'/);
  assert.match(directive(dev, "connect-src"), /wss:/);
  assert.doesNotMatch(dev, /upgrade-insecure-requests/);
  assert.doesNotMatch(dev, /vercel\.live/);
});

test("google analytics bootstrap matches the installed third-parties template", () => {
  const source = readFileSync(
    new URL("../node_modules/@next/third-parties/dist/google/ga.js", import.meta.url),
    "utf8",
  );
  const match = source.match(/__html: `([\s\S]*?)`,/);
  assert.ok(match, "GoogleAnalytics inline template missing");
  const rendered = match[1]
    .replaceAll("${dataLayerName}", "dataLayer")
    .replaceAll("${gaId}", "G-TESTID")
    .replaceAll("${debugMode ? \",{ 'debug_mode': true }\" : ''}", "");
  assert.equal(googleAnalyticsInlineSource("G-TESTID"), rendered);
  assert.equal(googleAnalyticsInlineSource("  "), null);
  assert.equal(googleAnalyticsInlineSource(undefined), null);
});

test("strips the unconditional preview toolbar and keeps the production cookie gate", () => {
  const injected =
    'before;var r=document.createElement("script");r.src="https://vercel.live/_next-live/feedback/feedback.js",r.setAttribute("data-deployment-id",globalThis.NEXT_DEPLOYMENT_ID),(document.head||document.documentElement).appendChild(r);after';
  assert.equal(stripPreviewToolbar(injected), "before;void 0;after");
  assert.equal(stripPreviewToolbar("var ready = true;"), "var ready = true;");
  const production =
    'if(e.i(47167),/(?:^|;\\s)__vercel_toolbar=1(?:;|$)/.test(document.cookie)){var r=document.createElement("script");r.src="https://vercel.live/_next-live/feedback/feedback.js",r.setAttribute("data-explicit-opt-in","true"),r.setAttribute("data-cookie-opt-in","true"),r.setAttribute("data-deployment-id",globalThis.NEXT_DEPLOYMENT_ID),(document.head||document.documentElement).appendChild(r)}';
  assert.equal(stripPreviewToolbar(production), production);
  assert.throws(
    () => stripPreviewToolbar('const src = "https://vercel.live/_next-live/feedback/feedback.js";'),
    /unrecognized/,
  );
});

test("fails closed when a prerendered inline script has no hash", () => {
  const policy = buildContentSecurityPolicy([sha256Source("var ready = true;")]);
  const missing = uncoveredInlineScripts("<script>var other = true;</script>", policy);
  assert.deepEqual(missing, [sha256Source("var other = true;")]);
});

test("rewrites a deployment config that the adapter wrote with the placeholder", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "csp-"));
  const dist = path.join(root, ".next");
  const html = "<!doctype html><script>var ready = true;</script>";
  const placeholder = buildContentSecurityPolicy([]);
  await mkdir(path.join(dist, "server", "app"), { recursive: true });
  await mkdir(path.join(dist, "output"), { recursive: true });
  await writeFile(path.join(dist, "server", "app", "index.html"), html);
  await writeFile(
    path.join(dist, "routes-manifest.json"),
    JSON.stringify({
      headers: [{ source: "/:path*", headers: [{ key: "Content-Security-Policy", value: placeholder }] }],
    }),
  );
  const routing = { beforeMiddleware: [{ headers: { "content-security-policy": placeholder } }] };
  const env = { ...process.env, NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TESTID" };
  const published = await publishInlineScriptHashes({ distDir: dist, routing, env });
  assert.equal(JSON.stringify(routing).includes(CSP_HASH_PLACEHOLDER), false);
  assert.ok(published.hashList.includes(sha256Source(googleAnalyticsInlineSource("G-TESTID"))));
  assert.ok(published.policy.includes(sha256Source("var ready = true;")));
  assert.doesNotMatch(directiveValue(published.policy, "script-src"), /unsafe-inline|unsafe-eval/);
  assert.doesNotMatch(published.policy, /vercel\.live/);

  const dropped = published.policy.replace(published.hashList[0], "");
  await writeFile(
    path.join(dist, "output", "config.json"),
    JSON.stringify({ routes: [{ headers: { "Content-Security-Policy": dropped } }] }),
  );
  await assertDeploymentOutput({
    projectRoot: root,
    distDir: dist,
    routing,
    requireDeploymentOutput: true,
    env,
  });
  const config = await readFile(path.join(dist, "output", "config.json"), "utf8");
  assert.equal(config.includes(CSP_HASH_PLACEHOLDER), false);
  assert.equal(config.includes(published.hashList[0]), true);
  assert.equal(config.includes(published.policy), true);
  await rm(root, { recursive: true, force: true });
});

test("pages stay static: no per-request nonce and the build publishes hashes", () => {
  assert.equal(existsSync(new URL("../src/proxy.ts", import.meta.url)), false);
  assert.doesNotMatch(layoutSource, /headers\(|x-nonce|nonce=/);
  assert.doesNotMatch(analyticsSource, /nonce/);
  assert.match(analyticsSource, /<GoogleAnalytics gaId=\{measurementId\} \/>/);
  assert.match(configSource, /key:\s*"Content-Security-Policy"/);
  assert.match(configSource, /scripts\/csp-adapter\.mjs/);
  assert.match(configSource, /source: "\/api\/:path\*"/);
  assert.match(configSource, /private, no-store/);
  assert.match(cronSource, /"Cache-Control": "no-store"/);
  assert.match(packageSource, /next build && node scripts\/csp-hashes\.mjs/);
  assert.doesNotMatch(configSource, /vercel\.live|strict-dynamic|'nonce-/);
});
