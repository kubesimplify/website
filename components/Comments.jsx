'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Giscus comments. GitHub Discussions as the backend, free, no server.
 *
 * Setup (one-time, in your GitHub repo):
 *   1. Enable Discussions: Settings → General → Features → Discussions
 *   2. Install the Giscus app: https://github.com/apps/giscus
 *   3. Visit https://giscus.app, paste your repo (kubesimplify/website),
 *      pick a Discussions category (recommended: "Announcements" or "General"),
 *      and copy the data-repo-id and data-category-id it gives you.
 *   4. Drop those into lib/blog.js → SITE.giscus
 *
 * If SITE.giscus is not configured, this component renders nothing.
 */
const GISCUS = {
  repo: 'kubesimplify/website',
  repoId: 'R_kgDOHEscfQ',
  category: 'Announcements',
  categoryId: 'DIC_kwDOHEscfc4C9bxo',
};

export default function Comments() {
  const ref = useRef(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    if (!GISCUS.repoId || GISCUS.repoId.startsWith('YOUR_')) return;
    if (ref.current.querySelector('iframe')) return; // already mounted

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', GISCUS.repo);
    script.setAttribute('data-repo-id', GISCUS.repoId);
    script.setAttribute('data-category', GISCUS.category);
    script.setAttribute('data-category-id', GISCUS.categoryId);
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '1');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', isDark ? 'dark_dimmed' : 'light');
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy');
    ref.current.appendChild(script);
  }, [isDark]);

  // Don't render anything if not configured (avoids broken-looking section).
  if (!GISCUS.repoId || GISCUS.repoId.startsWith('YOUR_')) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        Discussion
      </h2>
      <div ref={ref} className="giscus-frame" />
    </section>
  );
}
