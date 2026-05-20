import Link from 'next/link';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BlogCard({ post, featured = false }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 flex flex-col"
    >
      {post.cover && (
        <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover}
            alt={`Cover for ${post.title}`}
            loading={featured ? 'eager' : 'lazy'}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {post.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {formatDate(post.datePublished)}
          </span>
        </div>
        <h3
          className={`${featured ? 'text-xl' : 'text-base'} font-semibold mb-2 leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-2`}
          style={{ color: 'var(--text-primary)' }}
        >
          {post.title}
        </h3>
        {post.seoDescription && (
          <p
            className="text-sm leading-relaxed line-clamp-3 flex-1 mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            {post.seoDescription}
          </p>
        )}
        <div className="mt-auto pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.author.avatar} alt={post.author.name} className="w-5 h-5 rounded-full object-cover" />
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {post.author.name} · {post.readMinutes} min
            </span>
          </div>
          <span className="text-xs font-semibold text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
            Read &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
