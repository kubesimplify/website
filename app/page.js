'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/FadeIn';
import YouTubeFeed from '@/components/YouTubeFeed';
import BlogFeed from '@/components/BlogFeed';

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const partners = [
  'Cisco', 'Sysdig', 'Chainguard', 'Komodor', 'CloudCasa',
  'Armo', 'Namespace Labs', 'Robusta',
];

const stats = [
  { value: '100K+', label: 'Community' },
  { value: '50K+', label: 'YouTube Subs' },
  { value: '250+', label: 'Videos' },
  { value: '200K+', label: 'Social Reach' },
];

const services = [
  {
    title: 'Technical Video Production',
    desc: 'End-to-end deep-dive YouTube content reaching 50K+ subscribers. Product demos, tutorials, and walkthroughs that convert.',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  },
  {
    title: 'Hands-on Workshops',
    desc: 'Expert-led interactive workshops on Kubernetes, AI/ML infra, service mesh, GitOps. Real clusters, real problems.',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    title: 'DevRel & Developer Marketing',
    desc: 'Authentic developer advocacy. Blog posts, social campaigns, webinars, and conference talks that resonate with engineers.',
    icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3',
  },
  {
    title: 'Technical Content & Blogs',
    desc: 'SEO-optimized articles on blog.kubesimplify.com and LinkedIn. Long-lasting, searchable, and share-worthy content.',
    icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  },
  {
    title: 'Webinars & Ad Segments',
    desc: 'Interactive webinars for lead gen, sponsored ad segments in high-reach videos, and bundled content packages.',
    icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Community & Events',
    desc: 'From Discord to KubeCon co-located events, we build developer communities that drive adoption and brand loyalty.',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
];

const team = [
  {
    name: 'Saiyam Pathak',
    role: 'Founder',
    credentials: ['KubeCon Co-Chair', 'CNCF TAG Ops Resilience Chair', 'Kubestronaut', 'K8s Certification SME', 'Keynote Speaker'],
    image: '/img/saiyam-new.webp',
    twitter: 'https://twitter.com/saiyampathak',
    linkedin: 'https://linkedin.com/in/saiyampathak',
  },
  {
    name: 'Saloni Narang',
    role: 'Co-Founder',
    credentials: ['CNCF Ambassador', 'Docker Captain', 'Marketing Strategist', 'Community Builder'],
    image: '/img/saloni_new.webp',
    twitter: 'https://x.com/thesaloninarang',
    linkedin: 'https://www.linkedin.com/in/saloninarang/',
  },
];

const projects = [
  {
    name: 'ClawSpark',
    desc: 'One-click AI agent setup for NVIDIA DGX Spark, Jetson, and RTX hardware. OpenClaw + Ollama, fully local.',
    tech: ['Python', 'AI/LLM', 'NVIDIA DGX'],
    url: 'https://github.com/ClawSpark/ClawSpark',
    logo: null,
    emoji: '⚡',
  },
  {
    name: 'ing-switch',
    desc: 'Migrate Kubernetes Ingress NGINX to Traefik or Gateway API - CLI + web UI. Zero-disruption migration.',
    tech: ['Go', 'Kubernetes', 'Ingress'],
    url: 'https://github.com/saiyam1814/ing-switch',
    logo: '/img/ing-switch-logo.svg',
    emoji: null,
  },
  {
    name: 'BlogKit',
    desc: 'Write once, publish everywhere - Markdown editor with live previews for Hashnode, Dev.to, Medium & LinkedIn.',
    tech: ['Next.js', 'Markdown', 'CI/CD'],
    url: 'https://github.com/saiyam1814/blogkit',
    logo: null,
    emoji: '📝',
  },
  {
    name: 'Kubesimplify Website',
    desc: 'This very site, open source. Built with Next.js, Tailwind, and Framer Motion. Contributions welcome!',
    tech: ['Next.js', 'React', 'Tailwind'],
    url: 'https://github.com/kubesimplify/website',
    logo: '/img/color.svg',
    emoji: null,
  },
];

const differentiators = [
  { title: 'KubeCon Co-Chair', desc: 'Our founder chairs KubeCon, the largest cloud native conference. We shape the ecosystem.', num: '01' },
  { title: 'CNCF Ecosystem Authority', desc: 'TAG Chair, Kubestronaut, K8s Certification SME, CNCF Ambassador, Docker Captain. Deep credibility.', num: '02' },
  { title: 'Practitioner-First Content', desc: 'Every workshop uses real clusters, real deployments, real problems. No slides-only talks.', num: '03' },
  { title: 'Massive, Engaged Reach', desc: '100K+ community, 50K+ YouTube subs, 200K+ social reach. Your message lands with the right engineers.', num: '04' },
];

/* ═══════════════════════════════════════════
   SECTION BADGE
   ═══════════════════════════════════════════ */

function Badge({ text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] mb-8"
      style={{ borderColor: 'rgba(5,202,255,0.2)', background: 'rgba(5,202,255,0.05)', color: 'var(--accent)' }}>
      {text}
    </div>
  );
}

/* ═══════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════ */

function Hero() {
  return (
    <section className="hero-bg relative min-h-screen flex items-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-glow-orb w-[500px] h-[500px] bg-[var(--accent)]/[0.07] dark:bg-[var(--accent)]/[0.07] top-[10%] left-[5%]" />
        <div className="hero-glow-orb w-[600px] h-[600px] bg-[var(--accent-secondary)]/[0.07] dark:bg-[var(--accent-secondary)]/[0.07] top-[20%] right-[0%]" style={{ animationDelay: '4s' }} />
        <div className="absolute inset-0 hero-grid" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Text content */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
              <div className="inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-[11px] font-semibold tracking-[0.2em] uppercase backdrop-blur-sm mb-10"
                style={{ borderColor: 'var(--border-medium)', background: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
                </span>
                Where AI Meets Cloud Native
              </div>
            </motion.div>

            <motion.h1 className="text-display-lg" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              Simplifying
            </motion.h1>
            <motion.h1 className="text-display-lg gradient-text-hero mb-4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}>
              Cloud Native & AI
            </motion.h1>
            <motion.p className="text-display" style={{ fontSize: 'clamp(1.5rem, 4vw, 3.5rem)', fontWeight: 700, color: 'var(--text-muted)' }}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}>
              for Everyone.
            </motion.p>

            <motion.p className="mt-8 text-lg max-w-2xl leading-relaxed mx-auto lg:mx-0" style={{ color: 'var(--text-secondary)' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }}>
              Expert-led workshops, deep-dive content, and open source tools for engineers building with{' '}
              <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Kubernetes</span>,{' '}
              <span style={{ color: 'var(--accent-secondary)', fontWeight: 500 }}>AI/ML infrastructure</span>, and the cloud native stack.
            </motion.p>

            <motion.div className="mt-10 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}>
              <Link href="/workshops" className="btn-primary px-8 py-4 rounded-xl text-base inline-flex items-center gap-2">
                <span>Explore Workshops</span><span className="text-lg">&rarr;</span>
              </Link>
              <a href="mailto:contact@kubesimplify.com" className="btn-secondary px-8 py-4 rounded-xl text-base">
                Partner With Us
              </a>
            </motion.div>
          </div>

          {/* Right: Floating book */}
          <motion.div
            className="lg:col-span-5 hidden lg:flex justify-center"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <a
              href="https://saiyampathak.gumroad.com/l/gpubook"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group block"
            >
              {/* Glow behind book */}
              <div className="absolute -inset-8 rounded-3xl bg-gradient-to-br from-[#5CFF68]/10 to-[#05CAFF]/10 blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
              <div className="relative hero-float">
                <img
                  src="/img/book-cover.webp"
                  alt="GPU-Enabled Platforms on Kubernetes - Free E-Book"
                  className="w-72 rounded-lg shadow-2xl group-hover:shadow-[0_30px_80px_rgba(5,202,255,0.15)] transition-shadow duration-500"
                />
                <div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider gradient-bg text-gray-950 shadow-lg">
                  Free E-Book
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-medium)', color: 'var(--accent)' }}>
                  Download Free &darr;
                </div>
              </div>
            </a>
          </motion.div>
        </div>

        {/* Mobile book banner - shown only on mobile */}
        <motion.a
          href="https://saiyampathak.gumroad.com/l/gpubook"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-12 lg:hidden flex items-center gap-4 rounded-2xl border p-4 mx-auto max-w-sm"
          style={{ borderColor: 'var(--border-medium)', background: 'var(--border-subtle)' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }}
        >
          <img src="/img/book-cover.webp" alt="Free E-Book" className="w-16 h-20 rounded object-cover flex-shrink-0" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--accent)' }}>Free E-Book</div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>GPU-Enabled Platforms on K8s</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Download &rarr;</div>
          </div>
        </motion.a>

        {/* Stats - full width below */}
        <motion.div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto lg:mx-0"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.95 }}>
          {stats.map((s, i) => (
            <div key={i} className="py-5 px-4 rounded-xl border text-center lg:text-left" style={{ borderColor: 'var(--border-subtle)', background: 'var(--border-subtle)' }}>
              <div className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.15em] font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   TRUSTED BY
   ═══════════════════════════════════════════ */

function TrustedBy() {
  return (
    <section className="py-14 border-y" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-8">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>
          Trusted by Industry Leaders
        </p>
      </div>
      <div className="marquee-mask overflow-hidden">
        <div className="marquee-track">
          {[...partners, ...partners].map((name, i) => (
            <span key={i} className="text-xl font-bold whitespace-nowrap select-none transition-colors duration-300"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.target.style.color = 'var(--accent-cyan)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SERVICES
   ═══════════════════════════════════════════ */

function Services() {
  return (
    <section className="py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <Badge text="What We Do" />
          <h2 className="text-display mb-6">Services That Move<br className="hidden sm:block" /> the Needle</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            We build trust between developer tools companies and the engineers who use them. Custom packages available.
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc, i) => (
            <StaggerItem key={i}>
              <div className="card-glow glass-card rounded-2xl p-7 h-full group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300"
                  style={{ background: 'rgba(5,202,255,0.1)', color: 'var(--accent)' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={svc.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{svc.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{svc.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn className="text-center mt-10" delay={0.3}>
          <a href="mailto:contact@kubesimplify.com" className="inline-flex items-center gap-2 text-sm font-semibold group" style={{ color: 'var(--accent)' }}>
            Discuss a custom package
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   TEAM
   ═══════════════════════════════════════════ */

function Team() {
  return (
    <section className="py-28 md:py-36 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <Badge text="Leadership" />
          <h2 className="text-display mb-6">Meet the Team</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Cloud native practitioners leading by example.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((person, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div className="glass-card rounded-2xl p-8 text-center">
                <img src={person.image} alt={person.name}
                  className="w-28 h-28 rounded-full object-cover object-top border-2 mx-auto mb-5"
                  style={{ borderColor: 'var(--border-medium)' }} />
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{person.name}</h3>
                <p className="text-sm font-semibold mb-4" style={{ color: 'var(--accent)' }}>{person.role}</p>
                <div className="flex flex-wrap justify-center gap-1.5 mb-5">
                  {person.credentials.map((c, j) => (
                    <span key={j} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: 'var(--border-subtle)', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                      {c}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-3">
                  {[
                    { href: person.twitter, label: 'X', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                    { href: person.linkedin, label: 'LinkedIn', d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                  ].map((s, k) => (
                    <a key={k} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.d} /></svg>
                    </a>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   PROJECTS
   ═══════════════════════════════════════════ */

function Projects() {
  return (
    <section className="py-28 md:py-36 border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <Badge text="Open Source" />
          <h2 className="text-display mb-6">Built in the Open</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            We don&apos;t just talk about open source &mdash; we build it.
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {projects.map((p, i) => (
            <StaggerItem key={i}>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="card-glow glass-card rounded-2xl p-7 block group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {p.logo ? (
                      <img src={p.logo} alt={p.name} className="w-10 h-10 rounded-lg object-contain" />
                    ) : (
                      <span className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: 'rgba(5,202,255,0.1)' }}>{p.emoji}</span>
                    )}
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{p.name}</h3>
                  </div>
                  <svg className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{p.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {p.tech.map((t, j) => (
                    <span key={j} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: 'rgba(5,202,255,0.1)', color: 'var(--accent)', border: '1px solid rgba(5,202,255,0.2)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </a>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn className="text-center mt-10" delay={0.3}>
          <a href="https://github.com/kubesimplify" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold group" style={{ color: 'var(--accent)' }}>
            View all repos on GitHub
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   BOOK
   ═══════════════════════════════════════════ */

function Book() {
  return (
    <section className="py-28 md:py-36 border-t relative overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#05CAFF] opacity-[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* Book cover - floating with subtle animation */}
          <FadeIn direction="left" className="flex-shrink-0">
            <div className="relative group">
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-[#5CFF68]/10 to-[#05CAFF]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img
                src="/img/book-cover.webp"
                alt="GPU-Enabled Platforms on Kubernetes - by Saiyam Pathak & Daniele Polencic"
                className="relative w-64 md:w-72 rounded-lg shadow-2xl transform group-hover:-translate-y-2 transition-transform duration-500"
                style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
              />
              <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider gradient-bg text-gray-950">
                Free
              </div>
            </div>
          </FadeIn>

          {/* Book info */}
          <FadeIn delay={0.15} className="flex-1 text-center md:text-left">
            <Badge text="Free E-Book" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>
              GPU-Enabled Platforms<br className="hidden sm:block" /> on Kubernetes
            </h2>
            <p className="text-base md:text-lg mb-3" style={{ color: 'var(--text-secondary)' }}>
              By <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Saiyam Pathak</span> & <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Daniele Polencic</span>
            </p>
            <p className="text-sm md:text-base mb-8 max-w-lg" style={{ color: 'var(--text-muted)' }}>
              The definitive guide to running AI/ML workloads on Kubernetes with GPU acceleration. Covers architecture patterns, scheduling, multi-tenancy, and real-world production strategies.
            </p>
            <a
              href="https://saiyampathak.gumroad.com/l/gpubook"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-8 py-4 rounded-xl text-base inline-flex items-center gap-2"
            >
              <span>Download Free Copy</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </a>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   WHY US
   ═══════════════════════════════════════════ */

function WhyUs() {
  return (
    <section className="py-28 md:py-36 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <Badge text="Why Kubesimplify" />
          <h2 className="text-display mb-6">Not Just Another<br className="hidden sm:block" /> Dev Agency</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Our leadership in the CNCF ecosystem gives us credibility no marketing agency can replicate.
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {differentiators.map((d, i) => (
            <StaggerItem key={i}>
              <div className="card-glow glass-card rounded-2xl p-8 group">
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black"
                    style={{ background: 'linear-gradient(135deg, rgba(5,202,255,0.15), rgba(92,255,104,0.15))', color: 'var(--accent)', border: '1px solid rgba(5,202,255,0.1)' }}>
                    {d.num}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{d.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{d.desc}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SECTION WRAPPER
   ═══════════════════════════════════════════ */

function SectionWrapper({ badge, title, subtitle, children, className = '' }) {
  return (
    <section className={`py-28 md:py-36 border-t ${className}`} style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <Badge text={badge} />
          <h2 className="text-display mb-6">{title}</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
        </FadeIn>
        <FadeIn delay={0.2}>{children}</FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   NEWSLETTER
   ═══════════════════════════════════════════ */

function Newsletter() {
  return (
    <section className="py-28 md:py-36 relative overflow-hidden border-t" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8">
        <FadeIn className="text-center mb-10">
          <Badge text="Newsletter" />
          <h2 className="text-display mb-6">Stay in the Loop</h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Weekly insights on Kubernetes, AI infrastructure, and cloud native engineering. Curated by practitioners.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a href="https://saiyampathak.substack.com/s/kubesimplify-diaries" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all hover:opacity-80"
              style={{ borderColor: 'rgba(92,255,104,0.3)', background: 'rgba(92,255,104,0.1)', color: '#a78bfa' }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent-secondary)] opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-secondary)]" />
              </span>
              Kubesimplify Diaries
            </a>
            <a href="https://saiyampathak.substack.com/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all hover:opacity-80"
              style={{ borderColor: 'rgba(5,202,255,0.3)', background: 'rgba(5,202,255,0.1)', color: 'var(--accent)' }}>
              Substack Newsletter
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <form action="https://saiyampathak.substack.com/welcome" method="get" target="_blank" className="glass-card rounded-2xl p-6 md:p-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="email" name="email" placeholder="your@email.com" required
                className="flex-1 px-5 py-3.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2"
                style={{ background: 'var(--border-subtle)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)', '--tw-ring-color': 'rgba(5,202,255,0.4)' }} />
              <button type="submit" className="btn-primary px-7 py-3.5 rounded-xl text-sm inline-flex items-center justify-center gap-2 min-w-[140px]">
                <span>Subscribe</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-xs" style={{ color: 'var(--text-muted)' }}>
              {['No spam, ever', 'Unsubscribe anytime', 'Weekly digest'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </form>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   CTA + CONTACT
   ═══════════════════════════════════════════ */

function CTA() {
  return (
    <section className="py-28 md:py-36">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <FadeIn>
          <div className="relative rounded-3xl overflow-hidden border" style={{ borderColor: 'rgba(5,202,255,0.15)' }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(5,202,255,0.06), rgba(92,255,104,0.04), rgba(5,202,255,0.06))' }} />
            <div className="absolute inset-0 hero-grid opacity-50" />
            <div className="relative z-10 py-16 md:py-20 px-8 md:px-16 text-center">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Let&apos;s Build Something<br className="hidden sm:block" /> Together
              </h2>
              <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Partnership inquiries, workshop requests, or just want to say hi? We&apos;d love to hear from you.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a href="mailto:contact@kubesimplify.com" className="btn-primary px-8 py-4 rounded-xl text-base inline-flex items-center gap-2">
                  <span>contact@kubesimplify.com</span>
                </a>
                <a href="https://discord.gg/26Z384WSPB" target="_blank" rel="noopener noreferrer" className="btn-secondary px-8 py-4 rounded-xl text-base inline-flex items-center gap-2">
                  Join Discord
                </a>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   HOME
   ═══════════════════════════════════════════ */

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustedBy />
      <Projects />
      <Services />
      <Team />
      <WhyUs />

      <SectionWrapper badge="YouTube" title="Latest Videos" subtitle="Cloud Native workshops and AI deep-dives from the best in the industry.">
        <YouTubeFeed count={3} source="channel" />
        <div className="text-center mt-10">
          <a href="https://www.youtube.com/@kubesimplify" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold group" style={{ color: 'var(--accent)' }}>
            Subscribe on YouTube
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </SectionWrapper>

      <SectionWrapper badge="Blog" title="Latest Articles" subtitle="Deep-dives and tutorials from our community."
        className="" style={{ background: 'var(--bg-secondary)' }}>
        <BlogFeed count={6} />
        <div className="text-center mt-10">
          <Link href="/blogs" className="inline-flex items-center gap-2 text-sm font-semibold group" style={{ color: 'var(--accent)' }}>
            View all articles
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </SectionWrapper>

      <Newsletter />
      <CTA />
    </main>
  );
}
