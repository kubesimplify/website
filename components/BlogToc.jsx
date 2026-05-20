'use client';
import { useEffect, useState } from 'react';

export default function BlogToc({ toc }) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!toc?.length) return;
    const headings = toc
      .map((h) => document.getElementById(h.id))
      .filter(Boolean);
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target.id);
        if (visible.length) setActive(visible[0]);
      },
      { rootMargin: '-100px 0px -70% 0px', threshold: 0 }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [toc]);

  if (!toc?.length) return null;

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p
        className="font-bold uppercase tracking-wider text-[11px] mb-3"
        style={{ color: 'var(--text-muted)' }}
      >
        On this page
      </p>
      <ul className="space-y-1.5 border-l" style={{ borderColor: 'var(--border-subtle)' }}>
        {toc.map((h) => (
          <li key={h.id} style={{ paddingLeft: `${(h.depth - 2) * 12 + 12}px` }}>
            <a
              href={`#${h.id}`}
              className={`block py-0.5 transition-colors leading-snug ${
                active === h.id ? 'text-[var(--accent)] font-semibold' : 'hover:text-[var(--accent)]'
              }`}
              style={{ color: active === h.id ? undefined : 'var(--text-secondary)' }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
