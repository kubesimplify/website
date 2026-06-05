// Curated post series. Each entry lists existing post slugs in reading order.
// Adding to a series does NOT change any post's URL or content — it's a
// rendering-only enrichment (banner on each post + a landing page at
// /blog/series/<slug>).
//
// To start a new series:
//   1. Append an entry below
//   2. Drop slugs into `posts` in the order you want them read
//   3. (Optional) add a cover image to public/img/series/<slug>/cover.png

export const SERIES = [
  {
    slug: '7-days-of-docker',
    name: '7 Days of Docker',
    tagline: 'A week-long journey from your first docker run to production-ready containers.',
    description:
      "Saloni Narang's seven-day deep dive through Docker, taking you from \"what actually happens when you type docker run\" all the way to shipping hardened containers with policy guardrails. Each day stands alone, but read together they're the practical Docker reference every cloud-native engineer wishes existed.",
    author: 'saloni-narang',
    color: '#2496ED',
    cover: null,
    posts: [
      'day-1-what-actually-happens-when-you-type-docker-run',
      'day-2-your-images-are-a-supply-chain-and-it-s-probably-broken',
      'day-3-stop-writing-dockerfiles-from-scratch',
      'day-4-breaking-isolation-on-purpose-volumes-networks-and-the-real-world',
      'day-5-docker-compose-how-docker-actually-gets-used',
      'day-6-run-an-llm-on-your-laptop-with-docker',
      'day-7-ship-it-and-what-comes-next',
    ],
  },
  {
    slug: '7-days-of-dgx-spark',
    name: '7 Days of DGX Spark',
    plannedTotal: 7,
    tagline: 'Hands-on with NVIDIA DGX Spark, from unboxing to running 120B-parameter models.',
    description:
      'A seven-day series taking the NVIDIA DGX Spark from unboxing to production AI workloads. SSH, networking, model serving, fine-tuning, and the practical infrastructure decisions you face when you actually own one of these.',
    author: 'saiyam-pathak',
    color: '#76B900',
    cover: null,
    posts: [
      'day-1-the-local-llm-revolution-why-your-desk-just-became-the-new-datacenter',
      'day-2-anatomy-of-an-llm-inference-request-from-prompt-to-answer-step-by-step',
      'day-3-the-dgx-spark-unpacked-gb10-unified-memory-sm-121-and-the-one-reason-this-hardware-exists',
    ],
  },
];

export function getAllSeries() {
  return SERIES;
}

export function getSeries(slug) {
  return SERIES.find((s) => s.slug === slug) || null;
}

// Returns { series, position, total, prev, next } if the slug is part of a series,
// or null. Position is 1-indexed.
export function getSeriesForPost(slug) {
  for (const series of SERIES) {
    const i = series.posts.indexOf(slug);
    if (i === -1) continue;
    const total = series.plannedTotal || series.posts.length;
    return {
      series,
      position: i + 1,
      total,
      prev: i > 0 ? series.posts[i - 1] : null,
      next: i < series.posts.length - 1 ? series.posts[i + 1] : null,
    };
  }
  return null;
}
