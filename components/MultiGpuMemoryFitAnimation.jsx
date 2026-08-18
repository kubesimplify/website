const cases = [
  {
    key: 'one',
    verdict: 'fail',
    title: '1 GPU',
    flag: 'will not start',
    note: '221 GiB of weights against an 85.51 GiB budget',
    parts: [{ label: 'weights', value: '221 GiB', width: '92.08%', color: '#ef4444' }],
    log: 'the model is 2.6x larger than the whole budget\nthere is no flag that fixes this',
  },
  {
    key: 'two',
    verdict: 'fail',
    title: '2 GPUs',
    flag: 'CUDA out of memory',
    note: 'about 110 GiB per card, still too much',
    parts: [{ label: 'weights per card', value: '110 GiB', width: '46.04%', color: '#f59e0b' }],
    log: 'Failed to load model - not enough GPU memory\n95.01 GiB total, of which 438.31 MiB is free',
  },
  {
    key: 'four',
    verdict: 'pass',
    title: '4 GPUs',
    flag: '621,392 tokens',
    note: 'weights fit, with room for about 19 concurrent 32k conversations',
    parts: [
      { label: 'weights', value: '55.19 GiB', width: '23.00%', color: '#0098cc' },
      { label: 'KV cache', value: '27.85 GiB', width: '11.60%', color: '#2bb534' },
    ],
    log: 'Worker_TP0  Model loading took 55.19 GiB\nAvailable KV cache memory: 27.85 GiB\nGPU KV cache size: 621,392 tokens',
  },
];

export default function MultiGpuMemoryFitAnimation() {
  return (
    <figure className="memfit" aria-labelledby="memfit-title">
      <style>{`
        .memfit {
          margin: 2rem 0;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(92, 255, 104, 0.1), rgba(5, 202, 255, 0.08)),
            var(--bg-card);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }

        .memfit * { box-sizing: border-box; }
        .memfit__inner { padding: clamp(1rem, 3vw, 1.5rem); }

        .memfit__eyebrow {
          margin: 0 0 0.35rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .memfit__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.2;
        }

        .memfit__subtitle {
          max-width: 46rem;
          margin: 0.55rem 0 1.35rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .memfit__stage {
          display: grid;
          gap: 0.85rem;
          padding: 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px),
            color-mix(in srgb, var(--bg-elevated) 86%, transparent);
          background-size: 42px 42px;
        }

        .memfit__case {
          padding: 0.8rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: var(--bg-card);
        }

        .memfit__head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.6rem;
          margin-bottom: 0.55rem;
          flex-wrap: wrap;
        }

        .memfit__name {
          color: var(--text-primary);
          font-size: 0.9rem;
          font-weight: 950;
        }

        .memfit__name em {
          margin-left: 0.45rem;
          color: var(--text-muted);
          font-size: 0.68rem;
          font-style: normal;
          font-weight: 800;
        }

        .memfit__flag {
          padding: 0.16rem 0.45rem;
          border-radius: 999px;
          font-size: 0.66rem;
          font-weight: 900;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          white-space: nowrap;
        }

        .memfit__case[data-verdict='fail'] .memfit__flag {
          border: 1px solid rgba(239, 68, 68, 0.45);
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
        }

        .memfit__case[data-verdict='pass'] .memfit__flag {
          border: 1px solid color-mix(in srgb, var(--accent-secondary) 45%, transparent);
          background: color-mix(in srgb, var(--accent-secondary) 12%, transparent);
          color: color-mix(in srgb, var(--accent-secondary) 85%, var(--text-primary));
        }

        .memfit__ceiling {
          display: flex;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.28rem;
          color: var(--text-muted);
          font-size: 0.58rem;
          font-weight: 900;
          text-transform: uppercase;
        }

        .memfit__limit {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 35.63%;
          width: 0;
          border-left: 2px dashed color-mix(in srgb, var(--text-primary) 55%, transparent);
          z-index: 2;
        }

        .memfit__limit span {
          position: absolute;
          top: 50%;
          left: 0.3rem;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-size: 0.55rem;
          font-weight: 900;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .memfit__track {
          position: relative;
          height: 2.9rem;
          border: 1px solid var(--border-medium);
          border-radius: 8px;
          background: var(--bg-elevated);
          overflow: hidden;
        }

        .memfit__fill {
          position: absolute;
          top: 0.35rem;
          bottom: 0.35rem;
          left: 0.35rem;
          display: flex;
          gap: 2px;
          width: calc(100% - 0.7rem);
        }

        .memfit__seg {
          position: relative;
          /* flex: 0 0 so an over-100% width genuinely overflows the track instead
             of being shrunk to fit, which is the whole point of the failing cases */
          flex: 0 0 var(--w);
          border: 1px solid color-mix(in srgb, var(--c) 60%, var(--border-subtle));
          border-radius: 5px;
          background: color-mix(in srgb, var(--c) 20%, var(--bg-card));
          transform-origin: left;
          animation: memfitGrow 7s ease-in-out infinite;
          animation-delay: var(--delay);
        }

        .memfit__case[data-verdict='fail'] .memfit__seg { border-style: dashed; }

        .memfit__seg span {
          position: absolute;
          top: 50%;
          left: 0.4rem;
          transform: translateY(-50%);
          color: var(--text-primary);
          font-size: 0.64rem;
          font-weight: 900;
          white-space: nowrap;
        }

        .memfit__log {
          margin-top: 0.5rem;
          padding: 0.45rem 0.55rem;
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          background: color-mix(in srgb, var(--bg-elevated) 70%, transparent);
          color: var(--text-secondary);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.63rem;
          line-height: 1.5;
          overflow-x: auto;
          white-space: pre;
        }

        .memfit__math {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.55rem;
        }

        .memfit__cell {
          min-width: 0;
          padding: 0.7rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: var(--bg-card);
        }

        .memfit__k {
          display: block;
          color: var(--text-muted);
          font-size: 0.58rem;
          font-weight: 900;
          text-transform: uppercase;
        }

        .memfit__v {
          display: block;
          margin-top: 0.18rem;
          color: var(--accent);
          font-size: 0.88rem;
          font-weight: 950;
        }

        .memfit__d {
          display: block;
          margin-top: 0.22rem;
          color: var(--text-muted);
          font-size: 0.62rem;
          line-height: 1.35;
        }

        .memfit figcaption {
          padding: 0 1.5rem 1.15rem;
          color: var(--text-muted);
          font-size: 0.78rem;
          line-height: 1.45;
        }

        @keyframes memfitGrow {
          0%, 5% { transform: scaleX(0); opacity: 0; }
          16%, 84% { transform: scaleX(1); opacity: 1; }
          95%, 100% { transform: scaleX(1); opacity: 0.85; }
        }

        @media (max-width: 640px) {
          .memfit__math { grid-template-columns: 1fr; }

          /* the nowrap label does not fit inside a narrow segment, so let it
             sit above the track rather than clipping mid-word */
          .memfit__track { height: 2.2rem; }

          .memfit__seg span {
            top: auto;
            bottom: calc(100% + 0.15rem);
            left: 0;
            transform: none;
            font-size: 0.58rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .memfit__seg {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transform: scaleX(1);
            opacity: 1;
          }
        }
      `}</style>
      <div className="memfit__inner">
        <p className="memfit__eyebrow">Memory fit animation</p>
        <h3 className="memfit__title" id="memfit-title">
          The same model on 1, 2 and 4 GPUs
        </h3>
        <p className="memfit__subtitle">
          Every number here came out of a real run. All three bars are drawn to the same scale, and
          the dashed line is the 85.51 GiB that vLLM may use on one card at
          --gpu-memory-utilization 0.90. A bar reaching past that line means the model does not fit.
          Watch it shrink as GPUs are added, and note that it takes 4 before the bar finally lands to
          the left of the line.
        </p>

        <div className="memfit__stage" role="img" aria-label="Memory fit on one, two and four GPUs">
          {cases.map((c) => (
            <div className="memfit__case" key={c.key} data-verdict={c.verdict}>
              <div className="memfit__head">
                <span className="memfit__name">
                  {c.title}
                  <em>{c.note}</em>
                </span>
                <span className="memfit__flag">{c.flag}</span>
              </div>

              <div className="memfit__ceiling">
                <span>what one card must hold</span>
                <span>full axis = 240 GiB</span>
              </div>

              <div className="memfit__track">
                <div className="memfit__limit" aria-hidden="true">
                  <span>85.51 GiB budget</span>
                </div>
                <div className="memfit__fill">
                  {c.parts.map((p, i) => (
                    <div
                      className="memfit__seg"
                      key={p.label}
                      style={{ '--w': p.width, '--c': p.color, '--delay': `${i * 0.4}s` }}
                    >
                      <span>
                        {p.label} {p.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="memfit__log">{c.log}</div>
            </div>
          ))}

          <div className="memfit__math">
            <div className="memfit__cell">
              <span className="memfit__k">KV per token, whole model</span>
              <span className="memfit__v">188 KiB</span>
              <span className="memfit__d">2 x 94 layers x 4 kv heads x 128 head_dim x 2 bytes</span>
            </div>
            <div className="memfit__cell">
              <span className="memfit__k">Per card at TP=4</span>
              <span className="memfit__v">47 KiB</span>
              <span className="memfit__d">
                each card keeps 1 of the 4 kv heads, so the cache divides rather than repeats
              </span>
            </div>
            <div className="memfit__cell">
              <span className="memfit__k">Predicted vs reported</span>
              <span className="memfit__v">621,337 / 621,392</span>
              <span className="memfit__d">
                27.85 GiB divided by 47 KiB, against what vLLM actually printed
              </span>
            </div>
          </div>
        </div>
      </div>
      <figcaption>
        Measured on 4x RTX PRO 6000 Blackwell with Qwen3-235B-A22B-Instruct-2507-FP8 on vLLM 0.27.1.
        The 1 GPU and 2 GPU bars are what the run actually attempted before failing, not estimates.
        Because this model has only 4 key/value heads, its cache is unusually cheap, which is why 4
        cards leave room for about 19 concurrent conversations at the 32,768-token limit we set.
      </figcaption>
    </figure>
  );
}
