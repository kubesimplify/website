'use client';

import Link from 'next/link';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/FadeIn';

const offerings = [
  {
    title: 'YouTube Technical Deep-Dive',
    desc: 'End-to-end production of a high-quality technical video with a clear Call to Action. Perfect for product demos and tutorials.',
    icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Sponsored Ad Segment',
    desc: '10-15s dedicated segment inserted into an existing high-reach video. Ideal for brand awareness and quick announcements.',
    icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3',
  },
  {
    title: 'Webinar Hosting',
    desc: 'Interactive webinar hosted on Kubesimplify. Perfect for lead generation and direct community engagement.',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  },
  {
    title: 'Video + Webinar Bundle',
    desc: 'High-impact combination of a deep-dive video and an interactive webinar. Maximum exposure across multiple channels.',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  },
  {
    title: 'Blog Post + Promotion',
    desc: 'Technical blog on kubesimplify.com with social media distribution. SEO-friendly and long-lasting content.',
    icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  },
  {
    title: 'LinkedIn Article',
    desc: 'SEO-optimized long-form article for maximum professional reach on the world\'s largest professional network.',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
];

export default function Partnerships() {
  return (
    <main className="pt-24">
      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-8">
              Partnership Opportunities
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Partner With Us
            </h1>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Accelerate your growth in the Cloud Native ecosystem. Connect with{' '}
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>100K+ developers</span> through tailored content.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Offerings */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: 'var(--text-primary)' }}>Content Offerings</h2>
            <p className="text-base" style={{ color: 'var(--text-secondary)' }}>High-quality technical content tailored to your brand goals.</p>
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

      {/* CTA */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="relative rounded-3xl overflow-hidden border border-[var(--accent)]/10">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.08] via-violet-500/[0.04] to-cyan-500/[0.08]" />
              <div className="relative z-10 py-16 px-8 md:px-16 text-center">
                <h2 className="text-2xl md:text-4xl font-extrabold mb-6" style={{ color: 'var(--text-primary)' }}>Ready to make an impact?</h2>
                <p className="text-base mb-10 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                  Let's discuss how we can help you achieve your DevRel and marketing goals with custom packages.
                </p>
                <a
                  href="mailto:kubesimplify@gmail.com"
                  className="btn-primary px-10 py-4 rounded-xl text-base inline-flex items-center gap-2"
                >
                  <span>Contact Us Today</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
