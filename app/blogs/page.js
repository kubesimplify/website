'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function BlogsLegacy() {
  useEffect(() => {
    window.location.replace('/blog');
  }, []);
  return (
    <main className="pt-24 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
          Redirecting&hellip;
        </p>
        <Link href="/blog" className="text-[var(--accent)] hover:underline font-semibold">
          Click here if not redirected
        </Link>
      </div>
    </main>
  );
}
