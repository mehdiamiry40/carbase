"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site, telHref } from "@/config/site";
import {
  ArrowRightIcon,
  Logo,
  MenuIcon,
  PhoneIcon,
  XIcon,
} from "@/components/icons";

const serviceLinks = [
  { href: "/cash-for-cars-brisbane", label: "Cash for cars" },
  { href: "/car-removal-brisbane", label: "Car removal" },
];

const desktopNavLinks = [
  ...serviceLinks,
  { href: "/service-areas", label: "Service areas" },
  { href: "/how-it-works", label: "How it works" },
];

const mobileNavLinks = [
  ...desktopNavLinks,
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQs" },
  { href: "/blog", label: "Guides" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(min-width: 64rem)");
    const closeOnDesktop = () => {
      if (!desktop.matches) return;
      const activeElement = document.activeElement;
      if (
        activeElement === toggleRef.current ||
        panelRef.current?.contains(activeElement)
      ) {
        const href = activeElement?.getAttribute("href");
        const links = Array.from(headerRef.current?.querySelectorAll("a") ?? []);
        const destination = links.find(
          (link) => link.getAttribute("href") === href && link.getClientRects().length,
        );
        (destination ?? links[0])?.focus();
      }
      setOpen(false);
    };
    closeOnDesktop();
    desktop.addEventListener("change", closeOnDesktop);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      onBlur={(event) => {
        if (open && !event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
      className={`sticky top-0 z-50 bg-white text-ink-900 transition-shadow ${scrolled || open ? "shadow-md shadow-ink-950/10" : ""}`}
    >
      <div className="hidden bg-ink-900 text-white lg:block">
        <div className="shell flex min-h-9 items-center justify-end gap-8 text-xs font-semibold">
          <span>{site.serviceRegion}</span>
          <span className="text-white/35">|</span>
          <Link href="/about" className="transition hover:text-brand-200">
            About
          </Link>
          <Link href="/faq" className="transition hover:text-brand-200">
            Seller FAQs
          </Link>
          <Link href="/blog" className="transition hover:text-brand-200">
            Guides
          </Link>
          <a
            href={telHref}
            className="inline-flex items-center gap-2 transition hover:text-brand-200"
          >
            <PhoneIcon className="size-3.5" /> {site.phone}
          </a>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <div className="shell flex h-[76px] items-center justify-between gap-5 lg:h-[88px]">
          <Link
            href="/"
            aria-label="Carbase home"
            onClick={() => setOpen(false)}
          >
            <Logo onLight />
          </Link>

          <nav
            className="hidden h-full items-stretch lg:flex"
            aria-label="Main navigation"
          >
            {desktopNavLinks.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-w-32 items-center justify-center border-x border-l-0 border-slate-200 px-6 text-sm transition-colors hover:bg-brand-50 hover:text-brand-700 ${active ? "bg-brand-50 font-bold text-brand-700" : "font-semibold"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/quote"
              className="btn-primary hidden min-h-12 px-6 py-2 text-sm sm:inline-flex"
            >
              Get a free quote <ArrowRightIcon className="size-4" />
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
              {open ? (
                <XIcon className="size-6" />
              ) : (
                <MenuIcon className="size-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        ref={panelRef}
        id="mobile-navigation"
        hidden={!open}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-77px)] scroll-py-3 overflow-y-auto overscroll-contain border-b border-slate-200 bg-white lg:hidden"
      >
        <nav aria-label="Mobile navigation" className="shell py-2">
          {mobileNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between border-b border-slate-200 py-4 font-semibold text-ink-900"
            >
              {link.label}
              <ArrowRightIcon className="size-5 text-brand-600" />
            </Link>
          ))}
          <a
            href={telHref}
            onClick={() => setOpen(false)}
            className="btn-ghost-light mt-5 w-full"
          >
            <PhoneIcon className="size-4" /> Call {site.phone}
          </a>
          <Link
            href="/quote"
            onClick={() => setOpen(false)}
            className="btn-primary my-3 w-full focus-visible:outline-ink-900"
          >
            Get a free quote
          </Link>
        </nav>
      </div>
    </header>
  );
}
