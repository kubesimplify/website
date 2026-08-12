'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

/**
 * Interactive learning journey: checkable steps with localStorage progress,
 * per-stage time estimates, a verifiable "Checkpoint" outcome, and a
 * hands-on "Prove it" mission. This is the deliberate difference from
 * roadmap.sh-style maps: an opinionated, walkable line with skill
 * checkpoints, not a topology of links.
 *
 * Progress lives in localStorage today; when member accounts land it syncs
 * to the profile.
 */

const KIND = {
  blog: { icon: '📖', label: 'article' },
  video: { icon: '▶️', label: 'video' },
  workshop: { icon: '🎓', label: 'workshop' },
  playlist: { icon: '📺', label: 'playlist' },
  book: { icon: '📕', label: 'e-book' },
  lab: { icon: '⌨️', label: 'lab' },
  product: { icon: '🧩', label: 'tool' },
  path: { icon: '🗺️', label: 'path' },
};

function stepMeta(step) {
  if (step.blog) return { ...KIND.blog, href: `https://blog.kubesimplify.com/${step.blog}`, external: true };
  if (step.video) return { ...KIND.video, href: step.video, external: true };
  if (step.workshop) return { ...KIND.workshop, href: step.workshop, external: true };
  if (step.playlist) return { ...KIND.playlist, href: step.playlist, external: true };
  if (step.book) return { ...KIND.book, href: step.book, external: true };
  if (step.lab) return { ...KIND.lab, href: step.lab, external: true };
  if (step.tool) return { ...KIND.product, href: step.tool, external: true };
  if (step.product) return { ...KIND.product, href: `/products/${step.product}`, external: false };
  if (step.path) return { ...KIND.path, href: `/learn/${step.path}`, external: false };
  return null;
}

export default function LearningPathJourney({ path }) {
  const storageKey = `ks-journey-${path.slug}`;
  const [done, setDone] = useState(() => new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setDone(new Set(saved));
    } catch {}
    setLoaded(true);
  }, [storageKey]);

  const toggle = (id) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const { totalSteps, doneSteps, firstOpenStage } = useMemo(() => {
    let total = 0;
    let complete = 0;
    let firstOpen = -1;
    path.stages.forEach((stage, si) => {
      const checkable = stage.steps.filter((s) => !s.planned);
      total += checkable.length;
      const stageDone = checkable.filter((_, ti) => done.has(`${si}-${ti}`)).length;
      complete += stageDone;
      if (firstOpen === -1 && stageDone < checkable.length) firstOpen = si;
    });
    return { totalSteps: total, doneSteps: complete, firstOpenStage: firstOpen === -1 ? 0 : firstOpen };
  }, [path.stages, done]);

  const pct = totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const scrollToStage = (i) => {
    document.getElementById(`stage-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      {/* Progress header */}
      <div
        className="rounded-2xl border p-5 mb-10 sticky top-20 z-10 backdrop-blur-md"
        style={{ borderColor: 'var(--border-subtle)', background: 'color-mix(in srgb, var(--bg-card) 85%, transparent)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {loaded && doneSteps > 0 ? (
              <>Your journey: {doneSteps}/{totalSteps} steps · {pct}%</>
            ) : (
              <>Your journey: {totalSteps} steps. Check them off as you go, this page remembers.</>
            )}
          </p>
          {loaded && doneSteps > 0 && pct < 100 && (
            <button
              onClick={() => scrollToStage(firstOpenStage)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: 'var(--accent)', color: '#03121a' }}
            >
              Continue where you left off →
            </button>
          )}
          {loaded && pct === 100 && (
            <span className="text-xs font-bold" style={{ color: 'var(--accent-secondary)' }}>
              🎉 Journey complete. Go break something in production (gracefully).
            </span>
          )}
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent-secondary), var(--accent))' }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {path.stages.map((s, i) => (
            <button
              key={s.title}
              onClick={() => scrollToStage(i)}
              className="text-[11px] font-mono px-2 py-1 rounded-md hover:opacity-100 transition-opacity"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                opacity: 0.8,
              }}
            >
              {i + 1}. {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Journey spine */}
      <div className="relative">
        <div
          className="absolute left-[15px] top-2 bottom-2 w-0.5"
          style={{ background: 'linear-gradient(to bottom, var(--accent-secondary), var(--accent))' }}
          aria-hidden
        />
        <div className="space-y-12">
          {path.stages.map((stage, si) => {
            const checkable = stage.steps.filter((s) => !s.planned);
            const stageDone = checkable.filter((_, ti) => done.has(`${si}-${ti}`)).length;
            const stageComplete = checkable.length > 0 && stageDone === checkable.length;

            return (
              <section key={stage.title} id={`stage-${si}`} className="relative pl-12 scroll-mt-40">
                <div
                  className="absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm font-bold"
                  style={{
                    background: stageComplete ? 'var(--accent-secondary)' : 'var(--bg-card)',
                    border: '2px solid ' + (stageComplete ? 'var(--accent-secondary)' : 'var(--accent)'),
                    color: stageComplete ? '#03121a' : 'var(--accent)',
                  }}
                  aria-hidden
                >
                  {stageComplete ? '✓' : si + 1}
                </div>

                <div className="flex flex-wrap items-baseline gap-3 mb-1 pt-0.5">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stage.title}</h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                    ~{stage.time}
                  </span>
                  {loaded && stageDone > 0 && (
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {stageDone}/{checkable.length}
                    </span>
                  )}
                </div>
                {stage.intro && (
                  <p className="text-sm leading-relaxed mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {stage.intro}
                  </p>
                )}

                <div className="space-y-2 mt-4">
                  {stage.steps.map((step, rawIdx) => {
                    if (step.planned) {
                      return (
                        <div key={step.title} className="flex items-center gap-3 py-2.5 px-4 rounded-lg opacity-60" style={{ background: 'var(--bg-elevated)' }}>
                          <span className="text-sm" aria-hidden>🚧</span>
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{step.title}</span>
                          <span className="ml-auto shrink-0 text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                            guide coming
                          </span>
                        </div>
                      );
                    }
                    const ti = stage.steps.slice(0, rawIdx).filter((s) => !s.planned).length;
                    const id = `${si}-${ti}`;
                    const meta = stepMeta(step);
                    const checked = done.has(id);
                    const Cmp = meta.external ? 'a' : Link;
                    const extra = meta.external ? { target: '_blank', rel: 'noreferrer' } : {};

                    return (
                      <div
                        key={step.title}
                        className="flex items-center gap-3 py-2.5 px-4 rounded-lg group"
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          opacity: checked ? 0.65 : 1,
                        }}
                      >
                        <button
                          onClick={() => toggle(id)}
                          aria-label={checked ? 'Mark as not done' : 'Mark as done'}
                          className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition-colors"
                          style={{
                            borderColor: checked ? 'var(--accent-secondary)' : 'var(--border-medium)',
                            background: checked ? 'var(--accent-secondary)' : 'transparent',
                            color: '#03121a',
                          }}
                        >
                          {checked ? '✓' : ''}
                        </button>
                        <span className="text-sm shrink-0" aria-hidden>{meta.icon}</span>
                        <Cmp
                          href={meta.href}
                          {...extra}
                          className="text-sm font-medium group-hover:text-[var(--accent)] transition-colors min-w-0"
                          style={{
                            color: 'var(--text-primary)',
                            textDecoration: checked ? 'line-through' : 'none',
                          }}
                        >
                          {step.title}
                        </Cmp>
                        <span className="ml-auto shrink-0 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{meta.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Checkpoint + mission */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: 'var(--accent-secondary)' }}>
                      ✓ Checkpoint: you can now
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{stage.outcome}</p>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: 'var(--accent)' }}>
                      ⚡ Prove it
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{stage.mission}</p>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
