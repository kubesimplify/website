import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
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
        'https://twitter.com/kubesimplify',
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
