'use client';

import { FadeIn, StaggerContainer, StaggerItem } from '@/components/FadeIn';

const books = [
  {
    title: 'GPU-Enabled Platforms on Kubernetes',
    desc: 'The definitive guide to running AI/ML workloads on Kubernetes with GPU acceleration. Architecture patterns, scheduling, multi-tenancy, and production strategies.',
    authors: 'Saiyam Pathak & Daniele Polencic',
    url: 'https://saiyampathak.gumroad.com/l/gpubook',
    image: '/img/book-cover.webp',
    tags: ['GPU', 'Kubernetes', 'AI/ML'],
  },
  {
    title: "Let's Learn CKS Scenarios",
    desc: 'Hands-on scenarios and practice questions for the Certified Kubernetes Security Specialist exam. Covers cluster security, system hardening, supply chain security, and more.',
    authors: 'Saiyam Pathak',
    url: 'https://saiyampathak.gumroad.com/l/cksbook',
    tags: ['CKS', 'Security', 'Certification'],
  },
  {
    title: 'CKA Study Guide',
    desc: 'Comprehensive study guide for the Certified Kubernetes Administrator exam with real-world scenarios and practice exercises.',
    authors: 'Community & Saiyam Pathak',
    url: 'https://saiyampathak.gumroad.com/l/cka',
    tags: ['CKA', 'Kubernetes', 'Certification'],
  },
  {
    title: 'Cloud Native Visuals by Kubesimplify',
    desc: 'Visual guides on various cloud native topics compiled into one book. Learn Kubernetes, Docker, and CNCF projects through diagrams and illustrations.',
    authors: 'Kubesimplify',
    url: 'https://saiyampathak.gumroad.com/l/visualbook',
    tags: ['Visual Guide', 'Cloud Native', 'Beginners'],
  },
];

const talks = [
  // 2025
  { year: '2025', event: 'KubeCon NA', title: 'Open Source at the Edge: Hardware, Firmware, and AI Stacks', video: 'https://youtu.be/W9Uj8x_qimE' },
  { year: '2025', event: 'KubeCon NA', title: 'Building Resilient Cloud Native Infrastructure', video: 'https://youtu.be/I7TuNNsJSZc' },
  { year: '2025', event: 'KubeCon NA', title: 'PE Keynote: AI-Ready Platforms' },
  { year: '2025', event: 'KubeCon India', title: 'Keynote: From Outage To Observability — Kubernetes Meltdown Lessons', video: 'https://youtu.be/7JCZ688cWpY' },
  { year: '2025', event: 'KubeCon EU', title: 'A Huge Cluster or Multi-Clusters? Identifying the Bottleneck', video: 'https://www.youtube.com/watch?v=6l5zCt5QsdY' },
  { year: '2025', event: 'FOSDEM', title: 'Accelerating CI Pipelines: Rapid Kubernetes Testing with vCluster' },
  { year: '2025', event: 'ContainerDays Hamburg', title: 'LLMs on Kubernetes & Kubernetes Hacks' },
  { year: '2025', event: 'Rejekts NA', title: 'Beyond the Default Scheduler: GPU Multi-Tenancy' },
  { year: '2025', event: 'Google Cloud Community Day', title: 'Keynote: AI at Scale with LLMs on Kubernetes' },
  { year: '2025', event: 'Gitex Global Dubai', title: 'GPU Infrastructure Workshop' },
  { year: '2025', event: 'KCD Sri Lanka', title: 'Keynote: Running AI Workloads on Kubernetes' },
  { year: '2025', event: 'WasmI/O', title: 'AI Workloads with WASM & Privacy-First LLM Web Apps' },
  { year: '2025', event: 'DevOps 2.0 Confex', title: 'AI Meets Kubernetes: GPU Infrastructure Design' },
  // 2024
  { year: '2024', event: 'KubeCon India', title: 'Cell-Based Kubernetes — Scalable, Repeatable and Resilient', video: 'https://youtu.be/oacoUMdD4_Y' },
  { year: '2024', event: 'KubeCon NA', title: 'Cloud Native Sustainability Speedrun', video: 'https://youtu.be/X-0zyyWRkiM' },
  { year: '2024', event: 'KubeCon NA', title: "CNCF's Environmental Sustainability TAG", video: 'https://www.youtube.com/watch?v=PfuSzPv7fSQ' },
  { year: '2024', event: 'KubeCon EU', title: 'Building a Tool to Debug Minimal Container Images', video: 'https://youtu.be/H5NES1Is7rw' },
  { year: '2024', event: 'KubeCon EU', title: 'Heating Pools with Cloud Power: Green Computing', video: 'https://youtu.be/LCtceKToWxU' },
  { year: '2024', event: 'ContainerDays', title: 'Building Scalable Cloud Native AI Apps with WebAssembly' },
  { year: '2024', event: 'WasmCon', title: 'Exploring OpenTelemetry for Wasm' },
  { year: '2024', event: 'Wasm I/O', title: 'Accelerating ML Inferencing with WebAssembly & Spin 2.0' },
  { year: '2024', event: 'Civo Navigate US', title: 'Generative AI in the Kubernetes Era with Kubeflow' },
  { year: '2024', event: 'KCD Pune', title: 'Keynote: Generative AI on Kubernetes' },
  { year: '2024', event: 'KCD Hyderabad', title: 'Keynote: Supply Chain Security in 2024' },
  { year: '2024', event: 'SOSS Community Days', title: 'Cooking up Secure OCI Artifacts with SLSA' },
  // 2023 and earlier
  { year: '2023', event: 'KubeCon NA', title: 'Talk at KubeCon North America 2023', video: 'https://youtu.be/9rycN3g-pSs' },
  { year: '2023', event: 'KubeCon EU', title: 'Talk at KubeCon Europe 2023', video: 'https://youtu.be/dlgQXrDfqzs' },
  { year: '2022', event: 'KubeCon EU', title: 'Talk at KubeCon Europe 2022', video: 'https://youtu.be/u7vUA61sZI4' },
  { year: '2022', event: 'KubeCon EU', title: 'Talk at KubeCon Europe 2022', video: 'https://youtu.be/ItUUqejdXr0' },
  { year: '2021', event: 'KubeCon EU', title: 'Talk at KubeCon Europe 2021', video: 'https://youtu.be/btGFt5-37hs' },
  { year: '2020', event: 'KubeCon EU', title: 'Talk at KubeCon Europe 2020', video: 'https://youtu.be/2Eqg-oKRIR8' },
];

const publications = [
  { outlet: 'vCluster / Loft Labs', articles: [
    'Workload Sleep Mode', 'vCluster on Specific Nodes', 'vCluster 0.22 Cert Manager Integration',
    'Ephemeral PR Environments using vCluster', 'Multi-tenancy in 2025 and Beyond',
    'Bare-metal Kubernetes with GPU Challenges', 'Karpenter GCP Setup Guide',
    'vCluster Auto Nodes Deep Dive', 'NVIDIAscape Container Breakout Security',
    'vCluster Performance & Cost Optimization', 'Running Dedicated Clusters with Private Nodes',
  ]},
  { outlet: 'The New Stack', articles: ['Publications on cloud native and Kubernetes topics'] },
  { outlet: 'CNCF Blog', articles: ['Cloud native ecosystem and CNCF project articles'] },
  { outlet: 'Google Cloud', articles: ['Google Cloud community and Kubernetes articles'] },
  { outlet: 'Civo Blog', articles: ['Kubernetes and cloud native tutorials'] },
];

const years = [...new Set(talks.map(t => t.year))].sort((a, b) => b - a);

function Badge({ text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] mb-8"
      style={{ borderColor: 'rgba(5,202,255,0.2)', background: 'rgba(5,202,255,0.05)', color: 'var(--accent)' }}>
      {text}
    </div>
  );
}

export default function Resources() {
  return (
    <main className="pt-24">
      {/* Header */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn className="text-center max-w-4xl mx-auto">
            <Badge text="Resources" />
            <h1 className="text-display mb-6">
              Talks, Books &<br className="hidden sm:block" /> Publications
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Conference keynotes at KubeCon worldwide, free e-books on Kubernetes certifications, and technical publications across the cloud native ecosystem.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Free Books */}
      <section className="py-20 md:py-24 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn className="mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>Free E-Books</h2>
            <p className="text-base" style={{ color: 'var(--text-secondary)' }}>All books are free. Download and share.</p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {books.map((book, i) => (
              <StaggerItem key={i}>
                <a href={book.url} target="_blank" rel="noopener noreferrer"
                  className="card-glow glass-card rounded-2xl p-6 flex gap-5 group block">
                  {book.image ? (
                    <img src={book.image} alt={book.title} className="w-20 h-28 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-28 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl"
                      style={{ background: 'rgba(5,202,255,0.1)' }}>
                      📖
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-base font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>{book.title}</h3>
                      <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider gradient-bg text-gray-950">Free</span>
                    </div>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{book.authors}</p>
                    <p className="text-sm leading-relaxed mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{book.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {book.tags.map((t, j) => (
                        <span key={j} className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                          style={{ background: 'rgba(5,202,255,0.1)', color: 'var(--accent)', border: '1px solid rgba(5,202,255,0.2)' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </a>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Conference Talks */}
      <section className="py-20 md:py-24 border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn className="mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>Conference Talks</h2>
            <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
              {talks.length}+ talks at KubeCon, FOSDEM, ContainerDays, WasmCon, and more.
            </p>
          </FadeIn>

          {years.map((year) => (
            <FadeIn key={year} className="mb-12 last:mb-0">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                <span className="px-3 py-1 rounded-lg text-sm font-bold gradient-bg text-gray-950">{year}</span>
                <span className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
              </h3>
              <div className="grid gap-3">
                {talks.filter(t => t.year === year).map((talk, i) => (
                  <div key={i} className="glass-card rounded-xl p-4 flex items-center gap-4 group hover:border-[rgba(5,202,255,0.2)] transition-all">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ background: 'rgba(5,202,255,0.1)', color: 'var(--accent)' }}>
                      {talk.event.includes('Keynote') || talk.title.includes('Keynote') ? '🎤' : '🎙'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>{talk.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{talk.event}</p>
                    </div>
                    {talk.video && (
                      <a href={talk.video} target="_blank" rel="noopener noreferrer"
                        className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                        style={{ background: 'rgba(5,202,255,0.1)', color: 'var(--accent)', border: '1px solid rgba(5,202,255,0.2)' }}>
                        Watch ▶
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Publications */}
      <section className="py-20 md:py-24 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn className="mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>Publications</h2>
            <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
              Technical articles published across industry-leading platforms.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {publications.map((pub, i) => (
              <StaggerItem key={i}>
                <div className="glass-card rounded-2xl p-6 h-full">
                  <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{pub.outlet}</h3>
                  <ul className="space-y-2">
                    {pub.articles.map((a, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeIn className="text-center mt-10" delay={0.2}>
            <a href="https://blog.kubesimplify.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold group" style={{ color: 'var(--accent)' }}>
              Read more on blog.kubesimplify.com
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
