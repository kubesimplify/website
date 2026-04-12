export const metadata = {
  title: 'Watch & Learn - Cloud Native & AI Videos',
  description: 'Hands-on workshops and deep-dives on Kubernetes, AI/ML infrastructure, GitOps, NVIDIA DGX, and the entire cloud native stack. Free video content from Kubesimplify.',
  keywords: ['kubernetes workshop', 'cloud native tutorial', 'AI ML infrastructure', 'DGX Spark', 'GitOps workshop', 'CNCF tutorials', 'free kubernetes videos'],
  alternates: { canonical: 'https://kubesimplify.com/workshops' },
  openGraph: {
    title: 'Watch & Learn - Kubesimplify',
    description: 'Hands-on Cloud Native workshops and AI deep-dives. Free video content.',
    images: [{ url: 'https://kubesimplify.com/img/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch & Learn - Cloud Native & AI Videos | Kubesimplify',
    description: 'Hands-on Cloud Native workshops and AI deep-dives. Free video content.',
    images: ['https://kubesimplify.com/img/og.png'],
  },
};

export default function WorkshopsLayout({ children }) {
  return children;
}
