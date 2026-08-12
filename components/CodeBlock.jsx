'use client';

import { useEffect, useRef, useState } from 'react';

export default function CodeBlock({ children, ...props }) {
  const preRef = useRef(null);
  const resetTimerRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  async function copyCode() {
    const code = preRef.current?.innerText;
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be blocked by browser or page permissions.
    }
  }

  return (
    <div className="blog-code-block relative group">
      <pre ref={preRef} {...props}>{children}</pre>
      <button
        type="button"
        aria-label="Copy code"
        className="absolute top-2 right-2 px-2 py-1 text-[11px] font-semibold rounded border border-white/20 bg-black/50 text-white/80 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-black/70"
        onClick={copyCode}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
