import Link from 'next/link';
import { GLOSSARY_SLUG, showsGlossaryLink } from '@/lib/glossary';

/**
 * One compact line above the post body for jargon-heavy posts. Deliberately not
 * a banner: it should not push the article below the fold on mobile. Plain
 * inline text rather than flex, so nothing orphans onto its own line when it
 * wraps on a narrow screen.
 */
export default function GlossaryNote({ post }) {
  if (!showsGlossaryLink(post)) return null;

  return (
    <p
      className="text-sm leading-relaxed mb-8 pl-3 border-l-2"
      style={{ borderColor: 'var(--accent)', color: 'var(--text-secondary)' }}
    >
      New to the jargon? Every term, flag, and benchmark number here is explained in plain English in the{' '}
      <Link
        href={`/blog/${GLOSSARY_SLUG}`}
        className="font-semibold hover:underline"
        style={{ color: 'var(--accent)' }}
      >
        local LLM glossary
      </Link>
      .
    </p>
  );
}
