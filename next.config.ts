import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// CSP is applied per request from src/proxy.ts so each document gets a unique
// script nonce. Keeping a second policy here would make browsers enforce both.
const securityHeaders = [
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
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
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
