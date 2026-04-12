export const metadata = {
  title: 'Partnerships - Content & DevRel Services',
  description: 'Partner with Kubesimplify to reach 100K+ cloud native and AI engineers. YouTube deep-dives, webinars, blog posts, ad segments, and custom content packages.',
  keywords: ['developer relations', 'DevRel services', 'cloud native marketing', 'kubernetes content', 'technical YouTube sponsorship', 'developer advocacy'],
  alternates: { canonical: 'https://kubesimplify.com/partnerships' },
  openGraph: {
    title: 'Partner with Kubesimplify',
    description: 'Reach 100K+ cloud native engineers through technical content & DevRel services.',
    images: [{ url: 'https://kubesimplify.com/img/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Partnerships - Content & DevRel Services | Kubesimplify',
    description: 'Reach 100K+ cloud native engineers through technical content & DevRel services.',
    images: ['https://kubesimplify.com/img/og.png'],
  },
};

export default function PartnershipsLayout({ children }) {
  return children;
}
