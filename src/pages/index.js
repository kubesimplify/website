import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import YouTubeFeed from '@site/src/components/YouTubeFeed';
import BlogFeed from '@site/src/components/BlogFeed';

// ... imports remain the same ...

function Hero() {
  return (
    <section className="hero-section-new relative overflow-hidden bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#111625] min-h-[85vh] flex items-center">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        {/* Left glow */}
        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-gradient-to-tr from-[rgba(0,242,255,0.4)] via-[rgba(112,0,255,0.2)] to-transparent blur-3xl" />
        {/* Right glow */}
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-gradient-to-tr from-[rgba(112,0,255,0.3)] via-[rgba(0,242,255,0.2)] to-transparent blur-3xl" />
        {/* Center animated blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl pointer-events-none">
          <div className="hero-blob-1 absolute top-[20%] left-[10%] w-[600px] h-[600px] rounded-full blur-[120px] animate-blob opacity-40" />
          <div className="hero-blob-2 absolute top-[30%] right-[10%] w-[600px] h-[600px] rounded-full blur-[120px] animate-blob animation-delay-2000 opacity-40" />
        </div>
      </div>

      {/* Main content - two column layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* LEFT: Content */}
          <div className="lg:col-span-7 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-cyan-100 backdrop-blur animate-fade-in">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-tr from-[#00f2ff] to-[#7000ff] text-[0.6rem]">
                ★
              </span>
              <span>CLOUD NATIVE & AI HUB</span>
            </div>

            {/* Main Title */}
            <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl animate-fade-in animation-delay-100">
              Learn Cloud Native & AI.
              <br />
              <span className="bg-gradient-to-r from-[#00f2ff] via-[#5b9fff] to-[#9d4dff] bg-clip-text text-transparent">
                Expert-led, hands-on.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-lg leading-relaxed text-gray-300 sm:text-xl max-w-2xl mx-auto animate-fade-in animation-delay-200">
              Hands-on Kubernetes and AI workshops, deep-dive content, and open source education designed for real-world engineering teams.
            </p>

            {/* CTAs - Centered with Square Box Design */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in animation-delay-300">
              <Link
                to="/workshops"
                className="hero-btn-start-learning inline-flex items-center justify-center px-8 py-4 text-base font-bold shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span>Start Learning</span>
                <span className="ml-2 text-xl">↗</span>
              </Link>
              <Link
                to="/partnerships"
                className="hero-btn-become-partner inline-flex items-center justify-center px-8 py-4 text-base font-bold transition-all duration-300 hover:scale-105"
              >
                Become a Partner
              </Link>
            </div>

            {/* Stats - Below CTAs, Centered */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 animate-fade-in animation-delay-400">
              <div className="text-center">
                <div className="text-3xl font-semibold text-white">100K+</div>
                <div className="mt-1 text-xs uppercase tracking-wide text-gray-400">Community Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-white">50K+</div>
                <div className="mt-1 text-xs uppercase tracking-wide text-gray-400">Youtube Subscribers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-white">100+</div>
                <div className="mt-1 text-xs uppercase tracking-wide text-gray-400">Workshops/Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-white">120K+</div>
                <div className="mt-1 text-xs uppercase tracking-wide text-gray-400">Social Reach</div>
              </div>
            </div>
          </div>

          {/* RIGHT: Animated blocks with tech logos */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative h-[500px] w-full">
              {/* Kubernetes Logo */}
              <div className="absolute top-10 right-10 w-36 h-36 hero-floating-card-1 rounded-lg backdrop-blur-md border shadow-2xl animate-float flex items-center justify-center p-4">
                <img 
                  src="/img/kubernetes-logo.svg" 
                  alt="Kubernetes" 
                  className="w-full h-full object-contain hero-logo-kubernetes"
                />
              </div>
              
              {/* Docker Logo */}
              <div className="absolute top-40 left-10 w-40 h-40 hero-floating-card-2 rounded-lg backdrop-blur-md border shadow-2xl animate-float animation-delay-2000 flex items-center justify-center p-4">
                <img 
                  src="/img/docker-logo.svg" 
                  alt="Docker" 
                  className="w-full h-full object-contain hero-logo-docker"
                />
              </div>
              
              {/* AI Text */}
              <div className="absolute bottom-20 right-20 w-36 h-36 hero-floating-card-3 rounded-lg backdrop-blur-md border shadow-2xl animate-float animation-delay-4000 flex items-center justify-center p-4">
                <span className="text-4xl font-black opacity-90 hero-logo-ai" style={{fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.1em'}}>AI</span>
              </div>
              
              {/* ArgoCD Logo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 hero-floating-card-1 rounded-lg backdrop-blur-md border shadow-xl animate-float animation-delay-3000 flex items-center justify-center p-3">
                <img 
                  src="/img/argocd-logo.svg" 
                  alt="ArgoCD" 
                  className="w-full h-full object-contain hero-logo-argocd"
                />
              </div>
              
              {/* Grid pattern overlay */}
              <div className="absolute inset-0 hero-grid-pattern opacity-10" />
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

function PartnershipSection() {
  return (
    <div className="partnership-section relative py-8 md:py-10">
      <div className="w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        <Link 
          to="/partnerships" 
          className="group relative block overflow-hidden rounded-2xl border border-white/10 dark:border-white/10 bg-dark-card hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,242,255,0.15)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 p-6 md:p-8">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-bold text-theme mb-1 group-hover:text-primary transition-colors duration-300">
                  Support the Mission
                </h3>
                <p className="text-sm text-theme-secondary line-clamp-1">
                  Help us keep education free and accessible
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-primary font-semibold text-sm md:text-base whitespace-nowrap">
                Become a Partner
              </span>
              <svg className="w-5 h-5 text-primary transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

function Stats() {
  return (
    <div className="stats-section w-full">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 py-16 md:py-20 text-center">
          {[
            { label: 'Community Members', value: '100K+' },
            { label: 'Youtube Subscribers', value: '50K+' },
            { label: 'Workshops/Events', value: '100+' },
            { label: 'Social Reach', value: '120K+' },
          ].map((stat, idx) => (
            <div key={idx} className="stat-item">
              <div className="stat-value text-5xl md:text-6xl lg:text-7xl font-black mb-3">{stat.value}</div>
              <div className="stat-label text-sm md:text-base font-bold uppercase tracking-wider opacity-70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children, className = "" }) {
  return (
    <section className={`content-section py-24 md:py-32 ${className}`}>
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="section-title text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="section-subtitle text-lg md:text-xl max-w-2xl mx-auto opacity-80">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Simplify Cloud Native for All">

      <main className="main-content min-h-screen font-sans overflow-x-hidden relative">
        <Hero />
        <PartnershipSection />
        <Section
          title="Latest on Kubesimplify YouTube"
          subtitle="Hands-on learning from the best in the industry."
        >
          <YouTubeFeed />
        </Section>
        <Section
          title="Recent Articles"
          subtitle="Insights and guides from our technical writers."
          className="articles-section"
        >
          <BlogFeed />
        </Section>
        <div className="newsletter-section relative py-20 md:py-28 lg:py-32 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-[rgba(0,242,255,0.15)] via-[rgba(112,0,255,0.1)] to-[rgba(0,242,255,0.15)] blur-3xl opacity-50" />
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-[rgba(112,0,255,0.2)] to-transparent blur-2xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-gradient-to-tr from-[rgba(0,242,255,0.2)] to-transparent blur-2xl" />
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 lg:px-16">
            {/* Header */}
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold text-primary mb-6 backdrop-blur-sm">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-tr from-[#00f2ff] to-[#7000ff] text-[0.6rem] animate-pulse">
                  ✨
                </span>
                <span>EXCLUSIVE CONTENT</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                  Join the Inner Circle
                </span>
              </h2>
              <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 leading-relaxed">
                Get exclusive insights, early access to workshops, and premium content delivered straight to your inbox.
                <br />
                <span className="text-primary font-semibold">No spam, ever. Unsubscribe anytime.</span>
              </p>
            </div>

            {/* Newsletter Card */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00f2ff] via-[#7000ff] to-[#00f2ff] rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              <form 
                action="https://saiyampathak.substack.com/welcome" 
                method="get" 
                target="_blank"
                className="relative bg-gradient-to-br from-[#0a0a0a] via-[#111625] to-[#0a0a0a] rounded-3xl border border-white/10 p-8 md:p-10 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_40px_rgba(0,242,255,0.2)]"
              >
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6">
                  {/* Email Input */}
                  <div className="flex-1 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl blur-sm opacity-50" />
                    <div className="relative flex items-center">
                      <div className="absolute left-3 z-10 pointer-events-none flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input 
                        type="email" 
                        name="email"
                        placeholder="           Enter your email address" 
                        className="w-full pl-24 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 text-base font-medium backdrop-blur-sm" 
                        required 
                      />
                    </div>
                  </div>

                  {/* Subscribe Button */}
                  <button 
                    type="submit"
                    className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-[#00f2ff] to-[#7000ff] text-white font-bold text-base shadow-lg hover:shadow-[0_0_30px_rgba(0,242,255,0.5)] transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 min-w-[160px] overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#7000ff] to-[#00f2ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10 flex items-center gap-2">
                      Subscribe
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                </div>

                {/* Trust indicators */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>No spam, ever</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Unsubscribe anytime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Weekly digest</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
