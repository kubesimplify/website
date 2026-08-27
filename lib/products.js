/**
 * Products with live star counts.
 *
 * content/products.json is hand-authored; content/stars.json is regenerated
 * by scripts/fetch-stars.mjs during `prebuild`. The generated counts win when
 * present, so the site ships whatever GitHub reported at build time and falls
 * back to the committed value when the API was unreachable.
 */

import productsData from '@/content/products.json';
import starsData from '@/content/stars.json';

export const products = productsData.products.map((p) => ({
  ...p,
  stars: (p.repo && starsData[p.repo]) ?? p.stars,
}));

export default products;
