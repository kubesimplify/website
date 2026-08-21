/**
 * First-party analytics API for blog.kubesimplify.com, shared module.
 *
 * Inlined into public/_worker.js by scripts/generate-redirects.mjs
 * (Cloudflare Pages Advanced Mode, the production deployment for
 * blog.kubesimplify.com). Keep this file self-contained: no imports -
 * the generator embeds it as plain source with `export ` stripped.
 *
 * Endpoints (handleApi returns null for non-/api/ paths):
 *   POST /api/collect, beacon from AnalyticsBeacon.jsx: pageviews and
 *                       time-on-page slices. No cookies; visitors are a
 *                       daily-rotating SHA-256 of ip|ua|day (never stored raw).
 *   GET  /api/stats  , aggregates for the /analytics dashboard.
 *                       Requires `Authorization: Bearer <DASH_PASSWORD>`.
 *
 * Storage: D1 (binding DB). Schema is created lazily once per isolate.
 */

const OWN_HOSTS = new Set([
  'blog.kubesimplify.com',
  'kubesimplify.com',
  'www.kubesimplify.com',
  'localhost',
]);

const ALLOWED_ORIGINS = new Set([
  'https://blog.kubesimplify.com',
  'https://kubesimplify.com',
  'https://www.kubesimplify.com',
]);

const BOT_RE =
  /bot|crawl|spider|slurp|preview|scan|monitor|lighthouse|headless|curl|wget|python|go-http|java\/|feed|fetch|validator|archive/i;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS events (
    ts INTEGER NOT NULL,
    type TEXT NOT NULL,
    path TEXT NOT NULL,
    referrer TEXT NOT NULL DEFAULT '',
    country TEXT NOT NULL DEFAULT '',
    device TEXT NOT NULL DEFAULT '',
    visitor TEXT NOT NULL DEFAULT '',
    duration INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS idx_events_ts ON events (ts)`,
  `CREATE INDEX IF NOT EXISTS idx_events_type_ts ON events (type, ts)`,
];

let schemaReady = false;
async function ensureSchema(db) {
  if (schemaReady) return;
  await db.batch(SCHEMA.map((s) => db.prepare(s)));
  schemaReady = true;
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : 'https://blog.kubesimplify.com';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

async function visitorHash(request) {
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ua = request.headers.get('User-Agent') || '';
  const day = new Date().toISOString().slice(0, 10);
  const data = new TextEncoder().encode(ip + '|' + ua + '|' + day + '|ks-analytics');
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)]
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function cleanPath(raw) {
  if (typeof raw !== 'string' || !raw.startsWith('/')) return null;
  let path = raw.split('?')[0].split('#')[0];
  if (path.length > 1) path = path.replace(/\/+$/, '');
  if (path.length > 300 || path.includes('..')) return null;
  // Client-side navigations report the internal /blog/<slug> route; the
  // public URL is /<slug> (public/_redirects 301s the former to the latter),
  // so fold both onto the canonical path to keep per-post counts whole.
  if (path.startsWith('/blog/')) path = path.slice(5);
  return path || '/';
}

function referrerHost(raw) {
  if (typeof raw !== 'string' || !raw) return '';
  try {
    const host = new URL(raw).hostname.replace(/^www\./, '');
    return OWN_HOSTS.has(host) ? '' : host.slice(0, 100);
  } catch {
    return '';
  }
}

async function handleCollect(request, env) {
  const ua = request.headers.get('User-Agent') || '';
  const headers = corsHeaders(request);
  if (!ua || BOT_RE.test(ua)) return new Response(null, { status: 204, headers });

  let body;
  try {
    const text = await request.text();
    if (text.length > 2048) throw new Error('too large');
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400, headers });
  }

  const path = cleanPath(body.path);
  const type = body.type === 'view' || body.type === 'time' ? body.type : null;
  if (!path || !type) return new Response(null, { status: 400, headers });

  // Don't count the dashboard itself.
  if (path === '/analytics' || path.startsWith('/api/')) {
    return new Response(null, { status: 204, headers });
  }

  const duration =
    type === 'time' ? Math.min(Math.max(Math.round(Number(body.duration) || 0), 0), 1800) : 0;
  if (type === 'time' && duration < 1) return new Response(null, { status: 204, headers });

  const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop';
  const country = (request.cf && request.cf.country) || '';
  const visitor = await visitorHash(request);
  const referrer = type === 'view' ? referrerHost(body.referrer) : '';

  await ensureSchema(env.DB);
  await env.DB.prepare(
    `INSERT INTO events (ts, type, path, referrer, country, device, visitor, duration)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(Math.floor(Date.now() / 1000), type, path, referrer, country, device, visitor, duration)
    .run();

  return new Response(null, { status: 204, headers });
}

async function handleStats(request, env) {
  const headers = {
    ...corsHeaders(request),
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  if (!env.DASH_PASSWORD) {
    return new Response(JSON.stringify({ error: 'DASH_PASSWORD secret not configured' }), {
      status: 503,
      headers,
    });
  }
  const auth = request.headers.get('Authorization') || '';
  if (auth !== 'Bearer ' + env.DASH_PASSWORD) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers });
  }

  const url = new URL(request.url);
  const days = Math.min(Math.max(parseInt(url.searchParams.get('days'), 10) || 30, 1), 365);
  const since = Math.floor(Date.now() / 1000) - days * 86400;

  await ensureSchema(env.DB);
  const db = env.DB;
  const [summary, timeAgg, byDay, posts, timeByPath, referrers, countries, devices] =
    await db.batch([
      db.prepare(`SELECT COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors
                  FROM events WHERE type='view' AND ts>=?`).bind(since),
      db.prepare(`SELECT SUM(duration) AS total_time FROM events WHERE type='time' AND ts>=?`).bind(since),
      db.prepare(`SELECT date(ts,'unixepoch') AS day, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors
                  FROM events WHERE type='view' AND ts>=? GROUP BY day ORDER BY day`).bind(since),
      db.prepare(`SELECT path, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors
                  FROM events WHERE type='view' AND ts>=? GROUP BY path ORDER BY views DESC LIMIT 30`).bind(since),
      db.prepare(`SELECT path, SUM(duration) AS total_time
                  FROM events WHERE type='time' AND ts>=? GROUP BY path`).bind(since),
      db.prepare(`SELECT referrer, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors
                  FROM events WHERE type='view' AND ts>=? AND referrer!=''
                  GROUP BY referrer ORDER BY views DESC LIMIT 20`).bind(since),
      db.prepare(`SELECT country, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors
                  FROM events WHERE type='view' AND ts>=? AND country!=''
                  GROUP BY country ORDER BY views DESC LIMIT 20`).bind(since),
      db.prepare(`SELECT device, COUNT(*) AS views FROM events
                  WHERE type='view' AND ts>=? AND device!='' GROUP BY device`).bind(since),
    ]);

  const timeMap = Object.fromEntries(
    (timeByPath.results || []).map((r) => [r.path, r.total_time || 0])
  );
  const postRows = (posts.results || []).map((p) => ({
    ...p,
    avg_time: p.views ? Math.round((timeMap[p.path] || 0) / p.views) : 0,
  }));

  const totals = (summary.results && summary.results[0]) || { views: 0, visitors: 0 };
  const totalTime = (timeAgg.results && timeAgg.results[0] && timeAgg.results[0].total_time) || 0;

  return new Response(
    JSON.stringify({
      days,
      totals: {
        views: totals.views || 0,
        visitors: totals.visitors || 0,
        avg_time: totals.views ? Math.round(totalTime / totals.views) : 0,
      },
      by_day: byDay.results || [],
      posts: postRows,
      referrers: referrers.results || [],
      countries: countries.results || [],
      devices: devices.results || [],
    }),
    { status: 200, headers }
  );
}

/**
 * Handle the analytics /api/ endpoints. Returns null for any other path so
 * the caller can try other API modules (newsletter) or its own routing.
 */
export async function handleApi(request, env) {
  const { pathname } = new URL(request.url);
  if (pathname !== '/api/collect' && pathname !== '/api/stats') return null;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }
  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'D1 binding DB not configured' }), {
      status: 503,
      headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
    });
  }
  try {
    if (pathname === '/api/collect' && request.method === 'POST') return await handleCollect(request, env);
    if (pathname === '/api/stats' && request.method === 'GET') return await handleStats(request, env);
    return new Response('method not allowed', { status: 405, headers: corsHeaders(request) });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
    });
  }
}
