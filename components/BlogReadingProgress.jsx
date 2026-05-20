'use client';
import { useEffect, useState } from 'react';

export default function BlogReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? Math.min(100, Math.max(0, (h.scrollTop / max) * 100)) : 0;
      setProgress(p);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[3px] origin-left transition-transform"
      style={{
        background: 'linear-gradient(90deg, var(--accent-secondary), var(--accent))',
        transform: `scaleX(${progress / 100})`,
      }}
    />
  );
}
