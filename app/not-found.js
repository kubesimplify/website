'use client';

import { useEffect, useState } from 'react';

const KNOWN_PATHS = ['/', '/about', '/blogs', '/workshops', '/partnerships', '/resources'];

export default function NotFound() {
  const [redirectUrl, setRedirectUrl] = useState('');

  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (!KNOWN_PATHS.includes(path)) {
      const slug = path.replace(/^\//, '');
      if (slug) {
        const url = `https://blog.kubesimplify.com/${slug}`;
        setRedirectUrl(url);
        window.location.replace(url);
      }
    }
  }, []);

  if (redirectUrl) {
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
            This article has moved. Redirecting&hellip;
          </p>
          <a
            href={redirectUrl}
            className="text-[var(--accent)] hover:underline font-semibold"
          >
            Click here if not redirected
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1
          className="text-7xl font-bold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          404
        </h1>
        <p
          className="text-xl mb-8"
          style={{ color: 'var(--text-secondary)' }}
        >
          Page not found
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 text-[var(--accent)] hover:underline font-semibold"
        >
          &larr; Back to home
        </a>
      </div>
    </main>
  );
}
