import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/config/site";
import { areas } from "@/data/areas";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileCtaBar } from "@/components/MobileCtaBar";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `Cash for Cars Brisbane & Gold Coast | ${site.name}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `Cash for Cars Brisbane & Gold Coast | ${site.name}`,
    description: site.description,
    url: "/",
    locale: "en_AU",
  },
};

const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: site.name,
  description: site.description,
  url: site.url,
  telephone: site.phone,
  email: site.email,
  areaServed: areas.map((a) => ({ "@type": "City", name: a.short })),
  priceRange: "$$",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU">
      <body className="bg-white font-sans text-slate-800 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        {/* spacer so the sticky mobile bar never covers footer content */}
        <div className="h-20 md:hidden" aria-hidden />
        <MobileCtaBar />
      </body>
    </html>
  );
}
