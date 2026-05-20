/**
 * Render an author's social media links as a row of icons.
 * Each social entry on authors.json maps to a clean icon link.
 */
const ICONS = {
  twitter: { label: 'Twitter / X', svg: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  x: { label: 'X / Twitter', svg: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  linkedin: { label: 'LinkedIn', svg: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
  github: { label: 'GitHub', svg: 'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z' },
  website: { label: 'Website', svg: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14', stroke: true },
  hashnode: { label: 'Hashnode', svg: 'M22.351 8.019l-6.37-6.37a5.63 5.63 0 00-7.962 0l-6.37 6.37a5.63 5.63 0 000 7.962l6.37 6.37a5.63 5.63 0 007.962 0l6.37-6.37a5.63 5.63 0 000-7.962zM12 15.953a3.953 3.953 0 11.001-7.906A3.953 3.953 0 0112 15.953z' },
  youtube: { label: 'YouTube', svg: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
};

export default function AuthorSocials({ socials, size = 'sm' }) {
  if (!socials) return null;
  const entries = Object.entries(socials).filter(([, v]) => v);
  if (entries.length === 0) return null;
  const iconSize = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const btnSize = size === 'lg' ? 'w-9 h-9' : 'w-7 h-7';
  return (
    <div className="flex gap-2 items-center">
      {entries.map(([key, url]) => {
        const icon = ICONS[key] || ICONS.website;
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={icon.label}
            className={`inline-flex items-center justify-center ${btnSize} rounded-full border transition-colors hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] hover:border-[var(--accent)]`}
            style={{ borderColor: 'var(--border-medium)', color: 'var(--text-secondary)' }}
          >
            <svg
              className={iconSize}
              viewBox="0 0 24 24"
              fill={icon.stroke ? 'none' : 'currentColor'}
              stroke={icon.stroke ? 'currentColor' : undefined}
              strokeWidth={icon.stroke ? 2 : undefined}
              strokeLinecap={icon.stroke ? 'round' : undefined}
              strokeLinejoin={icon.stroke ? 'round' : undefined}
            >
              <path d={icon.svg} />
            </svg>
          </a>
        );
      })}
    </div>
  );
}
