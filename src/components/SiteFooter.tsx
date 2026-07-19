import Link from "next/link";
import { site, telHref } from "@/config/site";
import { areas } from "@/data/areas";
import { ClockIcon, Logo, MapPinIcon, PhoneIcon } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-ink-950 text-slate-400">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-brand-600/10 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              {site.description}
            </p>
            <Link href="/quote" className="btn-primary mt-7 !px-6 !py-3 text-sm">
              Get my free quote
            </Link>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold tracking-wider text-white uppercase">
              Explore
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                { href: "/quote", label: "Get a free quote" },
                { href: "/how-it-works", label: "How it works" },
                { href: "/about", label: "About us" },
                { href: "/faq", label: "FAQ" },
                { href: "/privacy", label: "Privacy policy" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold tracking-wider text-white uppercase">
              Areas
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {areas.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/service-areas/${a.slug}`}
                    className="transition hover:text-white"
                  >
                    Cash for cars {a.short}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold tracking-wider text-white uppercase">
              Contact
            </h3>
            <ul className="mt-5 space-y-3.5 text-sm">
              <li>
                <a
                  href={telHref}
                  className="inline-flex items-center gap-2.5 text-base font-semibold text-white transition hover:text-brand-300"
                >
                  <PhoneIcon className="size-4 text-accent-400" />
                  {site.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-2.5 transition hover:text-white"
                >
                  <MailGlyph />
                  {site.email}
                </a>
              </li>
              <li className="inline-flex items-center gap-2.5">
                <ClockIcon className="size-4 text-accent-400" />
                {site.hours}
              </li>
              <li className="inline-flex items-start gap-2.5">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-accent-400" />
                {site.serviceRegion}
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-white/8 py-7 text-xs text-slate-500 md:flex-row">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <p>{site.abn}</p>
        </div>
      </div>
    </footer>
  );
}

function MailGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 text-accent-400"
      aria-hidden
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
