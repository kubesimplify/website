/**
 * Serialize an object for embedding inside <script type="application/ld+json">.
 *
 * JSON.stringify does not escape '<', so a string value containing
 * "</script><script>..." would terminate the inline script tag and execute
 * as markup (XSS via frontmatter, which community PRs can author). Escaping
 * '<' as < is valid JSON and neutralizes it.
 */
export function safeJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}
