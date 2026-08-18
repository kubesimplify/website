// The glossary line that appears at the top of jargon-heavy posts.
//
// A post shows it when its tags overlap GLOSSARY_TAGS, unless frontmatter says
// otherwise: `glossary: false` suppresses it (the glossary post itself does
// this), `glossary: true` forces it on for a post whose tags do not match.
//
// Adding a second glossary later: make this a list and match per topic.

export const GLOSSARY_SLUG = 'local-llm-glossary';

const GLOSSARY_TAGS = new Set([
  'llm',
  'local-ai',
  'inference',
  'dgxspark',
  'ollama',
  'vllm',
  'quantization',
]);

export function showsGlossaryLink(post) {
  if (!post || post.slug === GLOSSARY_SLUG) return false;
  if (post.glossary === false) return false;
  if (post.glossary === true) return true;
  return post.tags.some((t) => GLOSSARY_TAGS.has(t));
}
