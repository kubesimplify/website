export const metadata = {
  title: 'Resources - Talks, Books & Publications',
  description: 'Conference talks at KubeCon, FOSDEM, ContainerDays & more. Free e-books on Kubernetes CKA, CKS, GPU platforms. Publications on vCluster, The New Stack, CNCF, and Google Cloud.',
  keywords: ['KubeCon talks', 'kubernetes e-books', 'CKA study guide', 'CKS book', 'GPU kubernetes', 'cloud native publications', 'CNCF talks'],
  alternates: { canonical: 'https://kubesimplify.com/resources' },
  openGraph: {
    title: 'Resources - Kubesimplify',
    description: 'Conference talks, free e-books, and publications by Saiyam Pathak.',
    images: [{ url: 'https://kubesimplify.com/img/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resources - Talks, Books & Publications | Kubesimplify',
    description: 'Conference talks, free e-books, and publications by Saiyam Pathak.',
    images: ['https://kubesimplify.com/img/og.png'],
  },
};

export default function ResourcesLayout({ children }) {
  return children;
}
