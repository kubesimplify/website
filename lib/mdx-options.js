import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

export const mdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: 'append',
        properties: { className: ['heading-anchor'], ariaLabel: 'Link to this section' },
        content: { type: 'text', value: ' #' },
      },
    ],
    [
      rehypePrettyCode,
      {
        theme: { dark: 'github-dark', light: 'github-light' },
        keepBackground: true,
        defaultLang: 'plaintext',
      },
    ],
  ],
};

export function extractToc(markdown) {
  const lines = markdown.split('\n');
  const toc = [];
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = line.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (!m) continue;
    const depth = m[1].length;
    const text = m[2].replace(/[*_`]/g, '').trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    toc.push({ depth, text, id });
  }
  return toc;
}
