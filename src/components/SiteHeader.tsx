"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site, telHref } from "@/config/site";
import { ArrowRightIcon, Logo, MenuIcon, XIcon } from "@/components/icons";

const navLinks = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/service-areas", label: "Service areas" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQs" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-white text-ink-900">
      <div className={scrolled || open ? "border-b hair" : "border-b border-transparent"}>
        <div className="shell flex h-[72px] items-center justify-between gap-4 lg:h-24">
          <Link href="/" aria-label="Carbase home" onClick={() => setOpen(false)}>
            <Logo onLight />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-12 items-center border-b text-sm transition-colors hover:border-brand-600 hover:text-brand-700 ${active ? "border-brand-600 font-semibold text-brand-700" : "border-transparent font-medium"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <a href={telHref} className="hidden min-h-11 items-center text-sm font-semibold underline underline-offset-4 min-[520px]:inline-flex">
              {site.phone}
            </a>
            <Link href="/quote" className="btn-primary hidden min-h-12 px-6 py-2 text-sm sm:inline-flex">
              Get a quote
            </Link>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={open ? "Close navigation" : "Open navigation"}
              className="flex size-11 items-center justify-center lg:hidden"
            >
              {open ? <XIcon className="size-6" /> : <MenuIcon className="size-6" />}
            </button>
          </div>
        </div>
      </div>

      <div id="mobile-navigation" hidden={!open} className="border-b hair bg-white lg:hidden">
        <nav aria-label="Mobile navigation" className="shell py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between border-b hair py-4 font-medium text-slate-700"
            >
              {link.label}
              <ArrowRightIcon className="size-5" />
            </Link>
          ))}
          <Link href="/quote" onClick={() => setOpen(false)} className="btn-primary my-6 w-full">
            Get a free quote
          </Link>
        </nav>
      </div>
    </header>
  );
}
