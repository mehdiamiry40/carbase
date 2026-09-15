import Link from "next/link";
import { ArrowRightIcon, ClockIcon, SparkleIcon } from "@/components/icons";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { CtaBanner, PageHero, SectionHeading } from "@/components/sections";
import { site } from "@/config/site";
import { blogPosts, formatBlogDate } from "@/data/blogPosts";
import { serializeJsonLd } from "@/lib/jsonLd";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  path: "/blog",
  title: "Car Selling Guides & Tips | Brisbane",
  description:
    "Practical Carbase guides for selling old, damaged, non-running and unwanted cars in Brisbane.",
});

const [featuredPost, ...morePosts] = blogPosts;

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": site.url + "/blog#blog",
  name: "Carbase car selling guides",
  description:
    "Practical guides for selling old, damaged, non-running and unwanted cars in Brisbane.",
  url: site.url + "/blog",
  inLanguage: "en-AU",
  publisher: { "@id": site.url + "/#business" },
  blogPost: blogPosts.map((post) => ({
    "@type": "BlogPosting",
    "@id": site.url + "/blog/" + post.slug + "#article",
    headline: post.title,
    url: site.url + "/blog/" + post.slug,
    datePublished: post.publishedOn,
    dateModified: post.updatedOn,
  })),
};

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogJsonLd) }}
      />
      <PageHero
        eyebrow="Carbase guides"
        title={
          <>
            Straight answers for selling an{" "}
            <span className="text-gradient">unwanted car</span>
          </>
        }
        lede="Practical, plain-English guides to help Brisbane owners understand their options, prepare a vehicle and avoid preventable surprises."
        photoName="junkyard"
        photoAlt="Damaged and unwanted cars in an automotive yard"
      />

      <section className="bg-white py-20 lg:py-28">
        <div className="shell">
          <Reveal>
            <div className="section-rule">
              <span>Featured guide</span>
              <span>01</span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <article className="mt-10 border border-slate-200 bg-slate-50 shadow-card">
              <Link
                href={"/blog/" + featuredPost.slug}
                className="group grid lg:grid-cols-[1.18fr_0.82fr]"
              >
                <div className="relative min-h-72 overflow-hidden sm:min-h-96 lg:min-h-[31rem]">
                  <Photo
                    name={featuredPost.photoName}
                    alt={featuredPost.photoAlt}
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="transition duration-500 group-hover:scale-[1.025]"
                  />
                  <span className="photo-scrim-soft" aria-hidden />
                  <span className="t-index absolute bottom-6 left-6 bg-white px-4 py-2 text-brand-700 sm:bottom-8 sm:left-8">
                    {featuredPost.category}
                  </span>
                </div>

                <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-slate-500">
                    <time dateTime={featuredPost.publishedOn}>
                      {formatBlogDate(featuredPost.publishedOn)}
                    </time>
                    <span className="inline-flex items-center gap-2">
                      <ClockIcon className="size-4 text-brand-600" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                  <h2 className="font-display mt-5 text-3xl font-semibold leading-tight text-balance text-ink-900 sm:text-[2.6rem]">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
                    {featuredPost.excerpt}
                  </p>
                  <span className="mt-8 inline-flex items-center gap-2 font-bold text-brand-700">
                    Read the guide
                    <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1.5" />
                  </span>
                </div>
              </Link>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-slate-50 py-20 lg:py-28">
        <div className="shell">
          <Reveal>
            <SectionHeading
              eyebrow="Latest advice"
              title="Useful before you request a quote"
              lede="Clear information for the decisions that usually come first: whether to repair, what affects value and how to get ready for collection."
            />
          </Reveal>

          <div className="mt-14 grid gap-7 md:grid-cols-2">
            {morePosts.map((post, index) => (
              <Reveal key={post.slug} delay={index * 100} className="h-full">
                <article className="h-full border border-slate-200 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-card-lg">
                  <Link
                    href={"/blog/" + post.slug}
                    className="group flex h-full flex-col"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-200">
                      <Photo
                        name={post.photoName}
                        alt={post.photoAlt}
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-7 sm:p-8">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="t-index text-brand-700">
                          {post.category}
                        </span>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                          <ClockIcon className="size-4 text-brand-600" />
                          {post.readTime}
                        </span>
                      </div>
                      <h2 className="font-display mt-5 text-2xl font-semibold leading-tight text-ink-900 sm:text-3xl">
                        {post.title}
                      </h2>
                      <p className="mt-4 flex-1 leading-relaxed text-slate-600">
                        {post.excerpt}
                      </p>
                      <span className="mt-7 inline-flex items-center gap-2 font-bold text-brand-700">
                        Read guide
                        <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1.5" />
                      </span>
                    </div>
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-brand-200 bg-brand-50 py-14">
        <div className="shell grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
          <span className="flex size-12 items-center justify-center bg-brand-600 text-white">
            <SparkleIcon className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink-900">
              Looking for the selling process?
            </h2>
            <p className="mt-1 text-slate-600">
              See each step from sharing vehicle details to arranging pickup.
            </p>
          </div>
          <Link href="/how-it-works" className="btn-ghost-light">
            How it works <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </section>

      <div className="bg-white py-20 lg:py-28">
        <div className="shell">
          <CtaBanner title="Ready for a quote on your car?" />
        </div>
      </div>
    </>
  );
}
