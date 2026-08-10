'use client';

import { useState } from 'react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/FadeIn';

const trustedBy = [
  'Cisco', 'Sysdig', 'Chainguard', 'Komodor', 'groundcover', 'OpenChoreo',
  'NudgeBee', 'CloudCasa', 'Armo', 'Namespace Labs', 'Robusta',
];

const reach = [
  { value: '100K+', label: 'Engineering community' },
  { value: '50K+', label: 'YouTube subscribers' },
  { value: '192', label: 'Deep-dive articles' },
  { value: '200K+', label: 'Social reach' },
];

const founders = [
  {
    name: 'Saiyam Pathak',
    image: '/img/saiyam-new.webp',
    creds: ['KubeCon Co-Chair', 'CNCF TAG Operational Resilience Chair', 'Kubestronaut', 'Keynotes at KubeCon, OSS & KCDs'],
  },
  {
    name: 'Saloni Narang',
    image: '/img/saloni_new.webp',
    creds: ['Docker Captain', 'CNCF Ambassador', 'Marketing Strategist', 'Community Builder'],
  },
];

const GOALS = [
  {
    id: 'launch',
    label: 'Launch something new',
    rec: 'Ad segment + YouTube deep-dive',
    detail:
      'Awareness first, depth second. A dedicated segment in a high-reach video puts your launch in front of tens of thousands of engineers fast; the deep-dive gives the curious ones a place to land and actually try it.',
  },
  {
    id: 'leads',
    label: 'Generate qualified leads',
    rec: 'Webinar + technical blog',
    detail:
      'A registration-based webinar captures the leads; the SEO-friendly blog post keeps capturing them for years through search. This pair consistently outperforms either format alone.',
  },
  {
    id: 'adoption',
    label: 'Drive product adoption',
    rec: 'Hands-on workshop + YouTube deep-dive',
    detail:
      'Engineers adopt what they have used. A live workshop gets your product into their terminals; the video deep-dive stays up as the permanent how-to that converts viewers into users.',
  },
  {
    id: 'credibility',
    label: 'Build long-term credibility',
    rec: 'Blog series + quarterly content program',
    detail:
      'Trust compounds. A practitioner-written series on a blog engineers already read, refreshed quarterly, builds the category authority that one-off campaigns never do.',
  },
];

const offerings = [
  {
    title: 'YouTube Technical Deep-Dive',
    desc: 'End-to-end production of a hands-on technical video: real cluster, real deployment, clear call to action. The format our audience trusts most.',
    icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Hands-on Workshop',
    desc: 'A live, expert-led workshop on your product or category, hosted with our community. The recording stays up and keeps converting.',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    title: 'Webinar Hosting',
    desc: 'Interactive webinar for lead generation and direct community engagement, with registration and follow-up support.',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  },
  {
    title: 'Sponsored Ad Segment',
    desc: 'A short dedicated segment inside an existing high-reach video. Best for brand awareness and launch announcements.',
    icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3',
  },
  {
    title: 'Technical Blog + Promotion',
    desc: 'A practitioner-written article on blog.kubesimplify.com with distribution across our social channels. SEO-friendly and permanent.',
    icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  },
  {
    title: 'Bundles & Custom Packages',
    desc: 'Video + webinar + article combinations, event coverage, or a quarterly content program. Tell us the goal; we design the package.',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  },
];

const processSteps = [
  { step: '01', title: 'Scope', desc: 'A 30-minute call: your product, your goal, the audience fit. We tell you honestly what format will work, and what will not.' },
  { step: '02', title: 'Produce', desc: 'We build the content hands-on: real clusters, real workloads. You review before anything ships.' },
  { step: '03', title: 'Report', desc: 'After launch you get the numbers: views, watch time, clicks, and community response. No vanity metrics.' },
];

function apiBase() {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  if (host === 'blog.kubesimplify.com') return '';
  if (host === 'localhost' || host === '127.0.0.1') {
    return window.location.port === '8802' ? '' : 'http://localhost:8802';
  }
  return 'https://blog.kubesimplify.com';
}

function GuidedRecommender({ onPick }) {
  const [goal, setGoal] = useState(null);
  const active = GOALS.find((g) => g.id === goal);

  return (
    <div className="rounded-3xl border p-8" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}>
      <p className="font-mono text-sm mb-2" style={{ color: 'var(--accent)' }}>$ kubesimplify recommend</p>
      <h2 className="text-2xl md:text-3xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>
        Not sure what you need?
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Pick your goal and we will tell you what actually works, the same advice you would get on a call with us.
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {GOALS.map((g) => (
          <button
            key={g.id}
            onClick={() => setGoal(g.id)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
            style={{
              background: goal === g.id ? 'var(--accent)' : 'transparent',
              color: goal === g.id ? '#03121a' : 'var(--text-secondary)',
              borderColor: goal === g.id ? 'var(--accent)' : 'var(--border-medium)',
            }}
          >
            {g.label}
          </button>
        ))}
      </div>
      {active && (
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-elevated)' }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--accent)' }}>
            Our recommendation
          </p>
          <p className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{active.rec}</p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{active.detail}</p>
          <button
            onClick={() => onPick(active)}
            className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold"
          >
            Ask about this package →
          </button>
        </div>
      )}
    </div>
  );
}

function InquiryForm({ prefill }) {
  const [form, setForm] = useState({ name: '', company: '', email: '', message: '' });
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const goal = prefill?.rec || 'Custom package';

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setState('busy');
    setError('');
    try {
      const res = await fetch(`${apiBase()}/api/partner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, goal }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || `HTTP ${res.status}`);
      }
      setState('done');
    } catch (err) {
      setState('idle');
      setError(String(err.message || err));
    }
  };

  if (state === 'done') {
    return (
      <div id="partner-form" className="rounded-3xl border p-10 text-center" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}>
        <p className="text-4xl mb-4" aria-hidden>🤝</p>
        <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Got it. We will reply within 2 business days.</h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Your inquiry is in. If it is urgent, email contact@kubesimplify.com directly.
        </p>
      </div>
    );
  }

  const inputStyle = {
    borderColor: 'var(--border-medium)',
    color: 'var(--text-primary)',
    background: 'transparent',
  };

  return (
    <form
      id="partner-form"
      onSubmit={submit}
      className="rounded-3xl border p-8"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}
    >
      <h3 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>Start the conversation</h3>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Interested in: <span className="font-semibold" style={{ color: 'var(--accent)' }}>{goal}</span>
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input required placeholder="Your name" value={form.name} onChange={set('name')}
          className="rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" style={inputStyle} />
        <input placeholder="Company" value={form.company} onChange={set('company')}
          className="rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" style={inputStyle} />
      </div>
      <input required type="email" placeholder="Work email" value={form.email} onChange={set('email')}
        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] mb-4" style={inputStyle} />
      <textarea rows={4} placeholder="What are you building, and what does success look like?" value={form.message} onChange={set('message')}
        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] mb-4" style={inputStyle} />
      {error && <p className="text-sm mb-3 text-red-500">{error}</p>}
      <button type="submit" disabled={state === 'busy'} className="btn-primary px-8 py-3.5 rounded-xl text-sm font-semibold disabled:opacity-60">
        {state === 'busy' ? 'Sending…' : 'Send inquiry →'}
      </button>
      <p className="text-[11px] mt-3" style={{ color: 'var(--text-muted)' }}>
        We only use these details to reply to you. <a href="/privacy" className="underline">Privacy</a>
      </p>
    </form>
  );
}

export default function Partnerships() {
  const [prefill, setPrefill] = useState(null);

  const pick = (g) => {
    setPrefill(g);
    document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <main className="pt-24">
      {/* Hero */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-8">
              Partnerships
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Reach the engineers who run the clusters
            </h1>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Workshops, technical videos, and deep-dive articles for a 100K+ cloud native
              audience, produced by practitioners the ecosystem already trusts.
            </p>
          </FadeIn>

          <FadeIn className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {reach.map((s) => (
              <div key={s.label} className="py-5 px-4 rounded-xl border text-center" style={{ borderColor: 'var(--border-subtle)', background: 'var(--border-subtle)' }}>
                <div className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </FadeIn>

          <FadeIn className="mt-12 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5" style={{ color: 'var(--text-muted)' }}>
              Teams we have worked with
            </p>
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-3">
              {trustedBy.map((name) => (
                <span key={name} className="text-lg font-bold opacity-60" style={{ color: 'var(--text-secondary)' }}>{name}</span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Guided recommender */}
      <section className="py-14 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <GuidedRecommender onPick={pick} />
          </FadeIn>
        </div>
      </section>

      {/* Offerings */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: 'var(--text-primary)' }}>What we produce together</h2>
            <p className="text-base" style={{ color: 'var(--text-secondary)' }}>Every format is technical, hands-on, and made for engineers.</p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offerings.map((o, i) => (
              <StaggerItem key={i}>
                <div className="card-glow glass-card rounded-2xl p-7 h-full group">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center mb-5 text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-gray-950 transition-all duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={o.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text-primary)' }}>{o.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{o.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Founders + process */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3" style={{ color: 'var(--text-primary)' }}>Who you are working with</h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Not an agency. The people who make your content are the people the ecosystem already knows.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
            {founders.map((f) => (
              <FadeIn key={f.name}>
                <div className="rounded-2xl border p-6 flex items-start gap-5 h-full" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}>
                  <img src={f.image} alt={f.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" loading="lazy" />
                  <div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{f.name}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {f.creds.map((c) => (
                        <span key={c} className="text-[11px] font-semibold px-2 py-1 rounded-md" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {processSteps.map((p) => (
              <FadeIn key={p.step}>
                <div className="rounded-2xl border p-7 h-full" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}>
                  <p className="font-mono text-sm mb-3" style={{ color: 'var(--accent)' }}>{p.step}</p>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{p.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="mt-10 text-center">
            <p className="text-sm max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-bold" style={{ color: 'var(--accent-secondary)' }}>We say no.</span>{' '}
              We only take partnerships our audience will genuinely benefit from. That is exactly
              why the audience trusts the recommendations.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <InquiryForm prefill={prefill} />
          </FadeIn>
          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            Prefer email? <a href="mailto:contact@kubesimplify.com" className="underline hover:text-[var(--accent)]">contact@kubesimplify.com</a>
          </p>
        </div>
      </section>
    </main>
  );
}
