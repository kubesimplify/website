export const metadata = {
  title: 'About',
  description: 'Meet the team behind Kubesimplify. Founded by Saiyam Pathak (KubeCon Co-Chair, Kubestronaut) and Saloni Narang (CNCF Ambassador, Docker Captain). Simplifying Cloud Native & AI education for everyone.',
  keywords: ['kubesimplify', 'saiyam pathak', 'saloni narang', 'KubeCon co-chair', 'CNCF ambassador', 'cloud native education', 'kubernetes training'],
  alternates: { canonical: 'https://kubesimplify.com/about' },
  openGraph: {
    title: 'About Kubesimplify - AI & Cloud Native Education',
    description: 'Meet the team behind Kubesimplify. KubeCon Co-Chair, CNCF Ambassador, Docker Captain.',
    images: [{ url: 'https://kubesimplify.com/img/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Kubesimplify - AI & Cloud Native Education',
    description: 'Meet the team behind Kubesimplify. KubeCon Co-Chair, CNCF Ambassador, Docker Captain.',
    images: ['https://kubesimplify.com/img/og.png'],
  },
};

export default function AboutLayout({ children }) {
  return children;
}
