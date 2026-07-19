import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-ink-900">
      <div className="bg-dots-dark absolute inset-0" aria-hidden />
      <div
        className="absolute -top-40 left-1/2 h-[28rem] w-[48rem] -translate-x-1/2 rounded-full bg-brand-600/20 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-2xl px-4 py-32 text-center sm:px-6">
        <p className="font-display text-7xl font-bold tracking-tight sm:text-8xl">
          <span className="text-gradient">404</span>
        </p>
        <h1 className="font-display mt-4 text-2xl font-bold text-white sm:text-3xl">
          That page has driven off
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-400">
          The page you&apos;re after doesn&apos;t exist — but your free quote is
          only a couple of clicks away.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3.5 sm:flex-row">
          <Link href="/" className="btn-ghost-dark">
            Back to home
          </Link>
          <Link href="/quote" className="btn-primary">
            Get a free quote
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
