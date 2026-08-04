import Link from "next/link";
import { site, telHref } from "@/config/site";
import { areas } from "@/data/areas";
import { Logo } from "@/components/icons";

const columns = [
  {
    title: "Sell your car",
    links: [
      { href: "/quote", label: "Get a free quote" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/faq", label: "Seller FAQs" },
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
    <footer className="border-t border-white/20 bg-ink-900 text-white">
      <div className="shell py-16 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.25fr_0.75fr_0.75fr_1.1fr] lg:gap-10">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-7 text-sm leading-relaxed text-brand-200">
              A direct, local way to sell cars of any make, model or condition across South East Queensland.
            </p>
            <a href={telHref} className="mt-6 inline-flex min-h-11 items-center text-xl font-semibold underline underline-offset-4">
              {site.phone}
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
                    <Link href={link.href} className="inline-flex min-h-11 items-center text-sm text-brand-200 transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label="Popular service areas, footer">
            <p className="border-b border-white/25 pb-3 font-display text-xl font-semibold">
              Service areas
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-x-5 lg:grid-cols-1">
              {areas.map((area) => (
                <li key={area.slug}>
                  <Link href={`/service-areas/${area.slug}`} className="inline-flex min-h-11 items-center text-sm text-brand-200 transition hover:text-white">
                    Cash for cars {area.short}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-white/25 pt-7 text-xs text-brand-200 sm:flex-row sm:items-start sm:justify-between">
          <p>© {new Date().getFullYear()} {site.legalName}. All rights reserved.</p>
          <p className="max-w-xl sm:text-right">Serving Brisbane, the Gold Coast, Logan, Ipswich, Redlands and Moreton Bay.</p>
        </div>
      </div>
    </footer>
  );
}
