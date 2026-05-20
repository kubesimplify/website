'use client';
import { useState } from 'react';

export default function BlogShareBar({ url, title }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;

  const xUrl = `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`;
  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`;
  const hnUrl = `https://news.ycombinator.com/submitlink?u=${enc(url)}&t=${enc(title)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  const btnClass =
    'inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] hover:border-[var(--accent)]';
  const btnStyle = { borderColor: 'var(--border-medium)', color: 'var(--text-secondary)' };

  return (
    <div className="flex md:flex-col gap-2">
      <a href={xUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className={btnClass} style={btnStyle}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
      <a href={liUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className={btnClass} style={btnStyle}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      </a>
      <a href={hnUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Hacker News" className={btnClass} style={btnStyle}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M0 24V0h24v24zM6.951 5.896l4.112 7.708v5.064h1.583v-4.972l4.148-7.799h-1.749l-2.457 4.875c-.372.745-.688 1.434-.688 1.434s-.297-.708-.651-1.434L8.831 5.896z"/></svg>
      </a>
      <button onClick={copy} aria-label="Copy link" className={btnClass} style={btnStyle}>
        {copied ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 015.656 0 4 4 0 010 5.656l-3 3a4 4 0 01-5.656 0M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656"/></svg>
        )}
      </button>
    </div>
  );
}
