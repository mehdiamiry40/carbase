import Link from "next/link";
import { blogPosts, getBlogPost, type BlogPost } from "@/data/blogPosts";
import { ArrowRightIcon } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/sections";

const allGuideSlugs = blogPosts.map((post) => post.slug);

export function GuideLinks({
  eyebrow = "Car selling guides",
  title = "Helpful reading before you sell",
  lede = "Plain-English guidance for understanding your options, preparing the car and making the next step easier.",
  postSlugs = allGuideSlugs,
}: {
  eyebrow?: string;
  title?: string;
  lede?: string;
  postSlugs?: readonly string[];
}) {
  const posts = postSlugs
    .map(getBlogPost)
    .filter((post): post is BlogPost => post !== undefined);

  return (
    <section className="border-y border-brand-200 bg-brand-50 py-16 lg:py-24">
      <div className="shell">
        <Reveal>
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            lede={lede}
            align="left"
          />
        </Reveal>

        <ul
          className={`mt-12 grid gap-5 ${posts.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2"}`}
        >
          {posts.map((post, index) => (
            <li key={post.slug}>
              <Reveal delay={index * 80} className="h-full">
                <Link
                  href={"/blog/" + post.slug}
                  className="group flex h-full flex-col border border-brand-200 bg-white p-7 shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-400 hover:shadow-card-lg sm:p-8"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="t-index text-brand-700">
                      {post.category}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold leading-tight text-ink-900 group-hover:text-brand-700">
                    {post.title}
                  </h3>
                  <p className="mt-4 flex-1 leading-relaxed text-slate-600">
                    {post.excerpt}
                  </p>
                  <span className="mt-7 inline-flex items-center gap-2 font-bold text-brand-700">
                    Read this guide
                    <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1.5" />
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>

        <Link
          href="/blog"
          className="mt-9 inline-flex items-center gap-2 font-semibold text-brand-700 underline underline-offset-4"
        >
          Browse all Carbase guides
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </section>
  );
}
