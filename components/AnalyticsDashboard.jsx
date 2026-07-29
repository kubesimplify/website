'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Consolidated first-party analytics dashboard, fed by the analytics Worker
// (GET /api/stats). Password-protected via the DASH_PASSWORD Worker secret.
// Same-origin on blog.kubesimplify.com (and local `wrangler dev`); absolute
// when the page is viewed on kubesimplify.com, which has no API.
function apiBase() {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  return host === 'blog.kubesimplify.com' || host === 'localhost' || host === '127.0.0.1'
    ? ''
    : 'https://blog.kubesimplify.com';
}
const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

// Chart palette, validated (dataviz six checks) per mode against the card
// surfaces. Light-mode green sits below 3:1 contrast, so every series is
// also direct-labeled / listed in text.
const PALETTE_CSS = `
  .viz-root { --s1: #0098cc; --s2: #2bb534; }
  .dark .viz-root { --s1: #0090c0; --s2: #2aa935; }
`;

const nf = new Intl.NumberFormat('en-US');
const regionNames = typeof Intl.DisplayNames !== 'undefined'
  ? new Intl.DisplayNames(['en'], { type: 'region' })
  : null;

function fmtTime(secs) {
  if (!secs) return '0s';
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return m ? `${m}m ${s}s` : `${s}s`;
}

function countryName(code) {
  try {
    return regionNames?.of(code) || code;
  } catch {
    return code;
  }
}

// ── Line chart: views & visitors per day ────────────────────────────────
function TrendChart({ byDay, days }) {
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);

  const series = useMemo(() => {
    // D1 skips empty days; rebuild the full range so gaps read as zero.
    const map = Object.fromEntries(byDay.map((d) => [d.day, d]));
    const out = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      out.push({ day: key, views: map[key]?.views || 0, visitors: map[key]?.visitors || 0 });
    }
    return out;
  }, [byDay, days]);

  const W = 900;
  const H = 260;
  const PAD = { top: 16, right: 12, bottom: 28, left: 44 };
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const max = Math.max(1, ...series.map((d) => d.views));
  const x = (i) => PAD.left + (series.length < 2 ? iw / 2 : (i / (series.length - 1)) * iw);
  const y = (v) => PAD.top + ih - (v / max) * ih;
  const line = (key) => series.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join('');

  const yTicks = useMemo(() => {
    const step = Math.max(1, Math.ceil(max / 4));
    const ticks = [];
    for (let v = 0; v <= max; v += step) ticks.push(v);
    return ticks;
  }, [max]);

  const onMove = (e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PAD.left) / iw) * (series.length - 1));
    setHover(Math.min(Math.max(i, 0), series.length - 1));
  };

  const labelEvery = Math.max(1, Math.ceil(series.length / 8));

  return (
    <div className="relative">
      <div className="flex items-center gap-5 mb-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <span className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: 'var(--s1)' }} />
          Views
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: 'var(--s2)' }} />
          Unique visitors
        </span>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="var(--border-medium)" strokeWidth="1" />
            <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--text-secondary)">
              {nf.format(v)}
            </text>
          </g>
        ))}
        {series.map((d, i) =>
          i % labelEvery === 0 ? (
            <text key={d.day} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--text-secondary)">
              {d.day.slice(5)}
            </text>
          ) : null
        )}
        <path d={`${line('views')} L${x(series.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill="var(--s1)" opacity="0.08" />
        <path d={line('views')} fill="none" stroke="var(--s1)" strokeWidth="2" strokeLinejoin="round" />
        <path d={line('visitors')} fill="none" stroke="var(--s2)" strokeWidth="2" strokeLinejoin="round" />
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + ih} stroke="var(--text-secondary)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(series[hover].views)} r="4" fill="var(--s1)" stroke="var(--bg-card)" strokeWidth="2" />
            <circle cx={x(hover)} cy={y(series[hover].visitors)} r="4" fill="var(--s2)" stroke="var(--bg-card)" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div
          className="absolute pointer-events-none px-3 py-2 rounded-lg text-xs shadow-lg border"
          style={{
            left: `${(x(hover) / W) * 100}%`,
            top: 24,
            transform: x(hover) > W / 2 ? 'translateX(-110%)' : 'translateX(10%)',
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border-medium)',
            color: 'var(--text-primary)',
          }}
        >
          <div className="font-semibold mb-1">{series[hover].day}</div>
          <div>Views: {nf.format(series[hover].views)}</div>
          <div>Visitors: {nf.format(series[hover].visitors)}</div>
        </div>
      )}
    </div>
  );
}

// ── Horizontal bar list (top posts, referrers, countries…) ──────────────
function BarList({ rows, extra }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) {
    return <p className="text-sm py-4" style={{ color: 'var(--text-secondary)' }}>No data yet.</p>;
  }
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.key} className="group" title={r.title || r.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm mb-1">
            <span className="truncate" style={{ color: 'var(--text-primary)' }}>
              {r.href ? (
                <a href={r.href} className="hover:underline" target="_blank" rel="noreferrer">{r.label}</a>
              ) : (
                r.label
              )}
            </span>
            <span className="shrink-0 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
              {nf.format(r.value)}
              {extra && r.extra !== undefined ? ` · ${r.extra}` : ''}
            </span>
          </div>
          <div className="h-2 rounded-sm overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
            <div
              className="h-full rounded-sm"
              style={{ width: `${(r.value / max) * 100}%`, background: 'var(--s1)', minWidth: 2 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Card({ title, children, className = '' }) {
  return (
    <section
      className={`rounded-xl border p-5 ${className}`}
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
    >
      {title && (
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--text-secondary)' }}>
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

function StatTile({ label, value, sub }) {
  return (
    <Card>
      <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <p className="text-3xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
    </Card>
  );
}

export default function AnalyticsDashboard() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (pw, range) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiBase()}/api/stats?days=${range}`, {
        headers: { Authorization: `Bearer ${pw}` },
      });
      if (res.status === 401) {
        sessionStorage.removeItem('ks_dash_pw');
        setAuthed(false);
        setError('Wrong password.');
        return;
      }
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      setData(await res.json());
      setAuthed(true);
      sessionStorage.setItem('ks_dash_pw', pw);
    } catch (e) {
      setError(`Could not load stats: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('ks_dash_pw');
    if (saved) {
      setPassword(saved);
      load(saved, days);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeRange = (d) => {
    setDays(d);
    load(password, d);
  };

  if (!authed) {
    return (
      <main className="pt-32 pb-24 min-h-screen flex items-start justify-center px-4">
        <form
          onSubmit={(e) => { e.preventDefault(); load(password, days); }}
          className="w-full max-w-sm rounded-xl border p-6"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Blog analytics</h1>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Enter the dashboard password.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full rounded-lg border px-3 py-2 mb-3 bg-transparent outline-none focus:border-[var(--accent)]"
            style={{ borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
            placeholder="Password"
          />
          {error && <p className="text-sm mb-3 text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-lg py-2 font-semibold disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#03121a' }}
          >
            {loading ? 'Checking…' : 'View dashboard'}
          </button>
        </form>
      </main>
    );
  }

  const totals = data?.totals || { views: 0, visitors: 0, avg_time: 0 };
  const posts = (data?.posts || []).map((p) => ({
    key: p.path,
    label: p.path.replace(/^\/blog\//, '').replace(/^\//, '') || 'home',
    href: `https://blog.kubesimplify.com${p.path.replace(/^\/blog/, '') || '/'}`,
    title: p.path,
    value: p.views,
    extra: fmtTime(p.avg_time),
  }));
  const referrers = (data?.referrers || []).map((r) => ({ key: r.referrer, label: r.referrer, value: r.views }));
  const countries = (data?.countries || []).map((c) => ({ key: c.country, label: countryName(c.country), value: c.views }));
  const devices = (data?.devices || []).map((d) => ({ key: d.device, label: d.device, value: d.views }));

  return (
    <main className="pt-28 pb-24 min-h-screen px-4 viz-root">
      <style dangerouslySetInnerHTML={{ __html: PALETTE_CSS }} />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Blog analytics</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              First-party data · kubesimplify.com + blog.kubesimplify.com
            </p>
          </div>
          <div className="flex items-center gap-2">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => changeRange(r.days)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border"
                style={{
                  background: days === r.days ? 'var(--accent)' : 'transparent',
                  color: days === r.days ? '#03121a' : 'var(--text-secondary)',
                  borderColor: days === r.days ? 'var(--accent)' : 'var(--border-medium)',
                }}
              >
                {r.label}
              </button>
            ))}
            <button
              onClick={() => { sessionStorage.removeItem('ks_dash_pw'); setAuthed(false); setPassword(''); }}
              className="px-3 py-1.5 rounded-lg text-sm border"
              style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-medium)' }}
            >
              Lock
            </button>
          </div>
        </div>

        {loading && <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Refreshing…</p>}
        {error && <p className="text-sm mb-4 text-red-500">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <StatTile label="Page views" value={nf.format(totals.views)} sub={`last ${data?.days ?? days} days`} />
          <StatTile label="Unique visitors" value={nf.format(totals.visitors)} sub="daily-rotating anonymous IDs" />
          <StatTile label="Avg time on page" value={fmtTime(totals.avg_time)} sub="actual visible time, not tab-open time" />
        </div>

        <Card title="Views over time" className="mb-4">
          <TrendChart byDay={data?.by_day || []} days={data?.days ?? days} />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Top posts · views & avg read time">
            <BarList rows={posts} extra />
          </Card>
          <div className="space-y-4">
            <Card title="Referrers">
              <BarList rows={referrers} />
            </Card>
            <Card title="Countries">
              <BarList rows={countries.slice(0, 10)} />
            </Card>
            <Card title="Devices">
              <BarList rows={devices} />
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
