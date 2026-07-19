"use client";

import Link from "next/link";
import { useState } from "react";
import { site, telHref } from "@/config/site";
import { Logo, MenuIcon, PhoneIcon, XIcon } from "@/components/icons";

const navLinks = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/service-areas", label: "Areas we cover" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Carbase — home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={telHref}
            className="hidden items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-brand-700 md:inline-flex"
          >
            <PhoneIcon className="size-4 text-brand-600" />
            {site.phone}
          </a>
          <Link
            href="/quote"
            className="hidden rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 sm:inline-block"
          >
            Get a free quote
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            {open ? <MenuClose /> : <MenuIcon className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Mobile"
          className="border-t border-slate-200 bg-white px-4 pt-2 pb-4 lg:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-4">
            <Link
              href="/quote"
              onClick={() => setOpen(false)}
              className="rounded-full bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              Get a free quote
            </Link>
            <a
              href={telHref}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <PhoneIcon className="size-4 text-brand-600" />
              Call {site.phone}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

function MenuClose() {
  return <XIcon className="size-6" />;
}
