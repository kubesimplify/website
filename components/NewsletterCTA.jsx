'use client';

import { useState } from 'react';

const API = 'https://blog.kubesimplify.com/api/subscribe';
// Inlined (not imported from lib/blog), this is a client component and
// lib/blog reads the filesystem, which can't ship to the browser.
const SITE = {
  newsletterName: 'Kubesimplify Diaries',
  newsletterUrl: 'https://saiyampathak.substack.com/s/kubesimplify-diaries',
};

/**
 * Native newsletter signup (double opt-in via our own worker + Resend).
 * GDPR / DPDP: consent text at the point of collection, confirmation email
 * before any subscription exists, unsubscribe + erasure links in every email.
 * Substack remains available as a secondary option.
 */
function useSubscribe(source) {
  const [state, setState] = useState('idle'); // idle | busy | done | error
  const [message, setMessage] = useState('');

  const subscribe = async (email) => {
    setState('busy');
    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      let base = API.replace('/api/subscribe', '');
      if (host === 'blog.kubesimplify.com') {
        base = '';
      } else if (host === 'localhost' || host === '127.0.0.1') {
        // Local review: the API lives on the wrangler dev server (8802);
        // a plain static file server has no /api routes.
        base = window.location.port === '8802' ? '' : 'http://localhost:8802';
      }
      const res = await fetch(`${base}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setState('done');
        setMessage('Almost there, check your inbox and click the confirmation link.');
      } else {
        setState('error');
        setMessage(body.error === 'invalid email' ? 'That email doesn’t look right.' : 'Something went wrong. Try again in a minute.');
      }
    } catch {
      setState('error');
      setMessage('Could not reach the server. Try again in a minute.');
    }
  };

  return { state, message, subscribe };
}

function SignupForm({ source, compact = false }) {
  const [email, setEmail] = useState('');
  const { state, message, subscribe } = useSubscribe(source);

  if (state === 'done') {
    return (
      <p className="text-sm font-semibold py-2" style={{ color: 'var(--accent-secondary)' }}>
        ✓ {message}
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email) subscribe(email);
      }}
      className={compact ? '' : 'max-w-md mx-auto'}
    >
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address"
          className="flex-1 min-w-0 rounded-lg border px-3 py-2.5 text-sm bg-transparent outline-none focus:border-[var(--accent)]"
          style={{ borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
        />
        <button
          type="submit"
          disabled={state === 'busy'}
          className="shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          style={{ background: 'var(--accent)', color: '#03121a' }}
        >
          {state === 'busy' ? 'Sending…' : 'Subscribe'}
        </button>
      </div>
      {state === 'error' && (
        <p className="text-xs mt-2 text-red-500">{message}</p>
      )}
      <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Double opt-in: we only email you after you confirm. New articles, videos, workshops -
        nothing else. Unsubscribe or erase your data anytime with one click.{' '}
        <a href="/privacy" className="underline hover:text-[var(--accent)]">Privacy</a>
      </p>
    </form>
  );
}

export default function NewsletterCTA({ variant = 'card' }) {
  if (variant === 'inline') {
    return (
      <div
        className="rounded-xl p-4 text-sm"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p style={{ color: 'var(--text-secondary)' }}>Get new posts in your inbox.</p>
        </div>
        <SignupForm source="blog-inline" compact />
      </div>
    );
  }

  return (
    <section
      id="newsletter"
      className="rounded-2xl p-8 text-center my-12"
      style={{
        background: 'linear-gradient(135deg, var(--accent-secondary)15, var(--accent)15)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--accent)' }}>
        Newsletter
      </p>
      <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
        {SITE.newsletterName || 'Never miss a deep dive'}
      </h3>
      <p className="text-base mb-6 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
        New Kubernetes, AI infra, and cloud-native articles, videos, and workshops, in your
        inbox, from us directly.
      </p>
      <SignupForm source="blog-card" />
      {SITE.newsletterUrl && (
        <p className="text-[11px] mt-4" style={{ color: 'var(--text-muted)' }}>
          Prefer Substack?{' '}
          <a href={SITE.newsletterUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--accent)]">
            Subscribe there instead
          </a>
        </p>
      )}
    </section>
  );
}
