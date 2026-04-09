'use client';

import { FadeIn } from '@/components/FadeIn';
import YouTubeFeed from '@/components/YouTubeFeed';

export default function Workshops() {
  return (
    <main className="pt-24">
      {/* Header */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] mb-8"
              style={{ borderColor: 'rgba(5,202,255,0.2)', background: 'rgba(5,202,255,0.05)', color: 'var(--accent)' }}>
              Watch & Learn
            </div>
            <h1 className="text-display mb-6">
              Deep-Dive Content
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Hands-on workshops and technical deep-dives on Cloud Native and AI &mdash; from beginner fundamentals to production-grade architectures.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Cloud Native Workshops */}
      <section className="pb-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: 'rgba(5,202,255,0.1)' }}>
                ☸
              </div>
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Cloud Native Workshops
              </h2>
            </div>
            <p className="text-sm ml-11" style={{ color: 'var(--text-secondary)' }}>
              Kubernetes, GitOps, service mesh, security, and the entire CNCF stack.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <YouTubeFeed count={6} source="workshops" />
          </FadeIn>

          <FadeIn delay={0.2} className="mt-8 ml-11">
            <a
              href="https://youtube.com/playlist?list=PL5uLNcv9SibBrCVC9lKwRHOV6GjUbAhIn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold group" style={{ color: 'var(--accent)' }}
            >
              View full playlist
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </FadeIn>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="section-divider" />
      </div>

      {/* AI / DGX Spark */}
      <section className="py-24 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: 'rgba(92,255,104,0.1)' }}>
                🤖
              </div>
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                AI & DGX Spark
              </h2>
            </div>
            <p className="text-sm ml-11" style={{ color: 'var(--text-secondary)' }}>
              AI infrastructure, GPU computing, ML workflows, and NVIDIA DGX deep-dives.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <YouTubeFeed count={6} source="dgxspark" />
          </FadeIn>

          <FadeIn delay={0.2} className="mt-8 ml-11">
            <a
              href="https://youtube.com/playlist?list=PL5uLNcv9SibAv1mMBJtiPluQQ32TMOqTX"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold group" style={{ color: 'var(--accent)' }}
            >
              View full playlist
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-28 md:pb-36">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <FadeIn>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Want even more?</p>
            <a
              href="https://www.youtube.com/@kubesimplify"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-8 py-4 rounded-xl text-base inline-flex items-center gap-2"
            >
              <span>Subscribe on YouTube</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
              </svg>
            </a>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
