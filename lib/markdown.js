import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeReact from 'rehype-react';
import * as prod from 'react/jsx-runtime';

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, {
    behavior: 'append',
    properties: { className: ['heading-anchor'], ariaLabel: 'Link to this section' },
    content: { type: 'text', value: ' #' },
  })
  .use(rehypePrettyCode, {
    // Always-dark code blocks. High contrast in both light and dark site themes.
    theme: 'github-dark',
    keepBackground: false, // we set the bg in globals.css
    defaultLang: 'plaintext',
  })
  .use(rehypeReact, { Fragment: prod.Fragment, jsx: prod.jsx, jsxs: prod.jsxs });

/**
 * Convert Hashnode-specific markdown extensions into standard CommonMark
 * so the unified pipeline can parse them.
 *
 * Patterns handled:
 *   ![alt](url align="center")  →  ![alt](url)
 *   %[https://example.com]      →  [https://example.com](https://example.com)
 *   (Hashnode renders %[] as an embed card; we render as a plain link,
 *    which is the safest fallback.)
 */
function preprocessHashnodeMarkdown(md) {
  if (!md) return md;
  // Strip ` align="..."` (and similar attrs) from image markdown.
  // Pattern: ![alt](url SPACE align="X")
  let out = md.replace(
    /(!\[[^\]]*\]\()([^)\s]+)\s+align="[^"]*"\)/g,
    '$1$2)'
  );
  // Hashnode %[url] embed → standard markdown link with the URL as both text and href
  out = out.replace(/%\[([^\]]+)\]/g, '[$1]($1)');
  return out;
}

export async function renderMarkdown(source) {
  const cleaned = preprocessHashnodeMarkdown(source);
  const file = await processor.process(cleaned);
  return file.result;
}
