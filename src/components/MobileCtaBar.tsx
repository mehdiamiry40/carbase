import Link from "next/link";
import { telHref } from "@/config/site";
import { PhoneIcon } from "@/components/icons";

/** Sticky call/quote bar shown on small screens only. */
export function MobileCtaBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md gap-3">
        <a
          href={telHref}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-brand-600 px-4 py-3 text-sm font-semibold text-brand-700"
        >
          <PhoneIcon className="size-4" />
          Call now
        </a>
        <Link
          href="/quote"
          className="flex flex-1 items-center justify-center rounded-full bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm"
        >
          Get a free quote
        </Link>
      </div>
    </div>
  );
}
