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
    desc: 'Hands-on scenarios and practice questions for the Certified Kubernetes Security Specialist exam.',
    authors: 'Saiyam Pathak',
    url: 'https://saiyampathak.gumroad.com/l/cksbook',
    tags: ['CKS', 'Security', 'Certification'],
  },
  {
    title: 'CKA Study Guide',
    desc: 'Comprehensive study guide for the Certified Kubernetes Administrator exam with real-world scenarios.',
    authors: 'Community & Saiyam Pathak',
    url: 'https://saiyampathak.gumroad.com/l/cka',
    tags: ['CKA', 'Kubernetes', 'Certification'],
  },
  {
    title: 'Cloud Native Visuals by Kubesimplify',
    desc: 'Visual guides on various cloud native topics. Learn Kubernetes, Docker, and CNCF projects through diagrams.',
    authors: 'Kubesimplify',
    url: 'https://saiyampathak.gumroad.com/l/visualbook',
    tags: ['Visual Guide', 'Cloud Native', 'Beginners'],
  },
];

const talks = [
  // 2025
  { year: '2025', event: 'KubeCon NA', title: 'Open Source at the Edge: Hardware, Firmware, and AI Stacks', video: 'https://youtu.be/W9Uj8x_qimE', type: 'talk' },
  { year: '2025', event: 'KubeCon NA', title: 'Building Resilient Cloud Native Infrastructure', video: 'https://youtu.be/I7TuNNsJSZc', type: 'talk' },
  { year: '2025', event: 'KubeCon NA', title: 'PE Keynote: AI-Ready Platforms', type: 'keynote' },
  { year: '2025', event: 'KubeCon India', title: 'Keynote: From Outage To Observability — Kubernetes Meltdown Lessons', video: 'https://youtu.be/7JCZ688cWpY', type: 'keynote' },
  { year: '2025', event: 'KubeCon EU', title: 'A Huge Cluster or Multi-Clusters? Identifying the Bottleneck', video: 'https://www.youtube.com/watch?v=6l5zCt5QsdY', type: 'talk' },
  { year: '2025', event: 'Google Cloud Community Day Bengaluru', title: 'Keynote: AI at Scale with LLMs on Kubernetes', type: 'keynote' },
  { year: '2025', event: 'FOSDEM', title: 'Accelerating CI Pipelines: Rapid Kubernetes Testing with vCluster', type: 'talk' },
  { year: '2025', event: 'KCD Sri Lanka', title: 'Keynote: Running AI Workloads on Kubernetes', type: 'keynote' },
  { year: '2025', event: 'ContainerDays Hamburg', title: 'LLMs on Kubernetes & Kubernetes Hacks', type: 'talk' },
  { year: '2025', event: 'Rejekts NA', title: 'Beyond the Default Scheduler: GPU Multi-Tenancy', type: 'talk' },
  { year: '2025', event: 'Gitex Global Dubai', title: 'GPU Infrastructure Design Workshop', type: 'talk' },
  { year: '2025', event: 'Gitex Asia', title: 'GitOps Workshop: CI/CD with Virtual Clusters', type: 'talk' },
  { year: '2025', event: 'WasmI/O', title: 'AI Workloads with WASM & Privacy-First LLM Web Apps', type: 'talk' },
  { year: '2025', event: 'DevOps 2.0 Confex', title: 'AI Meets Kubernetes: GPU Infrastructure Design', type: 'talk' },
  // 2024
  { year: '2024', event: 'KubeCon India', title: 'Cell-Based Kubernetes — Scalable, Repeatable and Resilient', video: 'https://youtu.be/oacoUMdD4_Y', type: 'talk' },
  { year: '2024', event: 'KubeCon NA', title: 'Cloud Native Sustainability Speedrun', video: 'https://youtu.be/X-0zyyWRkiM', type: 'talk' },
  { year: '2024', event: 'KubeCon NA', title: "CNCF Environmental Sustainability TAG", video: 'https://www.youtube.com/watch?v=PfuSzPv7fSQ', type: 'talk' },
  { year: '2024', event: 'KubeCon EU', title: 'Building a Tool to Debug Minimal Container Images', video: 'https://youtu.be/H5NES1Is7rw', type: 'talk' },
  { year: '2024', event: 'KubeCon EU', title: 'Heating Pools with Cloud Power: Green Computing', video: 'https://youtu.be/LCtceKToWxU', type: 'talk' },
  { year: '2024', event: 'KCD Pune', title: 'Keynote: Generative AI on Kubernetes', type: 'keynote' },
  { year: '2024', event: 'KCD Hyderabad', title: 'Keynote: Supply Chain Security in 2024', type: 'keynote' },
  { year: '2024', event: 'ContainerDays', title: 'Building Scalable Cloud Native AI Apps with WebAssembly', type: 'talk' },
  { year: '2024', event: 'WasmCon', title: 'Exploring OpenTelemetry for Wasm', type: 'talk' },
  { year: '2024', event: 'Wasm I/O', title: 'Accelerating ML Inferencing with WebAssembly & Spin 2.0', type: 'talk' },
  { year: '2024', event: 'Civo Navigate US', title: 'Generative AI in the Kubernetes Era with Kubeflow', type: 'talk' },
  { year: '2024', event: 'SOSS Community Days', title: 'Cooking up Secure OCI Artifacts with SLSA', type: 'talk' },
  // 2023 and earlier
  { year: '2023', event: 'KubeCon NA', title: 'KubeCon North America 2023', video: 'https://youtu.be/9rycN3g-pSs', type: 'talk' },
  { year: '2023', event: 'KubeCon EU', title: 'KubeCon Europe 2023', video: 'https://youtu.be/dlgQXrDfqzs', type: 'talk' },
  { year: '2022', event: 'KubeCon EU', title: 'KubeCon Europe 2022', video: 'https://youtu.be/u7vUA61sZI4', type: 'talk' },
  { year: '2022', event: 'KubeCon EU', title: 'KubeCon Europe 2022', video: 'https://youtu.be/ItUUqejdXr0', type: 'talk' },
  { year: '2021', event: 'KubeCon EU', title: 'KubeCon Europe 2021', video: 'https://youtu.be/btGFt5-37hs', type: 'talk' },
  { year: '2020', event: 'KubeCon EU', title: 'KubeCon Europe 2020', video: 'https://youtu.be/2Eqg-oKRIR8', type: 'talk' },
];

const publications = [
  {
    outlet: 'vCluster / Loft Labs',
    url: 'https://www.vcluster.com/authors/saiyam-pathak',
    articles: [
      { title: 'The vCluster Platform UI: Managing vind Clusters Visually', url: 'https://www.vcluster.com/blog/vind-platform-ui-manage-local-kubernetes-clusters-visually' },
      { title: 'Advanced Features: Sleep/Wake, Registry Proxy, Custom Networking', url: 'https://www.vcluster.com/blog/vind-advanced-features-sleep-wake-registry-proxy-custom-networking' },
      { title: 'CI/CD with vind: The setup-vind GitHub Action', url: 'https://www.vcluster.com/blog/vind-ci-cd-setup-vind-github-action-kubernetes-testing' },
      { title: 'External Nodes: Joining a GCP Instance to Your Local vind Cluster', url: 'https://www.vcluster.com/blog/vind-external-nodes-join-gcp-instance-local-kubernetes-cluster' },
      { title: 'Multi-Node vind Clusters: Real Scheduling, Real Node Drains', url: 'https://www.vcluster.com/blog/vind-multinode-kubernetes-cluster-scheduling-node-drain' },
      { title: 'Introduction to vind: Why I Replaced KinD with vCluster in Docker', url: 'https://www.vcluster.com/blog/introduction-to-vind-why-i-replaced-kind-with-vcluster-in-docker' },
      { title: 'Demystifying Karpenter on GCP: The Complete Setup Guide', url: 'https://www.vcluster.com/blog/karpenter-gcp-setup-guide-alpha-vcluster-auto-nodes' },
      { title: 'Introducing vCluster Auto Nodes — Practical Deep Dive', url: 'https://www.vcluster.com/blog/introducing-vcluster-auto-nodes-practical-deep-dive' },
      { title: 'NVIDIAScape: How vNode Prevents Container Breakout', url: 'https://www.vcluster.com/blog/nvidiascape-container-breakout-vnode-security' },
      { title: 'Bare Metal Kubernetes with GPU: Challenges and Multi-Tenancy', url: 'https://www.vcluster.com/blog/bare-metal-kubernetes-with-gpu-challenges-and-multi-tenancy-solutions' },
      { title: 'vCluster Performance Paradox: Save Millions Without Sacrificing Speed', url: 'https://www.vcluster.com/blog/vcluster-performance-paradox-kubernetes-cost-optimization' },
      { title: 'Multi-tenancy in 2025 and Beyond', url: 'https://www.vcluster.com/blog/multi-tenancy-in-2025-and-beyond' },
      { title: 'Ephemeral PR Environments using vCluster', url: 'https://www.vcluster.com/blog/ephemeral-pr-environment-using-vcluster' },
      { title: 'Kubernetes v1.33: Key Features & Updates', url: 'https://www.vcluster.com/blog/kubernetes-v-1-33-key-features-updates-and-what-you-need-to-know' },
      { title: 'Securing Multi-Tenant Kubernetes with Falco', url: 'https://www.vcluster.com/blog/securing-vcluster-with-falco' },
      { title: 'Kubernetes HPA - Is It Good to Be Used As Is?', url: 'https://www.vcluster.com/blog/kubernetes-hpa' },
    ],
  },
  {
    outlet: 'The New Stack',
    url: 'https://thenewstack.io',
    articles: [
      { title: 'How to Overcome Memory Usage Challenges with the Time Series Index', url: 'https://thenewstack.io/how-to-overcome-memory-usage-challenges-with-the-time-series-index/' },
      { title: 'How to Use InfluxDB with Its Python Client on Kubernetes', url: 'https://thenewstack.io/how-to-use-influxdb-with-its-python-client-on-kubernetes/' },
    ],
  },
  {
    outlet: 'Civo',
    url: 'https://www.civo.com/learn',
    articles: [
      { title: 'Switching on the Cluster Insights Using Headlamp', url: 'https://www.civo.com/learn/switching-on-the-cluster-insights-using-headlamp' },
    ],
  },
  {
    outlet: 'CNCF Blog',
    articles: [
      { title: 'Cloud native ecosystem and project articles' },
    ],
  },
  {
    outlet: 'Google Cloud',
    articles: [
      { title: 'Google Cloud community articles on Kubernetes' },
    ],
  },
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
            <h1 className="text-display mb-6">Talks, Books &<br className="hidden sm:block" /> Publications</h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              {talks.length}+ conference talks at KubeCon worldwide, free e-books on Kubernetes certifications, and technical publications across the cloud native ecosystem.
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
                      style={{ background: 'rgba(5,202,255,0.1)' }}>📖</div>
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
                          style={{ background: 'rgba(5,202,255,0.1)', color: 'var(--accent)', border: '1px solid rgba(5,202,255,0.2)' }}>{t}</span>
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
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>Conference Talks & Keynotes</h2>
            <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
              {talks.length}+ talks at KubeCon, FOSDEM, ContainerDays, WasmCon, KCDs, and more.
            </p>
          </FadeIn>

          {years.map((year) => (
            <FadeIn key={year} className="mb-10 last:mb-0">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                <span className="px-3 py-1 rounded-lg text-sm font-bold gradient-bg text-gray-950">{year}</span>
                <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>
                  ({talks.filter(t => t.year === year).length} talks)
                </span>
                <span className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
              </h3>
              <div className="grid gap-2.5">
                {talks.filter(t => t.year === year).map((talk, i) => (
                  <div key={i} className="glass-card rounded-xl p-4 flex items-center gap-4 group hover:border-[rgba(5,202,255,0.2)] transition-all">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ background: talk.type === 'keynote' ? 'rgba(92,255,104,0.15)' : 'rgba(5,202,255,0.1)', color: talk.type === 'keynote' ? 'var(--accent-secondary)' : 'var(--accent)' }}>
                      {talk.type === 'keynote' ? '🎤' : '🎙'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>{talk.title}</p>
                      <p className="text-xs mt-0.5 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        {talk.event}
                        {talk.type === 'keynote' && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase" style={{ background: 'rgba(92,255,104,0.15)', color: 'var(--accent-secondary)' }}>Keynote</span>
                        )}
                      </p>
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
            <p className="text-base" style={{ color: 'var(--text-secondary)' }}>Technical articles published across industry-leading platforms.</p>
          </FadeIn>

          <div className="space-y-8">
            {publications.map((pub, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="glass-card rounded-2xl p-6 md:p-8">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{pub.outlet}</h3>
                    {pub.url && (
                      <a href={pub.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                        View all &rarr;
                      </a>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {pub.articles.map((a, j) => (
                      <div key={j}>
                        {a.url ? (
                          <a href={a.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-start gap-2 text-sm p-2 rounded-lg hover:bg-[var(--border-subtle)] transition-colors group">
                            <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                            <span className="group-hover:underline" style={{ color: 'var(--text-secondary)' }}>{a.title}</span>
                          </a>
                        ) : (
                          <div className="flex items-start gap-2 text-sm p-2">
                            <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--text-muted)' }} />
                            <span style={{ color: 'var(--text-muted)' }}>{a.title}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

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
