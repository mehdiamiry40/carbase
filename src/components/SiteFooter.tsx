import Link from "next/link";
import { site, telHref } from "@/config/site";
import { areas } from "@/data/areas";
import { localPages } from "@/data/localPages";
import { ArrowRightIcon, Logo, PhoneIcon } from "@/components/icons";

const columns = [
  {
    title: "Sell your car",
    links: [
      { href: "/quote", label: "Get a free quote" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/faq", label: "Seller FAQs" },
      // Sitewide keyword-anchored links to the local landing pages — the main
      // internal-linking signal pointing at them.
      ...localPages.map((page) => ({
        href: `/${page.slug}`,
        label: page.navLabel,
      })),
    ],
  },
  {
    title: "Carbase",
    links: [
      { href: "/about", label: "About us" },
      { href: "/service-areas", label: "Service areas" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink-900 text-white">
      <div className="border-b border-white/20">
        <div className="shell flex flex-col gap-7 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="t-index text-brand-200">Ready when you are</p>
            <h2 className="mt-3 font-display text-3xl font-medium sm:text-4xl">
              Start with a free, no-obligation quote.
            </h2>
          </div>
          <Link href="/quote" className="btn-primary shrink-0">
            Tell us about your car <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>

      <div className="shell py-14 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.25fr_0.7fr_0.7fr_1.1fr] lg:gap-12">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-7 text-sm leading-relaxed text-white/70">
              A direct, local way to sell old, damaged, non-running and unwanted
              cars throughout the Toowoomba Region.
            </p>
            <a
              href={telHref}
              className="mt-7 inline-flex min-h-11 items-center gap-3 text-xl font-semibold underline decoration-brand-400 underline-offset-8"
            >
              <PhoneIcon className="size-5 text-brand-300" /> {site.phone}
            </a>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={`${column.title}, footer`}>
              <p className="border-b border-white/25 pb-3 font-display text-xl font-semibold">
                {column.title}
              </p>
              <ul className="mt-4">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-sm text-white/70 transition hover:text-brand-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label="Service region, footer">
            <p className="border-b border-white/25 pb-3 font-display text-xl font-semibold">
              Service region
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-x-5 lg:grid-cols-1">
              {areas.map((area) => (
                <li key={area.slug}>
                  <Link
                    href="/service-areas"
                    className="inline-flex min-h-11 items-center text-sm text-white/70 transition hover:text-brand-200"
                  >
                    {area.short}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-white/25 pt-7 text-xs text-white/60 sm:flex-row sm:items-start sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}. ABN {site.abn}. All
            rights reserved.
          </p>
          <p className="max-w-xl sm:text-right">
            Serving Toowoomba city, suburbs and regional communities within the
            Toowoomba Regional Council area.
          </p>
        </div>
      </div>
    </footer>
  );
}
