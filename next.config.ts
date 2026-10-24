import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildContentSecurityPolicy, buildDevContentSecurityPolicy } from "./src/lib/csp-policy.mjs";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Production script hashes are unknown until prerender finishes. The placeholder
// is replaced in the build output by scripts/csp-hashes.mjs. On Vercel that is
// too late for the header the CDN serves: the Next adapter copies it into
// `.next/output/config.json` during onBuildComplete, while `next build` is still
// running. scripts/csp-adapter.mjs wraps that adapter and writes the hashes first.
// Development cannot use those hashes.
const contentSecurityPolicy =
  process.env.NODE_ENV === "development" ? buildDevContentSecurityPolicy() : buildContentSecurityPolicy([]);

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

// URLs from the period when Carbase served the Toowoomba Region. Kept only so
// indexed links and inbound traffic land on the Brisbane equivalent instead of
// a 404 — the site itself no longer links to or advertises these paths.
const legacyRegionRedirects = [
  { from: "/cash-for-cars-toowoomba", to: "/cash-for-cars-brisbane" },
  { from: "/car-removal-toowoomba", to: "/car-removal-brisbane" },
  { from: "/service-areas/toowoomba", to: "/service-areas" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: { root: projectRoot },
  // Vercel sets NEXT_ADAPTER_PATH to its own adapter. Wrap it so the routing
  // object it serialises already contains the real script hashes.
  ...(process.env.NEXT_ADAPTER_PATH
    ? { adapterPath: path.join(projectRoot, "scripts/csp-adapter.mjs") }
    : {}),
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // Quote intake and the authenticated outbox worker stay uncached.
      // Public HTML is prerendered, so Vercel caches that with
      // `public, max-age=0, must-revalidate` without a header here.
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
    ];
  },
  async redirects() {
    return legacyRegionRedirects.map(({ from, to }) => ({
      source: from,
      destination: to,
      permanent: true,
    }));
  },
  images: {
    qualities: [75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-**",
        search: "?fm=jpg&q=78&w=2600&auto=format&fit=crop",
      },
    ],
  },
};

export default nextConfig;
