import Link from 'next/link';

/**
 * Numbered pagination. Always shows: first, last, current ±2, with ellipses.
 * `pathFor(n)` returns the href for page n (e.g., n=1 => '/blog', n=2 => '/blog/page/2').
 */
export default function Pagination({ current, total, pathFor }) {
  if (total <= 1) return null;

  const pages = new Set([1, total, current - 1, current, current + 1]);
  // Pad to show a few more around current
  if (current <= 3) [2, 3, 4].forEach((n) => pages.add(n));
  if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((n) => pages.add(n));

  const sorted = Array.from(pages).filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);

  // Insert ellipses where there are gaps
  const items = [];
  for (let i = 0; i < sorted.length; i++) {
    items.push({ kind: 'page', n: sorted[i] });
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
      items.push({ kind: 'ellipsis', n: `e${i}` });
    }
  }

  const linkClass =
    'inline-flex items-center justify-center min-w-[2.25rem] h-9 px-3 rounded-lg text-sm font-semibold transition-colors';
  const linkStyle = { color: 'var(--text-secondary)' };
  const activeClass = 'bg-[var(--accent)]/10 text-[var(--accent)] cursor-default';
  const inactiveClass = 'hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]';
  const disabledClass = 'opacity-30 cursor-not-allowed';

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-2 mt-10 flex-wrap">
      {current > 1 ? (
        <Link href={pathFor(current - 1)} className={`${linkClass} ${inactiveClass}`} style={linkStyle}>
          &larr; Newer
        </Link>
      ) : (
        <span className={`${linkClass} ${disabledClass}`} style={linkStyle}>
          &larr; Newer
        </span>
      )}

      <div className="flex items-center gap-1 flex-wrap justify-center">
        {items.map((item) =>
          item.kind === 'ellipsis' ? (
            <span key={item.n} className={`${linkClass} cursor-default`} style={{ color: 'var(--text-muted)' }}>
              …
            </span>
          ) : item.n === current ? (
            <span
              key={item.n}
              className={`${linkClass} ${activeClass}`}
              aria-current="page"
            >
              {item.n}
            </span>
          ) : (
            <Link
              key={item.n}
              href={pathFor(item.n)}
              className={`${linkClass} ${inactiveClass}`}
              style={linkStyle}
            >
              {item.n}
            </Link>
          )
        )}
      </div>

      {current < total ? (
        <Link href={pathFor(current + 1)} className={`${linkClass} ${inactiveClass}`} style={linkStyle}>
          Older &rarr;
        </Link>
      ) : (
        <span className={`${linkClass} ${disabledClass}`} style={linkStyle}>
          Older &rarr;
        </span>
      )}
    </nav>
  );
}
