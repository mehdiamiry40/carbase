import Link from "next/link";
import { telHref } from "@/config/site";
import { PhoneIcon } from "@/components/icons";

/** Sticky call/quote bar shown on small screens only. */
export function MobileCtaBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-900/90 p-3 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md gap-3">
        <a
          href={telHref}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
        >
          <PhoneIcon className="size-4 text-accent-400" />
          Call now
        </a>
        <Link
          href="/quote"
          className="flex flex-1 items-center justify-center rounded-full bg-linear-to-r from-brand-600 to-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-glow-sm"
        >
          Get a free quote
        </Link>
      </div>
    </div>
  );
}
