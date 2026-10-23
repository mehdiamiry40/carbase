import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildContentSecurityPolicy } from "../src/lib/contentSecurityPolicy.mjs";

const configSource = readFileSync(
  new URL("../next.config.ts", import.meta.url),
  "utf8",
);

function directive(policy, name) {
  const match = policy
    .split(";")
    .map((part) => part.trim())
    .find((part) => part === name || part.startsWith(`${name} `));
  assert.ok(match, `missing ${name}`);
  return match;
}

test("production CSP uses a nonce and strict-dynamic without unsafe script sources", () => {
  const policy = buildContentSecurityPolicy({
    nonce: "abc123+/=",
    dev: false,
    upgradeInsecureRequests: true,
  });

  assert.equal(
    directive(policy, "script-src"),
    "script-src 'self' 'nonce-abc123+/=' 'strict-dynamic' https://www.googletagmanager.com",
  );
  assert.equal(directive(policy, "script-src-attr"), "script-src-attr 'none'");
  assert.equal(
    directive(policy, "style-src"),
    "style-src 'self' 'nonce-abc123+/='",
  );
  assert.equal(
    directive(policy, "style-src-attr"),
    "style-src-attr 'unsafe-inline'",
  );
  assert.equal(directive(policy, "default-src"), "default-src 'self'");
  assert.equal(directive(policy, "object-src"), "object-src 'none'");
  assert.equal(directive(policy, "base-uri"), "base-uri 'self'");
  assert.equal(directive(policy, "form-action"), "form-action 'self'");
  assert.equal(directive(policy, "frame-ancestors"), "frame-ancestors 'none'");
  assert.equal(directive(policy, "frame-src"), "frame-src 'none'");
  assert.equal(directive(policy, "worker-src"), "worker-src 'none'");
  assert.equal(directive(policy, "font-src"), "font-src 'self'");
  assert.match(directive(policy, "img-src"), /'self' blob:/);
  assert.match(directive(policy, "connect-src"), /'self'/);
  assert.match(policy, /upgrade-insecure-requests/);
  assert.doesNotMatch(directive(policy, "script-src"), /unsafe-inline|unsafe-eval/);
  assert.doesNotMatch(directive(policy, "style-src"), /unsafe-inline/);
  assert.doesNotMatch(policy, /(^|\s)\*(;|\s|$)/);
  assert.doesNotMatch(policy, /https:\/\/\*\.google\.com/);
  assert.doesNotMatch(policy, /doubleclick|googlesyndication|googleadservices/);
});

test("development CSP allows the eval React uses for debugging", () => {
  const policy = buildContentSecurityPolicy({
    nonce: "devnonce",
    dev: true,
    upgradeInsecureRequests: false,
  });

  assert.match(directive(policy, "script-src"), /'unsafe-eval'/);
  assert.match(directive(policy, "style-src"), /'unsafe-inline'/);
  assert.doesNotMatch(policy, /upgrade-insecure-requests/);
});

test("analytics origins are limited to the gtag hosts the site loads", () => {
  const policy = buildContentSecurityPolicy({ nonce: "n", dev: false });

  for (const origin of [
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
  ]) {
    assert.match(policy, new RegExp(origin.replace(/[.*]/g, "\\$&")));
  }
});

test("next config does not add a second content security policy", () => {
  assert.doesNotMatch(configSource, /key:\s*"Content-Security-Policy"/);
});
