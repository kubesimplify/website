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

export async function renderMarkdown(source) {
  const file = await processor.process(source);
  return file.result;
}
