import Link from 'next/link';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Docker-blog-style grid card.
 * Visible in a 3-column grid with subtle cell borders (no shadow, no rounded corners).
 * Each cell: meta row (category + date), title, excerpt, author chip, "Read now" link.
 */
export default function ArchiveCard({ post }) {
  const primaryTag = post.tags?.[0];

  return (
    <article className="group relative flex flex-col h-full p-6 md:p-8 transition-colors hover:bg-[var(--accent)]/5">
      <div className="flex items-start justify-between gap-3 mb-5">
        {primaryTag ? (
          <Link
            href={`/blog/tag/${encodeURIComponent(primaryTag)}`}
            className="text-[11px] font-bold uppercase tracking-wider hover:text-[var(--accent)] transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            {primaryTag}
          </Link>
        ) : (
          <span />
        )}
        <time
          dateTime={post.datePublished}
          className="text-sm whitespace-nowrap"
          style={{ color: 'var(--text-muted)' }}
        >
          {formatDate(post.datePublished)}
        </time>
      </div>

      <Link href={`/blog/${post.slug}`} className="block mb-3">
        <h3
          className="text-xl md:text-[22px] font-bold leading-tight line-clamp-3 group-hover:text-[var(--accent)] transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          {post.title}
        </h3>
      </Link>

      {post.seoDescription && (
        <p
          className="text-[15px] leading-relaxed line-clamp-4 mb-6 flex-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          {post.seoDescription}
        </p>
      )}

      <div className="mt-auto space-y-4">
        <Link
          href={`/blog/author/${post.author.handle}`}
          className="flex items-center gap-2.5 group/author"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
          />
          <span
            className="text-sm font-medium group-hover/author:text-[var(--accent)] transition-colors truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {post.author.name}
          </span>
        </Link>

        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:gap-2.5 transition-all"
        >
          Read now
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
