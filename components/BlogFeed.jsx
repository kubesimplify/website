'use client';
import Link from 'next/link';
import { FEED_POSTS } from '@/lib/_blog-feed-data';

const DEFAULT_AUTHOR = {
  name: 'Kubesimplify',
  avatar: '/img/color.svg',
};

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BlogFeed({ count = 6 }) {
  const posts = FEED_POSTS.slice(0, count);

  if (!posts.length) {
    return (
      <div className="text-center py-12 rounded-2xl glass-card">
        <p style={{ color: 'var(--text-muted)' }}>No posts yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 flex flex-col"
          >
            {p.cover && (
              <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.cover}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            )}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {(p.tags || []).slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(p.datePublished)}
                </span>
              </div>
              <h3
                className="text-base font-semibold mb-2 leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {p.title}
              </h3>
              <p className="text-sm leading-relaxed line-clamp-3 flex-1 mb-4" style={{ color: 'var(--text-secondary)' }}>
                {p.description}
              </p>
              <div className="mt-auto pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={DEFAULT_AUTHOR.avatar} alt="" className="w-5 h-5 rounded-full" />
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {DEFAULT_AUTHOR.name}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                  Read &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="text-center mt-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          See all posts &rarr;
        </Link>
      </div>
    </>
  );
}
