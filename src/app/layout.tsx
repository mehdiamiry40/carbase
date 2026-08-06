import type { Metadata, Viewport } from "next";
import { Barlow, Open_Sans } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";
import { businessJsonLd } from "@/lib/structuredData";
import { serializeJsonLd } from "@/lib/jsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileCtaBar } from "@/components/MobileCtaBar";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `Cash for Cars Brisbane, Gold Coast & Toowoomba | ${site.name}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  alternates: { canonical: "/" },
  applicationName: site.name,
  category: "automotive",
  keywords: [
    "cash for cars Toowoomba",
    "car removal Toowoomba",
    "cash for cars Brisbane",
    "cash for cars Gold Coast",
    "cash for junk cars Brisbane",
    "old car removal Brisbane",
    "damaged car buyers Gold Coast",
    "sell my car Brisbane",
    "car buyer Brisbane",
    "free car removal Brisbane",
    "free car removal Toowoomba",
    "sell damaged car Queensland",
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `Cash for Cars Brisbane, Gold Coast & Toowoomba | ${site.name}`,
    description: site.description,
    url: "/",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: `Cash for Cars Brisbane, Gold Coast & Toowoomba | ${site.name}`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  // Matches the navy tile the logo mark sits in.
  themeColor: "#0a2f68",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${site.url}/#website`,
  name: site.name,
  url: site.url,
  inLanguage: "en-AU",
  publisher: { "@id": `${site.url}/#business` },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className={`${openSans.variable} ${barlow.variable}`}>
      <body className="bg-white font-sans text-ink-900 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(businessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
        />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        {/* spacer so the sticky mobile bar never covers footer content */}
        <div className="h-20 bg-ink-950 md:hidden" aria-hidden />
        <MobileCtaBar />
      </body>
    </html>
  );
}
