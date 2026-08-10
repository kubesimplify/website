'use client';

import { useEffect, useState } from 'react';

// Client component: the worker redirects here with ?status=invalid when a
// confirmation token is unknown or belongs to an unsubscribed address, and
// that case must NOT be shown a success message.
export default function SubscribedPage() {
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setInvalid(new URLSearchParams(window.location.search).get('status') === 'invalid');
  }, []);

  if (invalid) {
    return (
      <main className="pt-32 pb-24 min-h-screen flex items-start justify-center px-4">
        <div className="max-w-md text-center rounded-2xl border p-8" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
          <p className="text-4xl mb-4" aria-hidden>🔗</p>
          <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            That link didn&apos;t work
          </h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            The confirmation link is invalid or no longer active, so nothing was changed.
            If you want Kubesimplify updates, just subscribe again and click the fresh
            link we email you.
          </p>
          <a href="/#newsletter" className="inline-block px-5 py-2.5 rounded-lg font-semibold" style={{ background: 'var(--accent)', color: '#03121a' }}>
            Subscribe again →
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-24 min-h-screen flex items-start justify-center px-4">
      <div className="max-w-md text-center rounded-2xl border p-8" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
        <p className="text-4xl mb-4" aria-hidden>🎉</p>
        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          You&apos;re in!
        </h1>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
          Your subscription is confirmed. You&apos;ll hear from us when new articles, videos,
          workshops, or labs ship, and never otherwise. Every email has one-click
          unsubscribe.
        </p>
        <a href="/learn" className="inline-block px-5 py-2.5 rounded-lg font-semibold" style={{ background: 'var(--accent)', color: '#03121a' }}>
          Start learning →
        </a>
      </div>
    </main>
  );
}
