import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, ClockIcon } from "@/components/icons";
import { Photo } from "@/components/Photo";
import { CtaBanner, PageHero } from "@/components/sections";
import { site } from "@/config/site";
import { blogPosts, formatBlogDate, getBlogPost } from "@/data/blogPosts";
import { photoSrc } from "@/data/photos";
import { serializeJsonLd } from "@/lib/jsonLd";
import { pageMetadata } from "@/lib/metadata";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const metadata = pageMetadata({
    path: "/blog/" + post.slug,
    title: post.title,
    description: post.excerpt,
  });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: post.publishedOn,
      modifiedTime: post.updatedOn,
      authors: [site.name],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const relatedPosts = blogPosts.filter((item) => item.slug !== post.slug);
  const postUrl = site.url + "/blog/" + post.slug;
  const postJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": postUrl + "#article",
        mainEntityOfPage: postUrl,
        headline: post.title,
        description: post.excerpt,
        image: {
          "@type": "ImageObject",
          url: photoSrc(post.photoName),
          caption: post.photoAlt,
        },
        datePublished: post.publishedOn,
        dateModified: post.updatedOn,
        author: { "@id": site.url + "/#business" },
        publisher: { "@id": site.url + "/#business" },
        isPartOf: { "@id": site.url + "/blog#blog" },
        inLanguage: "en-AU",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: site.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Car selling guides",
            item: site.url + "/blog",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: postUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(postJsonLd) }}
      />
      <PageHero
        eyebrow={post.category}
        title={post.title}
        lede={post.excerpt}
        compact
        photoName={post.photoName}
        photoAlt={post.photoAlt}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/blog", label: "Guides" },
          { href: "/blog/" + post.slug, label: post.title },
        ]}
      >
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/35 pt-5 text-sm font-semibold text-white">
          <time dateTime={post.publishedOn}>
            {formatBlogDate(post.publishedOn)}
          </time>
          <span className="inline-flex items-center gap-2">
            <ClockIcon className="size-4 text-brand-200" /> {post.readTime}
          </span>
        </div>
      </PageHero>

      <article className="bg-white py-20 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
          <div className="min-w-0">
            <p className="font-display border-l-4 border-brand-600 pl-6 text-2xl font-medium leading-relaxed text-ink-900 sm:text-[1.75rem]">
              {post.takeaway}
            </p>

            <div className="mt-14 space-y-14">
              {post.sections.map((section, sectionIndex) => (
                <section key={section.id} id={section.id}>
                  <p className="t-index text-brand-700">
                    {String(sectionIndex + 1).padStart(2, "0")}
                  </p>
                  <h2 className="font-display mt-3 text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
                    {section.title}
                  </h2>
                  <div className="mt-6 space-y-5 text-[1.04rem] leading-8 text-slate-700">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  {section.points && (
                    <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                      {section.points.map((point) => (
                        <li
                          key={point}
                          className="flex gap-3 border border-brand-200 bg-brand-50 px-4 py-3.5 text-sm font-semibold leading-relaxed text-ink-900"
                        >
                          <span
                            className="mt-2 size-1.5 shrink-0 bg-brand-600"
                            aria-hidden
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.note && (
                    <aside className="mt-7 border-l-4 border-ink-900 bg-slate-100 px-6 py-5 text-[15px] font-semibold leading-relaxed text-ink-900">
                      {section.note}
                    </aside>
                  )}
                </section>
              ))}
            </div>
          </div>

          <aside className="lg:sticky lg:top-36 lg:self-start">
            <div className="border border-slate-200 bg-slate-50 p-6">
              <p className="t-index text-brand-700">In this guide</p>
              <nav aria-label="Article contents">
                <ol className="mt-4 divide-y divide-slate-200">
                  {post.sections.map((section, index) => (
                    <li key={section.id}>
                      <a
                        href={"#" + section.id}
                        className="group flex min-h-12 items-center gap-3 py-3 text-sm font-semibold leading-snug text-ink-900 transition hover:text-brand-700"
                      >
                        <span className="font-mono text-xs text-brand-600">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>

            <div className="mt-5 bg-ink-900 p-6 text-white">
              <p className="font-display text-xl font-semibold">
                Want a quote instead?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                Tell us about an old, damaged or unwanted car in the Toowoomba
                Region.
              </p>
              <Link href="/quote" className="btn-primary mt-5 w-full px-4">
                Start my quote <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </aside>
        </div>
      </article>

      <section className="border-t border-slate-200 bg-slate-50 py-20 lg:py-24">
        <div className="shell">
          <div className="section-rule">
            <span>Keep reading</span>
            <span>Related</span>
          </div>
          <div className="mt-10 grid gap-7 md:grid-cols-2">
            {relatedPosts.map((related) => (
              <article
                key={related.slug}
                className="border border-slate-200 bg-white shadow-card"
              >
                <Link
                  href={"/blog/" + related.slug}
                  className="group grid h-full sm:grid-cols-[11rem_1fr]"
                >
                  <div className="relative min-h-48 overflow-hidden bg-slate-200 sm:min-h-full">
                    <Photo
                      name={related.photoName}
                      alt={related.photoAlt}
                      sizes="(min-width: 768px) 176px, 100vw"
                      className="transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-6">
                    <p className="t-index text-brand-700">{related.category}</p>
                    <h2 className="font-display mt-3 text-xl font-semibold leading-snug text-ink-900">
                      {related.title}
                    </h2>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-700">
                      Read next
                      <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-white py-20 lg:py-28">
        <div className="shell">
          <CtaBanner title="Have a car you are ready to sell?" />
        </div>
      </div>
    </>
  );
}
