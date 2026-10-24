// Production script-src is sha256 hashes of inline scripts plus 'self'.
// A nonce would make every HTML response unique and force dynamic rendering.
// There is no 'strict-dynamic': that would ignore 'self' and block the
// parser-inserted Next.js chunks.
//
// Hosts below are the ones this site already loads for GA4
// (@next/third-parties GoogleAnalytics). Resend and Blob are server-side.
// vercel.live is the preview toolbar and is not allowlisted.
// Vercel Web Analytics and Speed Insights are not installed.

export const CSP_HASH_PLACEHOLDER = "__CSP_INLINE_HASHES__";

const GOOGLE_ANALYTICS_SCRIPT = ["https://www.googletagmanager.com"];

const GOOGLE_ANALYTICS_CONNECT = [
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  // gtag.js picks a regional collector at runtime (for example
  // region1.google-analytics.com or region1.analytics.google.com).
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
];

const GOOGLE_ANALYTICS_IMG = [
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
];

function join(directive, sources) {
  return `${directive} ${sources.join(" ")}`;
}

/**
 * Production policy. `scriptHashes` are `'sha256-...'` sources.
 * An empty list leaves a placeholder that the build must replace inside the
 * header Vercel serves. Shipping the placeholder blocks every inline script.
 *
 * style-src stays `'self'` so an injected style element is refused.
 * style-src-attr is `'unsafe-inline'` because React and next/image emit style
 * attributes, which cannot carry a hash.
 *
 * upgrade-insecure-requests is omitted. The deployment browser gate serves
 * this same production build over loopback HTTP, and a static header cannot
 * vary by host. Vercel sends HSTS on the public HTTPS hosts.
 *
 * @param {string[]} scriptHashes
 */
export function buildContentSecurityPolicy(scriptHashes) {
  const hashes = scriptHashes.length > 0 ? [...scriptHashes].sort() : [CSP_HASH_PLACEHOLDER];
  return [
    join("default-src", ["'self'"]),
    join("script-src", ["'self'", ...hashes, ...GOOGLE_ANALYTICS_SCRIPT]),
    join("script-src-attr", ["'none'"]),
    join("style-src", ["'self'"]),
    join("style-src-attr", ["'unsafe-inline'"]),
    join("img-src", ["'self'", "blob:", ...GOOGLE_ANALYTICS_IMG]),
    join("font-src", ["'self'"]),
    join("connect-src", ["'self'", ...GOOGLE_ANALYTICS_CONNECT]),
    join("object-src", ["'none'"]),
    join("base-uri", ["'self'"]),
    join("form-action", ["'self'"]),
    join("frame-ancestors", ["'none'"]),
    join("frame-src", ["'none'"]),
    join("worker-src", ["'none'"]),
  ].join("; ");
}

/** React's development overlay needs eval, and dev inline scripts change every compile. */
export function buildDevContentSecurityPolicy() {
  return [
    join("default-src", ["'self'"]),
    join("script-src", ["'self'", "'unsafe-inline'", "'unsafe-eval'", ...GOOGLE_ANALYTICS_SCRIPT]),
    join("script-src-attr", ["'none'"]),
    join("style-src", ["'self'", "'unsafe-inline'"]),
    join("style-src-attr", ["'unsafe-inline'"]),
    join("img-src", ["'self'", "blob:", ...GOOGLE_ANALYTICS_IMG]),
    join("font-src", ["'self'"]),
    join("connect-src", ["'self'", ...GOOGLE_ANALYTICS_CONNECT, "ws:", "wss:"]),
    join("object-src", ["'none'"]),
    join("base-uri", ["'self'"]),
    join("form-action", ["'self'"]),
    join("frame-ancestors", ["'none'"]),
    join("frame-src", ["'none'"]),
    join("worker-src", ["'none'"]),
  ].join("; ");
}

/** @param {string} policy @param {string} name */
export function directiveValue(policy, name) {
  const match = policy
    .split(";")
    .map((part) => part.trim())
    .find((part) => part === name || part.startsWith(`${name} `));
  if (!match) throw new Error(`CSP is missing ${name}`);
  return match.slice(name.length).trim();
}

/** @param {string} policy */
export function assertProductionScriptSrc(policy) {
  const scriptSrc = directiveValue(policy, "script-src");
  if (scriptSrc.includes("'unsafe-inline'") || scriptSrc.includes("'unsafe-eval'")) {
    throw new Error(`production script-src must not allow unsafe-inline or unsafe-eval: ${scriptSrc}`);
  }
  if (scriptSrc.includes("'nonce-") || scriptSrc.includes("'strict-dynamic'")) {
    throw new Error("production script-src must use hashes so prerendered pages stay static");
  }
  if (scriptSrc.includes(CSP_HASH_PLACEHOLDER) || policy.includes(CSP_HASH_PLACEHOLDER)) {
    throw new Error("production CSP still contains the inline-script hash placeholder");
  }
  if (!scriptSrc.includes("'sha256-")) {
    throw new Error("production script-src has no sha256 hashes");
  }
  if (policy.includes("vercel.live")) {
    throw new Error("production CSP must not allowlist vercel.live");
  }
}

/** @param {string} policy @param {string[]} required */
export function missingScriptHashes(policy, required) {
  const scriptSrc = directiveValue(policy, "script-src");
  return required.filter((hash) => !scriptSrc.includes(hash));
}
