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
    <Section className="partnership-section relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 text-center">
        <h2 className="section-title text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Support the Mission</h2>
        <p className="section-subtitle text-base md:text-lg max-w-2xl mx-auto mb-8 opacity-80">
          Kubesimplify is powered by community and partners. Help us keep education free and accessible.
        </p>
        <div className="flex flex-wrap justify-center gap-8">
          <Link to="/partnerships" className="partnership-card group relative flex items-center gap-4 px-8 py-6 rounded-2xl transition-all duration-500 hover:-translate-y-2 max-w-md">
            <div className="partnership-icon w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="text-left flex-1">
              <h3 className="partnership-title text-lg font-bold group-hover:opacity-90 transition-opacity duration-300">Become a Sponsor</h3>
              <p className="partnership-subtitle text-sm opacity-70 group-hover:opacity-90 transition-opacity">View Partnership Plans</p>
            </div>
            <svg className="w-5 h-5 ml-auto opacity-60 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </div>
    </Section>
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
          title="Latest Workshops"
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
        <div className="newsletter-section py-16 md:py-24 lg:py-28 relative z-10">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 text-center">
            <h2 className="section-title text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Join the Inner Circle</h2>
            <p className="section-subtitle text-base md:text-lg max-w-2xl mx-auto mb-8 opacity-80">
              Get exclusive content delivered to your inbox.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <form 
                action="https://saiyampathak.substack.com/welcome" 
                method="get" 
                target="_blank"
                className="newsletter-card group relative flex items-center gap-4 px-8 py-6 rounded-2xl transition-all duration-500 hover:-translate-y-2 max-w-2xl w-full"
              >
                <div className="newsletter-icon w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Enter your email address" 
                    className="newsletter-input w-full px-4 py-2 rounded-lg focus:outline-none transition-all text-base bg-transparent" 
                    required 
                  />
                </div>
                <div className="text-left flex-shrink-0 hidden sm:block">
                  <h3 className="newsletter-title text-lg font-bold group-hover:opacity-90 transition-opacity duration-300">Subscribe</h3>
                  <p className="newsletter-subtitle text-sm opacity-70 group-hover:opacity-90 transition-opacity">No spam, ever</p>
                </div>
                <button 
                  type="submit"
                  className="ml-auto flex-shrink-0"
                >
                  <svg className="w-5 h-5 opacity-60 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
