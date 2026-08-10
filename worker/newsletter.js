/**
 * Newsletter API, double opt-in subscriptions backed by D1 + Resend.
 *
 * Inlined into public/_worker.js by scripts/generate-redirects.mjs (same
 * mechanism as worker/analytics.js). Keep self-contained: no imports.
 *
 * Compliance by design (GDPR / India DPDP Act 2023):
 *   - Double opt-in: nobody is subscribed until they click the link we email
 *     them (consent must be affirmative and verifiable).
 *   - We record when consent was given, the consent-text version, and the
 *     signup source, the proof both laws require.
 *   - Data minimization: email + consent record only. No names, no raw IPs
 *     (only a country code at confirm time).
 *   - Every email carries a one-click unsubscribe link.
 *   - Right to erasure: /api/erase deletes the row entirely, on demand.
 *
 * Endpoints (handleNewsletterApi returns null for other paths):
 *   POST /api/subscribe   {email, source?}  → creates pending row, sends
 *                         confirmation email. Always replies 200 with the
 *                         same body (no account enumeration).
 *   GET  /api/confirm?token=      → status=confirmed, redirect /subscribed
 *   GET  /api/unsubscribe?token=  → status=unsubscribed, redirect /unsubscribed
 *   GET  /api/erase?token=        → row deleted, redirect /unsubscribed?erased=1
 *
 * Secrets: RESEND_API_KEY (Pages secret). Optional var MAIL_FROM, defaults
 * to Resend's onboarding sender until the kubesimplify.com domain is
 * verified in Resend.
 */

const CONSENT_VERSION = 'v1-2026-07';
const NL_ALLOWED_ORIGINS = new Set([
  'https://blog.kubesimplify.com',
  'https://kubesimplify.com',
  'https://www.kubesimplify.com',
]);

const NL_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS subscribers (
    email TEXT PRIMARY KEY,
    token TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_ts INTEGER NOT NULL,
    confirmed_ts INTEGER,
    consent TEXT NOT NULL DEFAULT '',
    country TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE INDEX IF NOT EXISTS idx_subscribers_token ON subscribers (token)`,
  `CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT NOT NULL,
    ts INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_rate_limits_key_ts ON rate_limits (key, ts)`,
  `CREATE TABLE IF NOT EXISTS partner_inquiries (
    ts INTEGER NOT NULL,
    name TEXT NOT NULL,
    company TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL,
    goal TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT ''
  )`,
];

let nlSchemaReady = false;
async function nlEnsureSchema(db) {
  if (nlSchemaReady) return;
  await db.batch(NL_SCHEMA.map((s) => db.prepare(s)));
  nlSchemaReady = true;
}

function nlCors(request) {
  const origin = request.headers.get('Origin') || '';
  const allow = NL_ALLOWED_ORIGINS.has(origin) ? origin : 'https://blog.kubesimplify.com';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
  };
}

function nlJson(request, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...nlCors(request), 'Content-Type': 'application/json' },
  });
}

async function nlIpKey(request, bucket) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const data = new TextEncoder().encode(ip + '|' + bucket + '|ks-rl');
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Sliding-window rate limit: allow `max` hits per `windowSecs` per key. */
async function nlRateLimited(db, key, max, windowSecs) {
  const now = Math.floor(Date.now() / 1000);
  const since = now - windowSecs;
  const row = await db
    .prepare(`SELECT COUNT(*) AS n FROM rate_limits WHERE key=? AND ts>=?`)
    .bind(key, since)
    .first();
  if ((row?.n || 0) >= max) return true;
  await db.batch([
    db.prepare(`INSERT INTO rate_limits (key, ts) VALUES (?, ?)`).bind(key, now),
    // opportunistic cleanup of old entries
    db.prepare(`DELETE FROM rate_limits WHERE ts < ?`).bind(now - 86400),
  ]);
  return false;
}

function nlValidEmail(email) {
  return (
    typeof email === 'string' &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  );
}

function nlEscHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Read the token from a GET query string or a POSTed form body. */
async function nlTokenFrom(request) {
  if (request.method === 'POST') {
    const text = await request.text();
    return new URLSearchParams(text).get('token') || '';
  }
  return new URL(request.url).searchParams.get('token') || '';
}

/**
 * Interstitial page for state-changing email links. Mail scanners prefetch
 * every GET link in an email (Outlook SafeLinks, Mimecast, Gmail), which
 * would silently confirm, unsubscribe, or even erase subscribers. So GET
 * renders this page and only an explicit button press (POST) mutates.
 * The token is hex-validated by the caller before being embedded.
 */
function nlActionPage(action, token, heading, blurb, button) {
  const html = `<!doctype html><html><head><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${heading} · Kubesimplify</title></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f6f8fa;margin:0;padding:48px 16px;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;text-align:center;">
    <h1 style="font-size:22px;margin:0 0 10px;color:#0f172a;">${heading}</h1>
    <p style="color:#475569;font-size:15px;line-height:1.6;">${blurb}</p>
    <form method="POST" action="/api/${action}" style="margin:24px 0 0;">
      <input type="hidden" name="token" value="${token}">
      <button type="submit" style="background:#0098cc;color:#ffffff;border:0;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;cursor:pointer;">${button}</button>
    </form>
  </div>
</body></html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

function confirmEmailHtml(confirmUrl, unsubUrl) {
  return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f6f8fa;margin:0;padding:32px 16px;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
    <h1 style="font-size:22px;margin:0 0 8px;color:#0f172a;">Confirm your subscription</h1>
    <p style="color:#475569;font-size:15px;line-height:1.6;">
      You (or someone using this address) asked to receive Kubesimplify updates:
      new articles, videos, workshops, and hands-on labs. Click below to confirm.
      If this wasn't you, just ignore this email and nothing will happen.
    </p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${confirmUrl}" style="background:#0098cc;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;display:inline-block;">
        Confirm subscription
      </a>
    </p>
    <p style="color:#94a3b8;font-size:12px;line-height:1.6;border-top:1px solid #e5e7eb;padding-top:16px;">
      Kubesimplify · kubesimplify.com · You're seeing this because of a signup at kubesimplify.com.
      No confirmation, no emails, ever. Already confirmed and changed your mind?
      <a href="${unsubUrl}" style="color:#64748b;">Unsubscribe</a>.
    </p>
  </div>
</body></html>`;
}

async function nlSendConfirmEmail(env, email, token, origin) {
  const confirmUrl = `${origin}/api/confirm?token=${token}`;
  const unsubUrl = `${origin}/api/unsubscribe?token=${token}`;
  const from = env.MAIL_FROM || 'Kubesimplify <onboarding@resend.dev>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      reply_to: 'contact@kubesimplify.com',
      subject: 'Confirm your Kubesimplify subscription',
      html: confirmEmailHtml(confirmUrl, unsubUrl),
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`resend ${res.status}: ${detail.slice(0, 200)}`);
  }
}

async function nlHandleSubscribe(request, env) {
  if (!env.RESEND_API_KEY) {
    return nlJson(request, 503, { error: 'newsletter not configured' });
  }

  let body;
  try {
    const text = await request.text();
    if (text.length > 1024) throw new Error('too large');
    body = JSON.parse(text);
  } catch {
    return nlJson(request, 400, { error: 'bad request' });
  }

  const email = String(body.email || '').trim().toLowerCase();
  if (!nlValidEmail(email)) return nlJson(request, 400, { error: 'invalid email' });

  await nlEnsureSchema(env.DB);

  // Rate limits: 5 signups/hour per IP, and at most 2 confirm emails per
  // address per day (protects the 100/day Resend budget from abuse).
  const ipKey = await nlIpKey(request, 'subscribe');
  if (await nlRateLimited(env.DB, ipKey, 5, 3600)) {
    return nlJson(request, 429, { error: 'too many requests, try later' });
  }
  if (await nlRateLimited(env.DB, 'email:' + email, 2, 86400)) {
    return nlJson(request, 200, { ok: true, message: 'check your inbox' });
  }

  const existing = await env.DB.prepare(`SELECT status, token FROM subscribers WHERE email=?`)
    .bind(email)
    .first();

  // Already confirmed → do nothing, reply identically (no enumeration).
  if (existing && existing.status === 'confirmed') {
    return nlJson(request, 200, { ok: true, message: 'check your inbox' });
  }

  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  const consent = JSON.stringify({
    version: CONSENT_VERSION,
    source: String(body.source || 'website').slice(0, 100),
    method: 'double-opt-in',
  });

  // On re-subscribe, keep the existing token: rotating it would silently
  // invalidate the confirmation link in the earlier email while the
  // /subscribed page tells the user they are in.
  await env.DB.prepare(
    `INSERT INTO subscribers (email, token, status, created_ts, consent)
     VALUES (?, ?, 'pending', ?, ?)
     ON CONFLICT(email) DO UPDATE SET created_ts=excluded.created_ts, consent=excluded.consent, status='pending'`
  )
    .bind(email, token, Math.floor(Date.now() / 1000), consent)
    .run();
  const stored = await env.DB.prepare(`SELECT token FROM subscribers WHERE email=?`).bind(email).first();

  const origin = new URL(request.url).origin;
  await nlSendConfirmEmail(env, email, stored.token, origin);

  return nlJson(request, 200, { ok: true, message: 'check your inbox' });
}

async function nlRowByToken(env, token) {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  await nlEnsureSchema(env.DB);
  return env.DB.prepare(`SELECT email, status FROM subscribers WHERE token=?`).bind(token).first();
}

async function nlHandleConfirm(request, env) {
  const token = await nlTokenFrom(request);
  const origin = new URL(request.url).origin;
  const row = await nlRowByToken(env, token);
  // An unsubscribed user must not be re-confirmable from an old email link:
  // that would restore a subscription without fresh consent.
  if (!row || row.status === 'unsubscribed') {
    return Response.redirect(`${origin}/subscribed?status=invalid`, 303);
  }
  if (request.method === 'GET') {
    return nlActionPage(
      'confirm', token,
      'Confirm your subscription',
      'One click and you are in: new articles, videos, workshops, and labs from Kubesimplify.',
      'Confirm subscription'
    );
  }
  if (row.status === 'pending') {
    await env.DB.prepare(
      `UPDATE subscribers SET status='confirmed', confirmed_ts=?, country=? WHERE email=? AND status='pending'`
    )
      .bind(Math.floor(Date.now() / 1000), (request.cf && request.cf.country) || '', row.email)
      .run();
  }
  return Response.redirect(`${origin}/subscribed`, 303);
}

async function nlHandleUnsubscribe(request, env) {
  const token = await nlTokenFrom(request);
  const origin = new URL(request.url).origin;
  const row = await nlRowByToken(env, token);
  if (!row) return Response.redirect(`${origin}/unsubscribed?status=invalid`, 303);
  if (request.method === 'GET') {
    return nlActionPage(
      'unsubscribe', token,
      'Unsubscribe',
      'You will stop receiving Kubesimplify emails immediately.',
      'Unsubscribe me'
    );
  }
  await env.DB.prepare(`UPDATE subscribers SET status='unsubscribed' WHERE email=?`)
    .bind(row.email)
    .run();
  return Response.redirect(`${origin}/unsubscribed`, 303);
}

async function nlHandleErase(request, env) {
  const token = await nlTokenFrom(request);
  const origin = new URL(request.url).origin;
  const row = await nlRowByToken(env, token);
  if (!row) return Response.redirect(`${origin}/unsubscribed?status=invalid`, 303);
  if (request.method === 'GET') {
    return nlActionPage(
      'erase', token,
      'Erase my data',
      'This unsubscribes you and permanently deletes everything we store about you. It cannot be undone.',
      'Delete everything'
    );
  }
  await env.DB.prepare(`DELETE FROM subscribers WHERE email=?`).bind(row.email).run();
  return Response.redirect(`${origin}/unsubscribed?erased=1`, 303);
}

function broadcastEmailHtml({ title, description, url }, unsubUrl, eraseUrl) {
  return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f6f8fa;margin:0;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
    <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0098cc;margin:0 0 10px;">New from Kubesimplify</p>
    <h1 style="font-size:22px;margin:0 0 10px;color:#0f172a;">${title}</h1>
    <p style="color:#475569;font-size:15px;line-height:1.6;">${description || ''}</p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${url}" style="background:#0098cc;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;display:inline-block;">
        Read it now
      </a>
    </p>
    <p style="color:#94a3b8;font-size:12px;line-height:1.6;border-top:1px solid #e5e7eb;padding-top:16px;">
      Kubesimplify · kubesimplify.com · You get these because you double-opted-in.
      <a href="${unsubUrl}" style="color:#64748b;">Unsubscribe</a> ·
      <a href="${eraseUrl}" style="color:#64748b;">Erase my data</a>
    </p>
  </div>
</body></html>`;
}

/**
 * POST /api/broadcast: announce new content to all confirmed subscribers.
 * Called by the GitHub Action on new posts, or manually for videos and
 * workshops. Auth: Bearer BROADCAST_SECRET. Body: {url, title, description?,
 * subject?, force?}. Deduplicates by url via the announcements table, sends
 * one personalized email per subscriber (each carries their own
 * unsubscribe/erase token), and records the outcome.
 */
async function nlHandleBroadcast(request, env) {
  if (!env.BROADCAST_SECRET || !env.RESEND_API_KEY) {
    return nlJson(request, 503, { error: 'broadcast not configured' });
  }
  const auth = request.headers.get('Authorization') || '';
  if (auth !== 'Bearer ' + env.BROADCAST_SECRET) {
    return nlJson(request, 401, { error: 'unauthorized' });
  }

  let body;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return nlJson(request, 400, { error: 'bad request' });
  }
  const url = String(body.url || '').trim();
  const title = String(body.title || '').trim().slice(0, 200);
  const description = String(body.description || '').trim().slice(0, 500);
  const subject = String(body.subject || title).trim().slice(0, 150);
  if (!/^https:\/\/(blog\.)?kubesimplify\.com\//.test(url) || !title) {
    return nlJson(request, 400, { error: 'url (kubesimplify.com) and title are required' });
  }

  await nlEnsureSchema(env.DB);
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS announcements (
      url TEXT PRIMARY KEY, ts INTEGER NOT NULL, sent INTEGER NOT NULL DEFAULT 0, failed INTEGER NOT NULL DEFAULT 0
    )`
  ).run();

  // Skip only when the previous announcement fully succeeded; a partial
  // failure stays retryable without blasting duplicates via force.
  const already = await env.DB.prepare(`SELECT sent, failed FROM announcements WHERE url=?`).bind(url).first();
  if (already && already.failed === 0 && !body.force) {
    return nlJson(request, 200, { ok: true, skipped: 'already announced', sent: already.sent });
  }

  const subs = (
    await env.DB.prepare(`SELECT email, token FROM subscribers WHERE status='confirmed'`).all()
  ).results || [];

  const origin = new URL(request.url).origin;
  const from = env.MAIL_FROM || 'Kubesimplify <onboarding@resend.dev>';
  let sent = 0;
  let failed = 0;
  // Resend's batch endpoint takes up to 100 personalized emails per call:
  // one subrequest per 100 subscribers instead of one each, which respects
  // both Resend's rate limit and the Workers subrequest cap.
  const chunks = [];
  for (let i = 0; i < subs.length; i += 100) chunks.push(subs.slice(i, i + 100));
  for (let ci = 0; ci < chunks.length; ci++) {
    if (ci > 0) await new Promise((r) => setTimeout(r, 700));
    const payload = chunks[ci].map((sub) => ({
      from,
      to: [sub.email],
      reply_to: 'contact@kubesimplify.com',
      subject,
      html: broadcastEmailHtml(
        { title, description, url },
        `${origin}/api/unsubscribe?token=${sub.token}`,
        `${origin}/api/erase?token=${sub.token}`
      ),
    }));
    try {
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) sent += chunks[ci].length;
      else failed += chunks[ci].length;
    } catch {
      failed += chunks[ci].length;
    }
  }

  await env.DB.prepare(
    `INSERT INTO announcements (url, ts, sent, failed) VALUES (?, ?, ?, ?)
     ON CONFLICT(url) DO UPDATE SET ts=excluded.ts, sent=excluded.sent, failed=excluded.failed`
  )
    .bind(url, Math.floor(Date.now() / 1000), sent, failed)
    .run();

  return nlJson(request, 200, { ok: true, subscribers: subs.length, sent, failed });
}

async function nlHandlePartner(request, env) {
  let body;
  try {
    const text = await request.text();
    if (text.length > 8192) throw new Error('too large');
    body = JSON.parse(text);
  } catch {
    return nlJson(request, 400, { error: 'bad request' });
  }

  const name = String(body.name || '').trim().slice(0, 100);
  const company = String(body.company || '').trim().slice(0, 100);
  const email = String(body.email || '').trim().toLowerCase();
  const goal = String(body.goal || '').trim().slice(0, 200);
  const message = String(body.message || '').trim().slice(0, 4000);
  if (!name || !nlValidEmail(email)) {
    return nlJson(request, 400, { error: 'name and a valid email are required' });
  }

  await nlEnsureSchema(env.DB);
  const ipKey = await nlIpKey(request, 'partner');
  if (await nlRateLimited(env.DB, ipKey, 3, 3600)) {
    return nlJson(request, 429, { error: 'too many requests, try later' });
  }

  await env.DB.prepare(
    `INSERT INTO partner_inquiries (ts, name, company, email, goal, message) VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(Math.floor(Date.now() / 1000), name, company, email, goal, message)
    .run();

  // Best-effort notification; the inquiry is already stored in D1 either way.
  if (env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.MAIL_FROM || 'Kubesimplify <onboarding@resend.dev>',
          to: ['contact@kubesimplify.com'],
          reply_to: email,
          subject: `Partnership inquiry: ${(company || name).replace(/[\r\n]+/g, ' ')}`,
          html: `<p><strong>${nlEscHtml(name)}</strong>${company ? ' (' + nlEscHtml(company) + ')' : ''} · ${nlEscHtml(email)}</p>
<p><strong>Goal:</strong> ${nlEscHtml(goal || 'not specified')}</p>
<p>${nlEscHtml(message || '(no message)').replace(/\n/g, '<br>')}</p>`,
        }),
      });
    } catch {
      // stored in D1; notification failure is not the requester's problem
    }
  }

  return nlJson(request, 200, { ok: true });
}

/**
 * Handle newsletter /api/* requests. Returns null for any other path.
 */
export async function handleNewsletterApi(request, env) {
  const { pathname } = new URL(request.url);
  const routes = {
    '/api/subscribe': { methods: ['POST'], fn: nlHandleSubscribe },
    // GET shows an interstitial page; only the button's POST mutates.
    '/api/confirm': { methods: ['GET', 'POST'], fn: nlHandleConfirm },
    '/api/unsubscribe': { methods: ['GET', 'POST'], fn: nlHandleUnsubscribe },
    '/api/erase': { methods: ['GET', 'POST'], fn: nlHandleErase },
    '/api/broadcast': { methods: ['POST'], fn: nlHandleBroadcast },
    '/api/partner': { methods: ['POST'], fn: nlHandlePartner },
  };
  const route = routes[pathname];
  if (!route) return null;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: nlCors(request) });
  }
  if (!route.methods.includes(request.method)) {
    return nlJson(request, 405, { error: 'method not allowed' });
  }
  if (!env.DB) {
    return nlJson(request, 503, { error: 'database not configured' });
  }
  try {
    return await route.fn(request, env);
  } catch (err) {
    return nlJson(request, 500, { error: String(err).slice(0, 300) });
  }
}
