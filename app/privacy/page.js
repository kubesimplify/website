export const metadata = {
  title: 'Privacy Policy',
  description:
    'How Kubesimplify handles your data: cookie-less first-party analytics, double opt-in newsletter, and your rights under GDPR and the India DPDP Act.',
  alternates: { canonical: 'https://kubesimplify.com/privacy' },
};

const SECTIONS = [
  {
    h: 'The short version',
    p: [
      'We run cookie-less, anonymous analytics we host ourselves. We only email you if you double opt-in, and you can unsubscribe or erase your data with one click. We never sell or share your data. That is the whole model.',
    ],
  },
  {
    h: 'Analytics (no cookies, no personal data)',
    p: [
      'We self-host our analytics on Cloudflare (our CDN and infrastructure provider). When you view a page we record: the page path, the referring site, your country (derived from your IP at the edge, the IP itself is not stored), your device type (mobile or desktop), and how long the page was visible.',
      'Visitors are counted with an anonymous identifier that is cryptographically rotated every day and cannot be reversed into your IP or identity. There is no cookie, no fingerprinting, and no cross-site tracking, which is why you do not see a cookie banner here.',
    ],
  },
  {
    h: 'Newsletter (double opt-in)',
    p: [
      'If you enter your email, we store it with a pending status and send you one confirmation email. You are only subscribed if you click that link. This is the affirmative, verifiable consent required by the EU GDPR and India’s Digital Personal Data Protection Act, 2023.',
      'We store: your email address, when you signed up, when you confirmed, which page you signed up on, the version of the consent text you saw, and your country at confirmation. We do not store your name, IP address, or anything else.',
      'Emails are delivered through Resend (our email processor). Every email includes a one-click unsubscribe link.',
    ],
  },
  {
    h: 'Your rights (GDPR, DPDP Act, and everyone else)',
    p: [
      'Unsubscribe: one click in any email, effective immediately.',
      'Erasure: the unsubscribe page offers full deletion of your record, also one click. Nothing is retained.',
      'Access and correction: email contact@kubesimplify.com and we will show you everything we hold about you (it is at most one row) or fix it.',
      'We apply these rights to everyone, regardless of where you live.',
    ],
  },
  {
    h: 'Who processes data',
    p: [
      'Cloudflare, Inc.: hosting, CDN, and the database where analytics and subscriber records live.',
      'Resend, Inc.: email delivery for confirmation and newsletter emails.',
      'Nobody else. No advertising networks, no data brokers, no third-party analytics.',
    ],
  },
  {
    h: 'Contact',
    p: [
      'Questions or requests: contact@kubesimplify.com. This policy was last updated in July 2026; the consent version shown at signup is recorded with your subscription.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="pt-28 pb-24 px-4 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Privacy Policy</h1>
        <p className="text-sm mb-10 font-mono" style={{ color: 'var(--text-muted)' }}>
          kubesimplify.com · blog.kubesimplify.com · Last updated July 2026
        </p>
        {SECTIONS.map((s) => (
          <section key={s.h} className="mb-8">
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{s.h}</h2>
            {s.p.map((para) => (
              <p key={para.slice(0, 40)} className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                {para}
              </p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
