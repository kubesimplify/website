import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogCard from '@/components/BlogCard';
import AuthorSocials from '@/components/AuthorSocials';
import { getAllAuthors, getPostsByAuthor, SITE, authorUrl } from '@/lib/blog';

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllAuthors().map((a) => ({ handle: a.handle }));
}

export async function generateMetadata({ params }) {
  const author = getAllAuthors().find((a) => a.handle === params.handle);
  if (!author) return {};
  const description = author.bio || `${author.postCount || 0} articles on the Kubesimplify blog by ${author.name}.`;
  return {
    title: `${author.name} · Kubesimplify Blog`,
    description,
    alternates: { canonical: authorUrl(author.handle) },
    openGraph: {
      type: 'profile',
      url: authorUrl(author.handle),
      title: `${author.name} · Kubesimplify Blog`,
      description,
      images: author.avatar ? [{ url: author.avatar.startsWith('http') ? author.avatar : `${SITE.url}${author.avatar}` }] : [],
    },
  };
}

export default function AuthorPage({ params }) {
  const author = getAllAuthors().find((a) => a.handle === params.handle);
  if (!author) notFound();
  const posts = getPostsByAuthor(author.handle);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    inLanguage: 'en-US',
    isPartOf: { '@type': 'Blog', '@id': SITE.url, name: SITE.name },
    mainEntity: {
      '@type': 'Person',
      '@id': authorUrl(author.handle),
      name: author.name,
      url: authorUrl(author.handle),
      image: author.avatar?.startsWith('http') ? author.avatar : `${SITE.url}${author.avatar}`,
      description: author.bio || `Contributor on the Kubesimplify blog (${posts.length} posts).`,
      sameAs: author.sameAs?.length ? author.sameAs : undefined,
      jobTitle: 'Contributor',
      worksFor: {
        '@type': 'Organization',
        name: 'Kubesimplify',
        url: 'https://kubesimplify.com',
      },
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Blog', item: SITE.url },
        { '@type': 'ListItem', position: 2, name: 'Authors', item: `${SITE.url}/authors` },
        { '@type': 'ListItem', position: 3, name: author.name, item: authorUrl(author.handle) },
      ],
    },
  };

  return (
    <main className="pt-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm">
            <Link href="/blog" className="text-[var(--accent)] hover:underline">
              &larr; All posts
            </Link>
          </nav>
          <div className="flex items-start gap-6 mb-12 flex-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={author.avatar} alt="" className="w-24 h-24 rounded-full border object-cover" style={{ borderColor: 'var(--border-subtle)' }} />
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {author.name}
              </h1>
              {author.bio && (
                <p className="text-lg mb-3" style={{ color: 'var(--text-secondary)' }}>{author.bio}</p>
              )}
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {posts.length} post{posts.length === 1 ? '' : 's'} on Kubesimplify
                </p>
                <AuthorSocials socials={author.socials} size="lg" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
