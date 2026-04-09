'use client';

import { FadeIn, StaggerContainer, StaggerItem } from '@/components/FadeIn';

const team = [
  {
    name: 'Saiyam Pathak',
    role: 'Founder',
    bio: 'KubeCon Co-Chair, Kubestronaut, CNCF TAG Operational Resilience Chair, Kubernetes Certification SME, Keynote Speaker, and educator who has taught Kubernetes and cloud native technologies to millions globally.',
    credentials: ['KubeCon Co-Chair', 'CNCF TAG Operational Resilience Chair', 'Kubestronaut', 'Kubernetes Certification SME', 'Keynote Speaker', 'Author'],
    image: '/img/saiyam-new.jpg',
    twitter: 'https://twitter.com/saiyampathak',
    linkedin: 'https://linkedin.com/in/saiyampathak',
    github: 'https://github.com/saiyam1814',
  },
  {
    name: 'Saloni Narang',
    role: 'Co-Founder',
    bio: 'CNCF Ambassador, Docker Captain, Marketing strategist and community builder. Saloni drives partnerships, content strategy, and community growth across the Kubesimplify ecosystem.',
    credentials: ['CNCF Ambassador', 'Docker Captain', 'Marketing Strategist', 'Community Builder'],
    image: '/img/saloni_new.png',
    twitter: 'https://twitter.com/saloninrng',
    linkedin: 'https://www.linkedin.com/in/saloni-narang-a5b7a3166/',
  },
];

const offerings = [
  {
    title: 'Workshops & Training',
    desc: 'Hands-on, instructor-led workshops on Kubernetes, AI/ML infrastructure, GitOps, service mesh, and more. Designed for real-world engineering teams.',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    title: 'Mentorship & Guidance',
    desc: 'Personalized mentorship for engineers looking to break into cloud native, get certified, or advance their careers in the CNCF ecosystem.',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    title: 'Community',
    desc: 'Join 100K+ engineers learning together. Active Discord, live events, open source contributions, and a welcoming space for all skill levels.',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
];

export default function About() {
  return (
    <main className="pt-24">
      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-8">
              About Us
            </div>
            <h1 className="text-display-lg mb-6" style={{ color: 'var(--text-primary)' }}>
              Simplifying Cloud Native<br className="hidden sm:block" />
              <span className="gradient-text"> & AI for All</span>
            </h1>
            <p className="text-xl leading-relaxed max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Kubesimplify was founded with a singular mission: to provide high-quality, accessible education on Kubernetes, AI/ML, and cloud native technologies to engineers everywhere &mdash; regardless of their background or experience level.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-display mb-4" style={{ color: 'var(--text-primary)' }}>Leadership</h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Cloud native practitioners leading by example.</p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {team.map((person, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="glass-card rounded-2xl p-8 md:p-10 group hover:border-[var(--accent)]/20 transition-all duration-500">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <img
                        src={person.image}
                        alt={person.name}
                        className="w-24 h-24 rounded-2xl object-cover object-top border-2 border-white/10"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{person.name}</h3>
                      <p className="text-[var(--accent)] text-sm font-semibold mb-3">{person.role}</p>
                      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{person.bio}</p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {person.credentials.map((c, j) => (
                          <span key={j} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/[0.04] border border-white/[0.08] text-gray-300" style={{ color: 'var(--text-secondary)' }}>
                            {c}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <a href={person.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all" aria-label="Twitter">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </a>
                        <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all" aria-label="LinkedIn">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                        </a>
                        {person.github && (
                          <a href={person.github} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all" aria-label="GitHub">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20 md:py-28 border-t border-white/[0.04] bg-gray-950/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-display mb-4" style={{ color: 'var(--text-primary)' }}>What We Offer</h2>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {offerings.map((o, i) => (
              <StaggerItem key={i}>
                <div className="glass-card rounded-2xl p-7 h-full group hover:border-[var(--accent)]/20 transition-all duration-500">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center mb-5 text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-gray-950 transition-all duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={o.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{o.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{o.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </main>
  );
}
