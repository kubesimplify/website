'use client';

import { useEffect, useState } from 'react';

// Client component: distinguishes plain unsubscribe, full erasure
// (?erased=1), and an invalid token (?status=invalid).
export default function UnsubscribedPage() {
  const [state, setState] = useState('unsubscribed');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('status') === 'invalid') setState('invalid');
    else if (q.get('erased') === '1') setState('erased');
  }, []);

  const copy = {
    unsubscribed: {
      emoji: '👋',
      title: "You're unsubscribed",
      text: 'No more emails from us, effective immediately. Changed your mind? You can subscribe again anytime, the content stays free either way.',
    },
    erased: {
      emoji: '🗑️',
      title: 'Your data is gone',
      text: 'You are unsubscribed and everything we stored about you has been permanently deleted. Thanks for having been here.',
    },
    invalid: {
      emoji: '🔗',
      title: "That link didn't work",
      text: 'The link is invalid or was already used, so nothing was changed. If you meant to unsubscribe, use the link in any of our emails.',
    },
  }[state];

  return (
    <main className="pt-32 pb-24 min-h-screen flex items-start justify-center px-4">
      <div className="max-w-md text-center rounded-2xl border p-8" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
        <p className="text-4xl mb-4" aria-hidden>{copy.emoji}</p>
        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{copy.title}</h1>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>{copy.text}</p>
        <a href="/" className="inline-block px-5 py-2.5 rounded-lg font-semibold" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
          Back to Kubesimplify
        </a>
      </div>
    </main>
  );
}
