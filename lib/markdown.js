import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeReact from 'rehype-react';
import * as prod from 'react/jsx-runtime';
import LLMBatchingAnimation from '@/components/LLMBatchingAnimation';
import LLMLifecycleAnimation from '@/components/LLMLifecycleAnimation';
import LLMRequestAnimation from '@/components/LLMRequestAnimation';
import GB10MemoryAnimation from '@/components/GB10MemoryAnimation';
import NVFP4MicroscalingAnimation from '@/components/NVFP4MicroscalingAnimation';
import Day4MemoryFitAnimation from '@/components/Day4MemoryFitAnimation';
import Day4MicroscalingAnimation from '@/components/Day4MicroscalingAnimation';
import Day5RuntimeStackAnimation from '@/components/Day5RuntimeStackAnimation';
import Day5InferenceMetricsAnimation from '@/components/Day5InferenceMetricsAnimation';
import Day5SpeculativeDecodingAnimation from '@/components/Day5SpeculativeDecodingAnimation';
import Day5EngineChoiceAnimation from '@/components/Day5EngineChoiceAnimation';

const BLOG_SHORTCODES = {
  '{{llm-request-animation}}': 'llm-request-animation',
  '{{llm-lifecycle-animation}}': 'llm-lifecycle-animation',
  '{{llm-batching-animation}}': 'llm-batching-animation',
  '{{gb10-memory-animation}}': 'gb10-memory-animation',
  '{{nvfp4-microscaling-animation}}': 'nvfp4-microscaling-animation',
  '{{day4-memory-fit-animation}}': 'day4-memory-fit-animation',
  '{{day4-microscaling-animation}}': 'day4-microscaling-animation',
  '{{day5-runtime-stack-animation}}': 'day5-runtime-stack-animation',
  '{{day5-inference-metrics-animation}}': 'day5-inference-metrics-animation',
  '{{day5-speculative-decoding-animation}}': 'day5-speculative-decoding-animation',
  '{{day5-engine-choice-animation}}': 'day5-engine-choice-animation',
};

function remarkBlogShortcodes() {
  return (tree) => {
    function walk(node, parent, index) {
      const shortcode =
        node.type === 'paragraph' &&
        node.children?.length === 1 &&
        node.children[0].type === 'text'
          ? BLOG_SHORTCODES[node.children[0].value.trim().toLowerCase()]
          : null;

      if (
        parent &&
        shortcode
      ) {
        parent.children[index] = {
          type: 'paragraph',
          data: { hName: shortcode },
          children: [],
        };
        return;
      }

      if (Array.isArray(node.children)) {
        node.children.forEach((child, childIndex) => walk(child, node, childIndex));
      }
    }

    walk(tree, null, null);
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkBlogShortcodes)
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
  .use(rehypeReact, {
    Fragment: prod.Fragment,
    jsx: prod.jsx,
    jsxs: prod.jsxs,
    components: {
      'llm-batching-animation': LLMBatchingAnimation,
      'llm-lifecycle-animation': LLMLifecycleAnimation,
      'llm-request-animation': LLMRequestAnimation,
      'gb10-memory-animation': GB10MemoryAnimation,
      'nvfp4-microscaling-animation': NVFP4MicroscalingAnimation,
      'day4-memory-fit-animation': Day4MemoryFitAnimation,
      'day4-microscaling-animation': Day4MicroscalingAnimation,
      'day5-runtime-stack-animation': Day5RuntimeStackAnimation,
      'day5-inference-metrics-animation': Day5InferenceMetricsAnimation,
      'day5-speculative-decoding-animation': Day5SpeculativeDecodingAnimation,
      'day5-engine-choice-animation': Day5EngineChoiceAnimation,
    },
  });

/**
 * Convert Hashnode-specific markdown extensions into standard CommonMark
 * so the unified pipeline can parse them.
 *
 * Patterns handled:
 *   ![alt](url align="center")  →  ![alt](url)
 *   %[https://example.com]      →  [https://example.com](https://example.com)
 *   {{llm-...-animation}}       →  interactive blog visuals
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
