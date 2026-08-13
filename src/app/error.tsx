"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-ink-900">
      <div className="relative mx-auto max-w-2xl px-4 py-32 text-center sm:px-6">
        <p className="t-index text-brand-200">Something went wrong</p>
        <h1 className="font-display mt-5 text-3xl font-bold text-white sm:text-4xl">
          We couldn&apos;t load this page
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-400">
          Please try again. If it keeps happening, head home or request a quote
          and we&apos;ll take it from there.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3.5 sm:flex-row">
          <button type="button" onClick={reset} className="btn-ghost-dark">
            Try again
          </button>
          <Link href="/quote" className="btn-primary">
            Get a free quote
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
