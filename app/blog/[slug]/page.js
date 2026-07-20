import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllSlugs, getPostBySlug, getRelatedPosts, SITE, postUrl, blogIndexUrl } from '@/lib/blog';
import { getSeriesForPost } from '@/lib/series';
import SeriesBanner from '@/components/SeriesBanner';
import { extractToc } from '@/lib/mdx-options';
import { renderMarkdown } from '@/lib/markdown';
import BlogReadingProgress from '@/components/BlogReadingProgress';
import BlogToc from '@/components/BlogToc';
import BlogShareBar from '@/components/BlogShareBar';
import CodeBlockEnhancer from '@/components/CodeBlockEnhancer';
import NewsletterCTA from '@/components/NewsletterCTA';
import SponsorCallout from '@/components/SponsorCallout';
import AuthorSocials from '@/components/AuthorSocials';
import Comments from '@/components/Comments';

export const dynamicParams = true;

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  const url = postUrl(post.slug);
  const ogImage = post.cover
    ? post.cover.startsWith('http')
      ? post.cover
      : `${SITE.url}${post.cover}`
    : `${SITE.url}${SITE.defaultOgImage}`;
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || undefined,
    keywords: post.tags,
    authors: post.authors.map((a) => ({ name: a.name, url: a.url })),
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.seoTitle || post.title,
      description: post.seoDescription || undefined,
      siteName: SITE.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      publishedTime: post.datePublished,
      authors: post.authors.map((a) => a.name),
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE.twitter,
      title: post.seoTitle || post.title,
      description: post.seoDescription || undefined,
      images: [ogImage],
    },
  };
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function BlogPost({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const toc = extractToc(post.content);
  const rendered = await renderMarkdown(post.content);
  const related = getRelatedPosts(post.slug, 3);
  const seriesInfo = getSeriesForPost(post.slug);
  const url = postUrl(post.slug);
  const ogImage = post.cover
    ? post.cover.startsWith('http')
      ? post.cover
      : `${SITE.url}${post.cover}`
    : `${SITE.url}${SITE.defaultOgImage}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seoDescription || undefined,
    image: [ogImage],
    datePublished: post.datePublished,
    dateModified: post.datePublished,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    author: post.authors.map((a) => ({
      '@type': 'Person',
      '@id': a.url,
      name: a.name,
      url: a.url,
      image: a.avatar?.startsWith('http') ? a.avatar : `${SITE.url}${a.avatar}`,
      sameAs: a.sameAs?.length ? a.sameAs : undefined,
      ...(a.bio ? { description: a.bio } : {}),
    })),
    publisher: {
      '@type': 'Organization',
      '@id': 'https://kubesimplify.com#org',
      name: 'Kubesimplify',
      url: 'https://kubesimplify.com',
      logo: { '@type': 'ImageObject', url: `${SITE.url}/img/color.svg`, width: 64, height: 64 },
      sameAs: [
        'https://www.youtube.com/@kubesimplify',
        'https://x.com/kubesimplify',
        'https://github.com/kubesimplify',
        'https://www.linkedin.com/company/kubesimplify/',
      ],
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: post.tags,
    wordCount: post.words,
    timeRequired: `PT${post.readMinutes}M`,
    articleSection: post.tags[0] || 'Cloud Native',
    about: post.tags.map((t) => ({ '@type': 'Thing', name: t })),
    ...(seriesInfo
      ? {
          isPartOf: {
            '@type': 'CreativeWorkSeries',
            name: seriesInfo.series.name,
            url: `${SITE.url}/series/${seriesInfo.series.slug}`,
            numberOfItems: seriesInfo.total,
          },
          position: seriesInfo.position,
        }
      : {}),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: blogIndexUrl() },
      { '@type': 'ListItem', position: 2, name: post.title, item: url },
    ],
  };

  const editUrl = `https://github.com/${SITE.githubRepo}/blob/main/content/blog/${post.slug}.md`;

  return (
    <>
      <BlogReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm">
            <Link href="/blog" className="text-[var(--accent)] hover:underline">
              &larr; All posts
            </Link>
          </nav>

          <article
            className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,42rem)_1fr] gap-8"
            data-pagefind-body
            data-pagefind-meta={`title:${post.title}, author:${post.author.name}, date:${post.datePublished}, slug:${post.slug}, cover[src]:${post.cover || ''}, read:${post.readMinutes} min`}
            data-pagefind-filter={`tag:${post.tags.join(',')}`}
            itemScope
            itemType="https://schema.org/BlogPosting"
          >
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <BlogShareBar url={url} title={post.title} />
              </div>
            </aside>

            <div className="min-w-0">
              <header className="mb-10">
                <div className="flex flex-wrap gap-2 mb-5">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog/tag/${encodeURIComponent(tag)}`}
                      className="px-2.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider hover:bg-[var(--accent)]/20 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
                <h1
                  className="text-4xl md:text-5xl font-bold leading-tight mb-6"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {post.title}
                </h1>
                {post.seoDescription && (
                  <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                    {post.seoDescription}
                  </p>
                )}
                <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex -space-x-2">
                    {post.authors.map((a) => (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={a.handle}
                        src={a.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full ring-2"
                        style={{ '--tw-ring-color': 'var(--bg-base)' }}
                      />
                    ))}
                  </div>
                  <div>
                    {post.authors.map((a, i) => (
                      <span key={a.handle}>
                        {i > 0 && <span className="mx-1">&amp;</span>}
                        <Link
                          href={`/blog/author/${a.handle}`}
                          className="font-semibold hover:text-[var(--accent)] transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {a.name}
                        </Link>
                      </span>
                    ))}
                    <span className="mx-2">·</span>
                    <time dateTime={post.datePublished}>{formatDate(post.datePublished)}</time>
                    <span className="mx-2">·</span>
                    <span>{post.readMinutes} min read</span>
                  </div>
                </div>

                <div className="md:hidden mt-6">
                  <BlogShareBar url={url} title={post.title} />
                </div>
              </header>

              {post.cover && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={post.cover}
                  alt={`Cover image for ${post.title}`}
                  className="w-full rounded-xl md:rounded-2xl mb-8 md:mb-10 border"
                  style={{ borderColor: 'var(--border-subtle)' }}
                  fetchPriority="high"
                  itemProp="image"
                />
              )}

              <SponsorCallout sponsor={post.sponsor} variant="cta" />

              <SeriesBanner info={seriesInfo} />

              {/* Mobile TOC (desktop has it in the right sidebar) */}
              {toc.length > 2 && (
                <details className="lg:hidden mb-8 rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                  <summary className="cursor-pointer text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    On this page ({toc.length})
                  </summary>
                  <ul className="mt-3 space-y-1.5 text-sm border-l" style={{ borderColor: 'var(--border-subtle)' }}>
                    {toc.map((h) => (
                      <li key={h.id} style={{ paddingLeft: `${(h.depth - 2) * 12 + 12}px` }}>
                        <a href={`#${h.id}`} className="block py-0.5 hover:text-[var(--accent)]" style={{ color: 'var(--text-secondary)' }}>
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              <div className="prose-blog">{rendered}</div>

              <CodeBlockEnhancer />

              <hr className="my-12" style={{ borderColor: 'var(--border-subtle)' }} />

              <SponsorCallout sponsor={post.sponsor} variant="cta" />

              {post.authors.map((a) => (
                <section key={a.handle} className="glass-card rounded-2xl p-6 mb-10 flex items-start gap-4 flex-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.avatar} alt="" className="w-14 h-14 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/blog/author/${a.handle}`}
                      className="font-bold mb-1 inline-block hover:text-[var(--accent)] transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {a.name}
                    </Link>
                    {a.bio && (
                      <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                        {a.bio}
                      </p>
                    )}
                    <AuthorSocials socials={a.socials} />
                  </div>
                </section>
              ))}

              <NewsletterCTA variant="inline" />

              <p className="text-sm mb-10 mt-10" style={{ color: 'var(--text-muted)' }}>
                Spotted a typo or want to improve this post?{' '}
                <a
                  href={editUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] font-semibold hover:underline"
                >
                  Edit on GitHub &rarr;
                </a>
              </p>

              <Comments />

              {related.length > 0 && (
                <section className="mt-12">
                  <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                    Related posts
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {related.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/blog/${p.slug}`}
                        className="glass-card rounded-xl p-4 transition-all hover:-translate-y-1"
                      >
                        <p
                          className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] mb-2"
                        >
                          {p.tags[0] || 'Article'}
                        </p>
                        <p
                          className="font-semibold leading-snug mb-2 line-clamp-3"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {p.title}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {p.readMinutes} min read
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                <BlogToc toc={toc} />
              </div>
            </aside>
          </article>
        </div>
      </main>
    </>
  );
}
