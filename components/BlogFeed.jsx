'use client';

import { useState, useEffect } from 'react';

export default function BlogFeed({ count = 6, showSearch = false }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const query = `
          query Publication {
            publication(host: "blog.kubesimplify.com") {
              posts(first: 20) {
                edges {
                  node {
                    title
                    brief
                    slug
                    coverImage { url }
                    publishedAt
                    tags { name }
                    author { name profilePicture }
                    readTimeInMinutes
                  }
                }
              }
            }
          }
        `;
        const response = await fetch('https://gql.hashnode.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        if (!response.ok) throw new Error('Failed');
        const result = await response.json();
        if (result.data?.publication?.posts?.edges) {
          const sorted = result.data.publication.posts.edges
            .map((e) => e.node)
            .filter((b) => !b.slug || /^[a-zA-Z0-9_-]+$/.test(b.slug))
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
            .slice(0, count);
          setBlogs(sorted);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [count]);

  const filtered = searchQuery
    ? blogs.filter(
        (b) =>
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.brief.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : blogs;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(count > 6 ? 6 : count)].map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-gray-800/50 border border-white/[0.06]">
            <div className="aspect-video bg-gray-700/50 animate-pulse" />
            <div className="p-6">
              <div className="h-4 w-20 bg-gray-700/50 rounded-full animate-pulse mb-3" />
              <div className="h-5 w-3/4 bg-gray-700/50 rounded animate-pulse mb-3" />
              <div className="h-16 w-full bg-gray-700/50 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 rounded-2xl border border-white/[0.06] bg-gray-900/50">
        <p className="text-gray-400 mb-4">Unable to load articles.</p>
        <a
          href="https://blog.kubesimplify.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] font-semibold hover:underline"
        >
          Visit blog.kubesimplify.com
        </a>
      </div>
    );
  }

  return (
    <>
      {showSearch && (
        <div className="max-w-xl mx-auto mb-10">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              maxLength={200}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-900/80 border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all text-sm"
            />
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((blog, idx) => (
          <a
            key={blog.slug || idx}
            href={`https://blog.kubesimplify.com/${blog.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 flex flex-col"
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={blog.coverImage?.url || 'https://cdn.hashnode.com/res/hashnode/image/upload/v1611902473383/CDyAuTy75.png'}
                alt={blog.title}
                loading="lazy"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {blog.tags?.slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider border border-cyan-500/20"
                  >
                    {tag.name}
                  </span>
                ))}
                <span className="text-[11px] text-gray-500">
                  {new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2 leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                {blog.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 flex-1 mb-4">
                {blog.brief}
              </p>
              <div className="mt-auto pt-3 border-t border-white/[0.06] flex items-center justify-between">
                {blog.author && (
                  <div className="flex items-center gap-2">
                    {blog.author.profilePicture && (
                      <img src={blog.author.profilePicture} alt="" className="w-5 h-5 rounded-full" />
                    )}
                    <span className="text-[11px] text-gray-500">{blog.author.name}</span>
                  </div>
                )}
                <span className="text-xs font-semibold text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                  Read &rarr;
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
