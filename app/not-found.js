export default function NotFound() {
  // Plain 404 — no client-side redirect fallback. The edge router
  // (public/_worker.js on Pages, public/_redirects on Workers assets) already
  // rewrites every known blog slug server-side; they are generated from the
  // same content list, so any path that reaches this page genuinely doesn't
  // exist. A JS redirect to /blog/<slug> here ping-pongs with the router's
  // /blog/* strip rule and refresh-loops forever (seen twice in production).
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
