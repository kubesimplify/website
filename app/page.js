'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { products } from '@/lib/products';
import pathsData from '@/content/learning-paths.json';
import NewsletterCTA from '@/components/NewsletterCTA';

const YouTubeFeed = dynamic(() => import('@/components/YouTubeFeed'), { ssr: false });
const BlogFeed = dynamic(() => import('@/components/BlogFeed'), { ssr: false });

const { paths } = pathsData;

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const partners = [
  'Cisco', 'Sysdig', 'Chainguard', 'Komodor', 'groundcover', 'OpenChoreo',
  'NudgeBee', 'CloudCasa', 'Armo', 'Namespace Labs', 'Robusta',
];

const stats = [
  { value: '100K+', label: 'Community' },
  { value: '50K+', label: 'YouTube Subs' },
  { value: '192', label: 'Deep-Dive Articles' },
  { value: '5', label: 'Open Source Tools' },
];

// The terminal cycles through real commands from our real tools.
const TERMINAL_SCENES = [
  {
    cmd: 'brew install --cask saiyam1814/tap/kiac && kiac create cluster',
    out: ['☸  3-node Kubernetes cluster on Apple containers', '✓  metrics, storage, LoadBalancer: ready'],
  },
  {
    cmd: 'kubectl upgrade preflight',
    out: ['✓  version skew OK   ✓ addons compatible', '→  cluster is safe to upgrade to v1.35'],
  },
  {
    cmd: 'ing-switch scan',
    out: ['37 ingress annotations analyzed', '→  migration kit generated: Gateway API'],
  },
  {
    cmd: 'npx memwarden audit ~/.claude',
    out: ['142 agent memories · 9 stale firewalled', '✓  one verified brain, every agent'],
  },
];

/* ═══════════════════════════════════════════
   TERMINAL SHOWCASE (CSS + tiny JS, no motion lib)
   ═══════════════════════════════════════════ */

function TerminalShowcase() {
  const [scene, setScene] = useState(0);
  const [typed, setTyped] = useState(0);
  const [showOut, setShowOut] = useState(false);
  const current = TERMINAL_SCENES[scene];

  useEffect(() => {
    if (typed < current.cmd.length) {
      const t = setTimeout(() => setTyped((n) => n + 1), 28);
      return () => clearTimeout(t);
    }
    const show = setTimeout(() => setShowOut(true), 250);
    const next = setTimeout(() => {
      setShowOut(false);
      setTyped(0);
      setScene((s) => (s + 1) % TERMINAL_SCENES.length);
    }, 4200);
    return () => { clearTimeout(show); clearTimeout(next); };
  }, [typed, scene, current.cmd.length]);

  return (
    <div
      className="rounded-2xl overflow-hidden border shadow-2xl w-full max-w-lg font-mono text-[13px] leading-relaxed"
      style={{ background: '#0a0f1a', borderColor: 'var(--border-medium)' }}
    >
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#111827' }}>
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs" style={{ color: '#64748b' }}>kubesimplify · zsh</span>
      </div>
      <div className="px-5 py-5 min-h-[150px]">
        <p style={{ color: '#e2e8f0' }}>
          <span style={{ color: '#5CFF68' }}>$ </span>
          {current.cmd.slice(0, typed)}
          <span className="terminal-caret" aria-hidden>▋</span>
        </p>
        {showOut && current.out.map((line) => (
          <p key={line} style={{ color: '#94a3b8' }} className="mt-1">{line}</p>
        ))}
        {showOut && (
          <p className="mt-3">
            <Link href="/products" className="text-xs font-semibold hover:underline" style={{ color: '#05CAFF' }}>
              → explore the tools
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION HELPERS
   ═══════════════════════════════════════════ */

function SectionHead({ kicker, title, sub, href, linkText }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
      <div className="max-w-2xl">
        <p className="font-mono text-sm mb-2" style={{ color: 'var(--accent)' }}>{kicker}</p>
        <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        {sub && <p className="mt-3 text-base" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="font-semibold text-sm hover:underline shrink-0" style={{ color: 'var(--accent)' }}>
          {linkText} →
        </Link>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */

export default function Home() {
  return (
    <main>
      {/* ── HERO ─────────────────────────────── */}
      <section className="hero-bg relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="hero-glow-orb w-[500px] h-[500px] bg-[var(--accent)]/[0.07] top-[10%] left-[5%]" />
          <div className="hero-glow-orb w-[600px] h-[600px] bg-[var(--accent-secondary)]/[0.07] top-[20%] right-[0%]" style={{ animationDelay: '4s' }} />
          <div className="absolute inset-0 hero-grid" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="hero-enter inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-[11px] font-semibold tracking-[0.2em] uppercase backdrop-blur-sm mb-8"
                style={{ borderColor: 'var(--border-medium)', background: 'var(--border-subtle)', color: 'var(--text-secondary)', animationDelay: '100ms' }}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
                </span>
                Open source tools · Free education
              </div>

              <h1 className="text-display-lg hero-enter" style={{ animationDelay: '200ms' }}>
                We build the tools.
                <span className="text-display-lg gradient-text-hero block hero-enter" style={{ animationDelay: '350ms' }}>
                  We teach the stack.
                </span>
              </h1>

              <p className="mt-8 text-lg max-w-2xl leading-relaxed mx-auto lg:mx-0 hero-enter" style={{ color: 'var(--text-secondary)', animationDelay: '550ms' }}>
                Real open source tools used in real clusters, plus 192 deep-dive articles,
                free roadmaps, and hands-on labs for{' '}
                <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Kubernetes</span> and{' '}
                <span style={{ color: 'var(--accent-secondary)', fontWeight: 500 }}>AI infrastructure</span>.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 hero-enter" style={{ animationDelay: '700ms' }}>
                <Link href="/products" className="btn-primary px-8 py-4 rounded-xl text-base inline-flex items-center gap-2">
                  <span>Explore the tools</span><span className="text-lg">→</span>
                </Link>
                <Link href="/learn" className="btn-secondary px-8 py-4 rounded-xl text-base">
                  Free roadmaps
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 hidden lg:flex justify-center hero-enter-right" style={{ animationDelay: '500ms' }}>
              <TerminalShowcase />
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto lg:mx-0 hero-enter" style={{ animationDelay: '850ms' }}>
            {stats.map((s) => (
              <div key={s.label} className="py-5 px-4 rounded-xl border text-center lg:text-left" style={{ borderColor: 'var(--border-subtle)', background: 'var(--border-subtle)' }}>
                <div className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ─────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHead
            kicker="$ kubectl get products"
            title="Open source, really used"
            sub="Not demos. Tools we run ourselves and maintain in the open, for local clusters on Apple Silicon, upgrades, ingress migrations, day-2 ops, and AI agent memory."
            href="/products"
            linkText="All products"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className="group rounded-2xl border p-6 flex flex-col gap-2.5 transition-all duration-200 hover:-translate-y-1"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--card-shadow)' }}
              >
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="font-mono">{p.category}</span>
                  <span>★ {p.stars} · {p.language}</span>
                </div>
                <h3 className="text-xl font-bold group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {p.name}
                </h3>
                <p className="text-sm font-semibold" style={{ color: 'var(--accent-secondary)' }}>{p.tagline}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.description}</p>
              </Link>
            ))}
            <a
              href="https://killercoda.com/saiyampathak"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-dashed p-6 flex flex-col justify-center gap-2 hover:-translate-y-1 transition-transform"
              style={{ borderColor: 'var(--border-medium)' }}
            >
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>⌨️ Hands-on labs</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Free Killercoda scenarios, a real cluster in your browser, zero setup.
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* ── LEARNING PATHS ───────────────────── */}
      <section className="py-24 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto">
          <SectionHead
            kicker="$ kubesimplify learn"
            title="Roadmaps that are actually free"
            sub="Stop bookmarking roadmap PNGs. These are living paths through real articles, video courses, and labs, in the right order, no paywall."
            href="/learn"
            linkText="All paths"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {paths.map((p) => (
              <Link
                key={p.slug}
                href={`/learn/${p.slug}`}
                className="group rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="text-3xl mb-3" aria-hidden>{p.emoji}</div>
                <h3 className="text-lg font-bold mb-1 group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {p.name}
                </h3>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-secondary)' }}>{p.level}</p>
                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {p.stages.length} stages · {p.stages.reduce((n, s) => n + s.steps.length, 0)} steps
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FREE BOOK STRIP ──────────────────── */}
      <section className="py-10 px-6">
        <a
          href="https://saiyampathak.gumroad.com/l/gpubook"
          target="_blank"
          rel="noopener noreferrer"
          className="max-w-4xl mx-auto flex items-center gap-5 rounded-2xl border p-5 hover:-translate-y-0.5 transition-transform"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}
        >
          <img src="/img/book-cover.webp" alt="GPU-Enabled Platforms on Kubernetes, free e-book" className="w-14 h-[4.5rem] rounded object-cover shrink-0" loading="lazy" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--accent)' }}>Free e-book</p>
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>GPU-Enabled Platforms on Kubernetes</p>
            <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>Time-slicing, MPS, MIG, DRA, the whole GPU story, free.</p>
          </div>
          <span className="shrink-0 font-semibold text-sm" style={{ color: 'var(--accent)' }}>Download →</span>
        </a>
      </section>

      {/* ── LATEST CONTENT ───────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHead
            kicker="$ tail -f content"
            title="Fresh from the blog & channel"
            sub="192 articles by 62 practitioners, and a YouTube channel 50K engineers trust."
            href="https://blog.kubesimplify.com"
            linkText="Read the blog"
          />
          <BlogFeed count={6} />
          <div className="mt-12">
            <YouTubeFeed count={3} source="channel" />
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────── */}
      <section className="py-12 px-6 max-w-3xl mx-auto">
        <NewsletterCTA />
      </section>

      {/* ── PARTNERS / BUSINESS ──────────────── */}
      <section className="py-24 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="font-mono text-sm mb-2" style={{ color: 'var(--accent)' }}>$ kubesimplify partner --curated</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Work with the team engineers already trust
          </h2>
          <p className="max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
            Workshops, technical videos, deep-dive articles, and DevRel, built by a KubeCon
            co-chair and CNCF ecosystem leaders, for a 100K+ engineering audience.
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 mb-10">
            {partners.map((name) => (
              <span key={name} className="text-lg font-bold opacity-60" style={{ color: 'var(--text-secondary)' }}>{name}</span>
            ))}
          </div>
          <Link href="/partnerships" className="btn-primary px-8 py-4 rounded-xl text-base inline-block">
            Partner with us →
          </Link>
        </div>
      </section>
    </main>
  );
}
