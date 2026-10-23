// Per-request Content-Security-Policy for HTML documents.
// Next.js reads the nonce from the script-src directive during rendering, so
// that directive must be the first script-src* directive in the header.

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

export function buildContentSecurityPolicy({
  nonce,
  dev = false,
  upgradeInsecureRequests = true,
}) {
  if (!nonce) {
    throw new Error("CSP nonce is required");
  }

  const scriptSrc = [
    "script-src",
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    "https://www.googletagmanager.com",
  ];
  if (dev) scriptSrc.push("'unsafe-eval'");

  // Production keeps 'unsafe-inline' off style elements. React and next/image
  // still emit style attributes, which cannot carry a nonce, so those are
  // allowed only through style-src-attr.
  const styleSrc = dev
    ? "style-src 'self' 'unsafe-inline'"
    : `style-src 'self' 'nonce-${nonce}'`;

  const directives = [
    "default-src 'self'",
    scriptSrc.join(" "),
    // Must follow script-src. Next parses the first script-src* directive for the nonce.
    "script-src-attr 'none'",
    styleSrc,
    "style-src-attr 'unsafe-inline'",
    `img-src 'self' blob: ${GOOGLE_ANALYTICS_IMG.join(" ")}`,
    "font-src 'self'",
    `connect-src 'self' ${GOOGLE_ANALYTICS_CONNECT.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "worker-src 'none'",
  ];

  if (upgradeInsecureRequests) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}
