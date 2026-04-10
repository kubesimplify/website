import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://kubesimplify.com'),
  title: {
    default: 'Kubesimplify - AI & Cloud Native Education',
    template: '%s | Kubesimplify',
  },
  description:
    'Expert-led workshops, deep-dive technical content, and open source tools for Kubernetes, AI/ML infrastructure, and cloud native engineering teams. Trusted by Cisco, Sysdig, Chainguard & more.',
  keywords: [
    'kubernetes', 'cloud native', 'AI', 'machine learning', 'workshops',
    'devops', 'CNCF', 'docker', 'gitops', 'kubecon', 'developer education',
    'technical content', 'open source', 'platform engineering',
  ],
  authors: [{ name: 'Saiyam Pathak', url: 'https://twitter.com/saiyampathak' }],
  creator: 'Kubesimplify',
  publisher: 'Kubesimplify',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://kubesimplify.com',
    siteName: 'Kubesimplify',
    title: 'Kubesimplify - AI & Cloud Native Education',
    description:
      'Expert-led workshops, deep-dive content, and open source tools for Kubernetes, AI/ML, and the cloud native stack.',
    images: [
      {
        url: 'https://kubesimplify.com/img/og.png',
        width: 1200,
        height: 630,
        alt: 'Kubesimplify - AI & Cloud Native Education',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kubesimplify',
    creator: '@saiyampathak',
    title: 'Kubesimplify - AI & Cloud Native Education',
    description:
      'Expert-led Kubernetes & AI workshops, technical content, and open source tools. 100K+ community.',
    images: ['https://kubesimplify.com/img/og.png'],
  },
  alternates: {
    canonical: 'https://kubesimplify.com',
  },
  other: {
    'theme-color': '#05CAFF',
  },
};

// JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Kubesimplify',
      url: 'https://kubesimplify.com',
      logo: 'https://kubesimplify.com/img/color.svg',
      description:
        'Kubesimplify simplifies Cloud Native and AI education through expert-led workshops, deep-dive content, and open source tools.',
      founder: {
        '@type': 'Person',
        name: 'Saiyam Pathak',
        jobTitle: 'KubeCon Co-Chair, CNCF TAG Operational Resilience Chair',
      },
      sameAs: [
        'https://www.youtube.com/@kubesimplify',
        'https://x.com/kubesimplify',
        'https://www.linkedin.com/company/kubesimplify/',
        'https://github.com/kubesimplify',
        'https://blog.kubesimplify.com',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'contact@kubesimplify.com',
        contactType: 'business',
      },
    },
    {
      '@type': 'WebSite',
      name: 'Kubesimplify',
      url: 'https://kubesimplify.com',
    },
    {
      '@type': 'EducationalOrganization',
      name: 'Kubesimplify',
      url: 'https://kubesimplify.com',
      areaServed: 'Global',
    },
    {
      '@type': 'VideoObject',
      name: 'The Kubernetes Course 2025',
      description: 'Complete Kubernetes course covering everything from basics to advanced concepts for 2025.',
      thumbnailUrl: 'https://i.ytimg.com/vi/7XDeI5fyj3w/hqdefault.jpg',
      uploadDate: '2025-01-01',
      contentUrl: 'https://www.youtube.com/watch?v=7XDeI5fyj3w',
      embedUrl: 'https://www.youtube.com/embed/7XDeI5fyj3w',
      publisher: {
        '@type': 'Organization',
        name: 'Kubesimplify',
        logo: { '@type': 'ImageObject', url: 'https://kubesimplify.com/img/color.svg' },
      },
    },
    {
      '@type': 'VideoObject',
      name: 'Master Kubernetes Operators with Kubebuilder',
      description: 'Learn how to build Kubernetes operators using Kubebuilder framework with hands-on examples.',
      thumbnailUrl: 'https://i.ytimg.com/vi/X5kkrIPr5Hk/hqdefault.jpg',
      uploadDate: '2025-01-01',
      contentUrl: 'https://www.youtube.com/watch?v=X5kkrIPr5Hk',
      embedUrl: 'https://www.youtube.com/embed/X5kkrIPr5Hk',
      publisher: {
        '@type': 'Organization',
        name: 'Kubesimplify',
        logo: { '@type': 'ImageObject', url: 'https://kubesimplify.com/img/color.svg' },
      },
    },
    {
      '@type': 'VideoObject',
      name: 'DevOps Roadmap 2025: Step-by-Step Guide',
      description: 'Your complete step-by-step guide to mastering DevOps in 2025 covering tools, practices, and career paths.',
      thumbnailUrl: 'https://i.ytimg.com/vi/Tvx5LB3jOYQ/hqdefault.jpg',
      uploadDate: '2025-01-01',
      contentUrl: 'https://www.youtube.com/watch?v=Tvx5LB3jOYQ',
      embedUrl: 'https://www.youtube.com/embed/Tvx5LB3jOYQ',
      publisher: {
        '@type': 'Organization',
        name: 'Kubesimplify',
        logo: { '@type': 'ImageObject', url: 'https://kubesimplify.com/img/color.svg' },
      },
    },
    {
      '@type': 'Course',
      name: 'Kubernetes, Cloud Native & AI Education',
      description: 'Free hands-on workshops and tutorials on Kubernetes, AI/ML infrastructure, Docker, GitOps, and cloud native technologies.',
      provider: {
        '@type': 'Organization',
        name: 'Kubesimplify',
        url: 'https://kubesimplify.com',
      },
      isAccessibleForFree: true,
      educationalLevel: 'Beginner to Advanced',
      teaches: [
        'Kubernetes', 'Docker', 'GitOps', 'AI/ML on Kubernetes',
        'Platform Engineering', 'CNCF Projects', 'DevOps',
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans noise-overlay">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
