import { NextResponse, type NextRequest } from "next/server";
import { buildContentSecurityPolicy } from "@/lib/contentSecurityPolicy.mjs";

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const policy = buildContentSecurityPolicy({
    nonce,
    dev: process.env.NODE_ENV === "development",
    // Loopback HTTP cannot follow upgrade-insecure-requests: the browser would
    // rewrite the document's own assets to https and fail them closed.
    upgradeInsecureRequests: upgradeInsecureRequests(request),
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", policy);
  return response;
}

function upgradeInsecureRequests(request: NextRequest) {
  const hostname = request.nextUrl.hostname;
  const forwarded = request.headers.get("x-forwarded-proto");
  const protocol = (forwarded ?? request.nextUrl.protocol).replace(/:$/, "");
  const loopback =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  return !(loopback && protocol !== "https");
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
