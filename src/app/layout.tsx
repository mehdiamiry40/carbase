import type { Metadata, Viewport } from "next";
import { Barlow, Open_Sans } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";
import { businessJsonLd } from "@/lib/structuredData";
import { serializeJsonLd } from "@/lib/jsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileCtaBar } from "@/components/MobileCtaBar";
import { SiteAnalytics } from "@/components/SiteAnalytics";

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
    default: `Sell Your Car Toowoomba | Local Car Buyers | ${site.name}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  alternates: { canonical: "/" },
  applicationName: site.name,
  category: "automotive",
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
    title: `Sell Your Car Toowoomba | Local Car Buyers | ${site.name}`,
    description: site.description,
    url: "/",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: `Sell Your Car Toowoomba | Local Car Buyers | ${site.name}`,
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-ink-900 focus:shadow-lg"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        {/* spacer so the sticky mobile bar never covers footer content */}
        <div className="h-20 bg-ink-950 md:hidden" aria-hidden />
        <MobileCtaBar />
        <SiteAnalytics />
      </body>
    </html>
  );
}
