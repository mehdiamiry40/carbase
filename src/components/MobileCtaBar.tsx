import Link from "next/link";
import { telHref } from "@/config/site";
import { PhoneIcon } from "@/components/icons";

/** Sticky call/quote bar shown on small screens only. */
export function MobileCtaBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/20 bg-ink-900/95 p-3 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md gap-3">
        <a
          href={telHref}
          className="flex flex-1 items-center justify-center gap-2 border border-white bg-transparent px-4 py-3 text-sm font-semibold text-white"
        >
          <PhoneIcon className="size-4 text-accent-400" />
          Call now
        </a>
        <Link
          href="/quote"
          className="flex flex-1 items-center justify-center bg-white px-4 py-3 text-sm font-semibold text-ink-900"
        >
          Get a free quote
        </Link>
      </div>
    </div>
  );
}
