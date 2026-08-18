const modes = [
  {
    key: 'tp',
    name: 'Tensor parallelism',
    flag: '--tensor-parallel-size',
    plain: 'Cut every layer into vertical strips. Each GPU holds a strip of all 94 layers.',
    talks: 'A lot. Twice per layer, so 188 times per token.',
    good: 'Fastest for a single user, because all 4 GPUs work on the same token.',
    color: '#0098cc',
  },
  {
    key: 'pp',
    name: 'Pipeline parallelism',
    flag: '--pipeline-parallel-size',
    plain: 'Cut the stack into horizontal blocks. With 94 layers over 4 GPUs, each one owns about 23 of them.',
    talks: 'Barely. One handoff between neighbours per token.',
    good: 'Kind to a slow network between GPUs, but a GPU waits its turn.',
    color: '#2bb534',
  },
  {
    key: 'ep',
    name: 'Expert parallelism',
    flag: '--enable-expert-parallel',
    plain: 'Deal the 128 experts out like cards. Each GPU keeps 32 of them, whole.',
    talks: 'Medium. Tokens are shipped to whichever GPU owns the expert they need.',
    good: 'Only exists for MoE models, and it is how the really big ones are served.',
    color: '#a855f7',
  },
];

export default function MultiGpuSplitModesAnimation() {
  return (
    <figure className="splitmodes" aria-labelledby="splitmodes-title">
      <style>{`
        .splitmodes {
          margin: 2rem 0;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(92, 255, 104, 0.1), rgba(5, 202, 255, 0.08)),
            var(--bg-card);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }

        .splitmodes * { box-sizing: border-box; }
        .splitmodes__inner { padding: clamp(1rem, 3vw, 1.5rem); }

        .splitmodes__eyebrow {
          margin: 0 0 0.35rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .splitmodes__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.2;
        }

        .splitmodes__subtitle {
          max-width: 46rem;
          margin: 0.55rem 0 1.35rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .splitmodes__grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.85rem;
        }

        .splitmodes__mode {
          min-width: 0;
          padding: 0.85rem;
          border: 1px solid color-mix(in srgb, var(--c) 42%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, var(--c) 6%, var(--bg-card));
        }

        .splitmodes__name {
          margin: 0 0 0.15rem;
          color: var(--text-primary);
          font-size: 0.92rem;
          font-weight: 950;
          line-height: 1.2;
        }

        .splitmodes__flag {
          display: inline-block;
          margin-bottom: 0.7rem;
          padding: 0.12rem 0.4rem;
          border-radius: 4px;
          background: color-mix(in srgb, var(--c) 14%, var(--bg-elevated));
          color: color-mix(in srgb, var(--c) 82%, var(--text-primary));
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.64rem;
          font-weight: 800;
        }

        /* ── the little 4-GPU picture ─────────────────── */
        .splitmodes__pic {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 3px;
          height: 4.6rem;
          margin-bottom: 0.7rem;
          padding: 0.3rem;
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          background: var(--bg-card);
        }

        .splitmodes__gpu {
          position: relative;
          display: grid;
          gap: 2px;
          padding: 2px;
          border-radius: 4px;
          background: color-mix(in srgb, var(--c) 8%, transparent);
          overflow: hidden;
        }

        /* TP: every GPU shows a strip of every layer */
        .splitmodes__gpu[data-mode='tp'] { grid-template-rows: repeat(4, 1fr); }
        .splitmodes__gpu[data-mode='tp'] i {
          border-radius: 1px;
          background: color-mix(in srgb, var(--c) 55%, transparent);
          animation: smPulseAll 3.2s ease-in-out infinite;
        }

        /* PP: only one GPU is busy at a time */
        .splitmodes__gpu[data-mode='pp'] { grid-template-rows: repeat(4, 1fr); }
        .splitmodes__gpu[data-mode='pp'] i {
          border-radius: 1px;
          background: color-mix(in srgb, var(--c) 55%, transparent);
          animation: smRelay 3.2s ease-in-out infinite;
          animation-delay: var(--stage);
        }

        /* EP: each GPU holds a pile of whole experts */
        .splitmodes__gpu[data-mode='ep'] { grid-template-rows: repeat(4, 1fr); }
        .splitmodes__gpu[data-mode='ep'] i {
          border-radius: 1px;
          background: color-mix(in srgb, var(--c) 45%, transparent);
          animation: smSpark 3.2s ease-in-out infinite;
          animation-delay: var(--spark);
        }

        .splitmodes__gpu span {
          position: absolute;
          right: 2px;
          bottom: 0;
          color: var(--text-muted);
          font-size: 0.5rem;
          font-weight: 900;
        }

        .splitmodes__rows { display: grid; gap: 0.45rem; }

        .splitmodes__row {
          color: var(--text-secondary);
          font-size: 0.7rem;
          line-height: 1.45;
        }

        .splitmodes__row b {
          display: block;
          color: var(--text-muted);
          font-size: 0.58rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .splitmodes figcaption {
          padding: 0 1.5rem 1.15rem;
          color: var(--text-muted);
          font-size: 0.78rem;
          line-height: 1.45;
        }

        @keyframes smPulseAll {
          0%, 100% { opacity: 0.3; }
          45%, 60% { opacity: 1; }
        }

        @keyframes smRelay {
          0%, 100% { opacity: 0.18; }
          10%, 22% { opacity: 1; }
        }

        @keyframes smSpark {
          0%, 100% { opacity: 0.28; }
          40%, 52% { opacity: 1; }
        }

        @media (max-width: 760px) {
          .splitmodes__grid { grid-template-columns: 1fr; }
        }

        @media (prefers-reduced-motion: reduce) {
          .splitmodes__gpu i {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            opacity: 1 !important;
          }
        }
      `}</style>
      <div className="splitmodes__inner">
        <p className="splitmodes__eyebrow">Three ways to split animation</p>
        <h3 className="splitmodes__title" id="splitmodes-title">
          The same model, cut three different ways across four GPUs
        </h3>
        <p className="splitmodes__subtitle">
          These are not competing products, they are three different cuts through the same pile of
          weights, and you can combine them. Each box below is one GPU. Watch which parts light up,
          because that tells you which GPUs are doing work at the same moment.
        </p>

        <div className="splitmodes__grid">
          {modes.map((mode) => (
            <div className="splitmodes__mode" key={mode.key} style={{ '--c': mode.color }}>
              <p className="splitmodes__name">{mode.name}</p>
              <code className="splitmodes__flag">{mode.flag}</code>

              <div className="splitmodes__pic" aria-hidden="true">
                {[0, 1, 2, 3].map((gpu) => (
                  <div
                    className="splitmodes__gpu"
                    key={gpu}
                    data-mode={mode.key}
                    style={{ '--c': mode.color }}
                  >
                    {[0, 1, 2, 3].map((slot) => (
                      <i
                        key={slot}
                        style={{
                          '--stage': `${gpu * 0.8}s`,
                          '--spark': `${((gpu + slot) % 4) * 0.4}s`,
                        }}
                      />
                    ))}
                    <span>{gpu}</span>
                  </div>
                ))}
              </div>

              <div className="splitmodes__rows">
                <p className="splitmodes__row">
                  <b>What it does</b>
                  {mode.plain}
                </p>
                <p className="splitmodes__row">
                  <b>How much it talks</b>
                  {mode.talks}
                </p>
                <p className="splitmodes__row">
                  <b>When it wins</b>
                  {mode.good}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <figcaption>
        Layer and expert counts are Qwen3-235B-A22B: 94 layers, 128 experts with 8 picked per token.
        Under tensor parallelism all four GPUs light up together on every token. Under pipeline
        parallelism they light up in turn, which is the idle time you are trading away.
      </figcaption>
    </figure>
  );
}
