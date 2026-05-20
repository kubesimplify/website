// Curated topic hubs. Richer than auto-generated tag pages: each has a hero,
// "Start here" pinned posts (handpicked), and the tag(s) that feed the rest.
//
// Adding a new hub: append an entry. Slug is the URL segment (/blog/hub/<slug>).
// Re-deploy and it's live.

export const HUBS = [
  {
    slug: 'kubernetes',
    name: 'Kubernetes',
    tagline: 'Deep dives on the world\'s most-deployed orchestrator.',
    description:
      'From kubelet internals to release deep-dives, scheduling, networking, and operators. Practitioner-led writing on Kubernetes from the Kubesimplify community.',
    tags: ['kubernetes', 'k8s', 'cncf'],
    startHere: [
      'kubernetes-containerd-setup',
      'kube-scheduler-deep-dive',
      'how-a-kubernetes-service-actually-works-and-all-5-types-you-need',
      'understanding-etcd-in-kubernetes-a-beginners-guide',
    ],
    icon: '☸️',
    color: '#326CE5',
  },
  {
    slug: 'docker',
    name: 'Docker & Containers',
    tagline: 'Container internals, image building, and developer workflows.',
    description:
      'Container runtimes, image building, multi-stage Dockerfiles, BuildKit, Compose, and the Docker ecosystem.',
    tags: ['docker', 'containers', 'docker-images', 'docker-desktop'],
    startHere: [
      'understanding-how-containers-work-behind-the-scenes',
      'docker-networking-demystified',
      'multi-stage-docker-build',
      'everything-you-need-to-know-about-docker-compose',
    ],
    icon: '🐳',
    color: '#2496ED',
  },
  {
    slug: 'ai-ml',
    name: 'AI & ML on Cloud Native',
    tagline: 'Running AI/ML workloads on Kubernetes and modern infrastructure.',
    description:
      'GPU scheduling, model serving, Kubeflow, LLMs on Kubernetes, NVIDIA NVCF, and the rapidly evolving AI infrastructure landscape.',
    tags: ['ai', 'machine-learning', 'kubeflow', 'gpu', 'llm', 'nvidia'],
    startHere: [
      'nvcf-is-now-open-source-inside-nvidia-s-gpu-function-platform',
      'k8sgpt-tutorial-when-kubernetes-meets-ai',
      'kubeflow-machine-learning-on-kubernetes-part-1',
      'ssh-into-your-dgx-spark-from-anywhere-in-the-world-using-tailscale',
    ],
    icon: '🤖',
    color: '#76B900',
  },
  {
    slug: 'devops',
    name: 'DevOps & Platform',
    tagline: 'CI/CD, GitOps, IaC, and the platform-engineering playbook.',
    description:
      'GitOps with Argo and Flux, Terraform, GitHub Actions, platform engineering patterns, and the build/test/deploy pipeline that ships modern apps.',
    tags: ['devops', 'gitops', 'cicd', 'terraform', 'platform-engineering'],
    startHere: [
      'gitops-demystified',
      'an-overview-of-gitops-and-argocd',
      'terraform-best-practices',
      'a-complete-walk-through-of-devops',
    ],
    icon: '🚀',
    color: '#FF6600',
  },
  {
    slug: 'security',
    name: 'Cloud Native Security',
    tagline: 'Hardening containers, Kubernetes, and the supply chain.',
    description:
      'Network policies, Falco runtime detection, Kyverno admission, SLSA supply-chain, Cilium, and the security primitives behind safe production clusters.',
    tags: ['security', 'kubernetes-security', 'falco', 'kyverno', 'supply-chain'],
    startHere: [
      'why-are-network-policies-in-kubernetes-so-hard-to-understand',
      'enhancing-runtime-security-with-falco-my-hands-on-experience',
      'supply-chain-security-using-slsa-part-1-fundamentals',
      'getting-started-with-kyverno',
    ],
    icon: '🛡️',
    color: '#DC143C',
  },
  {
    slug: 'linux',
    name: 'Linux Fundamentals',
    tagline: 'The OS underneath every container, cluster, and cloud.',
    description:
      'Shell scripting, system administration, networking, package managers, and the Linux primitives every cloud-native engineer needs.',
    tags: ['linux', 'linux-basics', 'shell', 'linux-for-beginners'],
    startHere: [
      'essential-linux-commands-for-devops',
      'what-is-shell-scripting',
      'linux-system-directories-explained',
      'networking-fundamentals-for-devops',
    ],
    icon: '🐧',
    color: '#FCC624',
  },
];

export function getHub(slug) {
  return HUBS.find((h) => h.slug === slug) || null;
}

export function getAllHubs() {
  return HUBS;
}
