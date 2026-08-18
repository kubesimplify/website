const steps = [
  { label: 'A token arrives', detail: 'all 4 GPUs get the same copy of it' },
  { label: 'Split sideways', detail: 'each GPU owns 16 of the 64 attention heads' },
  { label: 'Work alone', detail: 'no GPU needs to ask the others anything yet' },
  { label: 'Partial answers', detail: 'each GPU has a quarter of the answer' },
  { label: 'Add them up', detail: 'one all-reduce, and all 4 hold the full result' },
];

export default function MultiGpuTensorSplitAnimation() {
  return (
    <figure className="tsplit4" aria-labelledby="tsplit4-title">
      <style>{`
        .tsplit4 {
          margin: 2rem 0;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(92, 255, 104, 0.1), rgba(5, 202, 255, 0.08)),
            var(--bg-card);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }

        .tsplit4 * { box-sizing: border-box; }
        .tsplit4__inner { padding: clamp(1rem, 3vw, 1.5rem); }

        .tsplit4__eyebrow {
          margin: 0 0 0.35rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .tsplit4__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.2;
        }

        .tsplit4__subtitle {
          max-width: 46rem;
          margin: 0.55rem 0 1.35rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .tsplit4__stage {
          display: grid;
          gap: 0.75rem;
          padding: 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px),
            color-mix(in srgb, var(--bg-elevated) 86%, transparent);
          background-size: 42px 42px;
        }

        .tsplit4__band {
          padding: 0.55rem 0.7rem;
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 0.78rem;
          font-weight: 900;
          text-align: center;
        }

        .tsplit4__band em {
          display: block;
          margin-top: 0.15rem;
          color: var(--text-muted);
          font-size: 0.64rem;
          font-style: normal;
          font-weight: 800;
        }

        .tsplit4__band[data-kind='in'] {
          border: 1px dashed color-mix(in srgb, var(--accent) 50%, var(--border-medium));
          background: color-mix(in srgb, var(--accent) 8%, var(--bg-card));
        }

        .tsplit4__band[data-kind='out'] {
          border: 1px solid color-mix(in srgb, var(--accent-secondary) 45%, var(--border-subtle));
          background: color-mix(in srgb, var(--accent-secondary) 9%, var(--bg-card));
        }

        .tsplit4__cards {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.5rem;
        }

        .tsplit4__card {
          min-width: 0;
          padding: 0.55rem;
          border: 1px solid color-mix(in srgb, var(--c) 45%, var(--border-subtle));
          border-radius: 7px;
          background: color-mix(in srgb, var(--c) 7%, var(--bg-card));
        }

        .tsplit4__card-head {
          margin-bottom: 0.45rem;
          color: var(--text-primary);
          font-size: 0.74rem;
          font-weight: 950;
        }

        .tsplit4__card-head em {
          display: block;
          color: color-mix(in srgb, var(--c) 78%, var(--text-primary));
          font-size: 0.58rem;
          font-style: normal;
          font-weight: 850;
        }

        .tsplit4__heads {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 2px;
          margin-bottom: 0.45rem;
        }

        .tsplit4__h {
          aspect-ratio: 1;
          border-radius: 2px;
          background: color-mix(in srgb, var(--c) 60%, transparent);
          animation: ts4Own 6s ease-in-out infinite;
          animation-delay: var(--d);
        }

        .tsplit4__h[data-mine='no'] {
          background: repeating-linear-gradient(45deg, var(--border-subtle) 0 2px, transparent 2px 4px);
          animation: none;
          opacity: 0.45;
        }

        .tsplit4__line {
          color: var(--text-secondary);
          font-size: 0.6rem;
          font-weight: 800;
          line-height: 1.4;
        }

        .tsplit4__line code {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.58rem;
        }

        .tsplit4__partial {
          margin-top: 0.4rem;
          padding: 0.32rem;
          border: 1px solid color-mix(in srgb, var(--c) 38%, var(--border-subtle));
          border-radius: 5px;
          background: var(--bg-card);
          color: var(--text-primary);
          font-size: 0.62rem;
          font-weight: 900;
          text-align: center;
        }

        .tsplit4__wire {
          position: relative;
          height: 2.4rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: var(--bg-card);
          overflow: hidden;
        }

        .tsplit4__pulse {
          position: absolute;
          top: 50%;
          left: 0;
          width: 30%;
          height: 2px;
          transform: translateY(-50%);
          background: linear-gradient(90deg, transparent, var(--accent-secondary), var(--accent), transparent);
          animation: ts4Pulse 6s ease-in-out infinite;
        }

        .tsplit4__wire-txt {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          color: var(--text-primary);
          font-size: 0.7rem;
          font-weight: 950;
          text-align: center;
          padding: 0 0.5rem;
        }

        .tsplit4__wire-txt em {
          color: var(--text-muted);
          font-size: 0.6rem;
          font-style: normal;
          font-weight: 800;
        }

        .tsplit4__steps {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 0.45rem;
          margin-top: 1rem;
        }

        .tsplit4__step {
          min-width: 0;
          padding: 0.55rem 0.5rem;
          border: 1px solid var(--border-subtle);
          border-radius: 7px;
          background: var(--bg-card);
          animation: ts4Step 6s ease-in-out infinite;
          animation-delay: var(--delay);
        }

        .tsplit4__step b {
          display: block;
          color: var(--accent);
          font-size: 0.58rem;
          font-weight: 900;
        }

        .tsplit4__step strong {
          display: block;
          margin-top: 0.12rem;
          color: var(--text-primary);
          font-size: 0.72rem;
          font-weight: 950;
          line-height: 1.2;
        }

        .tsplit4__step span {
          display: block;
          margin-top: 0.2rem;
          color: var(--text-muted);
          font-size: 0.6rem;
          line-height: 1.35;
        }

        .tsplit4 figcaption {
          padding: 0 1.5rem 1.15rem;
          color: var(--text-muted);
          font-size: 0.78rem;
          line-height: 1.45;
        }

        @keyframes ts4Own {
          0%, 12% { opacity: 0.4; }
          22%, 58% { opacity: 1; }
          70%, 100% { opacity: 0.6; }
        }

        @keyframes ts4Pulse {
          0%, 60% { left: -30%; opacity: 0; }
          68% { opacity: 1; }
          88% { left: 100%; opacity: 1; }
          94%, 100% { left: 100%; opacity: 0; }
        }

        @keyframes ts4Step {
          0%, 100% { border-color: var(--border-subtle); background: var(--bg-card); }
          6%, 14% {
            border-color: color-mix(in srgb, var(--accent) 55%, var(--border-subtle));
            background: color-mix(in srgb, var(--accent) 9%, var(--bg-card));
          }
        }

        @media (max-width: 760px) {
          .tsplit4__cards { grid-template-columns: 1fr 1fr; }
          .tsplit4__steps { grid-template-columns: 1fr 1fr; }
        }

        @media (prefers-reduced-motion: reduce) {
          .tsplit4__h, .tsplit4__pulse, .tsplit4__step {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
          }
          .tsplit4__h { opacity: 1; }
          .tsplit4__pulse { opacity: 1; left: 35%; }
        }
      `}</style>
      <div className="tsplit4__inner">
        <p className="tsplit4__eyebrow">Tensor parallelism animation</p>
        <h3 className="tsplit4__title" id="tsplit4-title">
          One layer, sliced four ways
        </h3>
        <p className="tsplit4__subtitle">
          This is the part people usually get wrong, so it is worth being precise. The weights get
          divided, and the thing flowing through them does not. Every GPU starts each layer holding
          an identical copy of the token, does a quarter of the arithmetic on its own slice of the
          weights, and ends up with a quarter of an answer. Then they add their quarters together.
        </p>

        <div className="tsplit4__stage" role="img" aria-label="A token split across four GPUs and recombined with one all-reduce">
          <div className="tsplit4__band" data-kind="in">
            the token, 4096 numbers wide
            <em>copied to all four GPUs, not divided</em>
          </div>

          <div className="tsplit4__cards">
            {[0, 1, 2, 3].map((gpu) => (
              <div
                className="tsplit4__card"
                key={gpu}
                style={{ '--c': ['#0098cc', '#2bb534', '#a855f7', '#f59e0b'][gpu] }}
              >
                <p className="tsplit4__card-head">
                  GPU {gpu}
                  <em>heads {gpu * 16}-{gpu * 16 + 15}</em>
                </p>
                <div className="tsplit4__heads" aria-hidden="true">
                  {Array.from({ length: 16 }, (_, i) => {
                    const mine = Math.floor(i / 4) === gpu;
                    return (
                      <div
                        className="tsplit4__h"
                        key={i}
                        data-mine={mine ? 'yes' : 'no'}
                        style={{ '--d': `${gpu * 0.15}s` }}
                      />
                    );
                  })}
                </div>
                <p className="tsplit4__line">
                  16 of 64 heads
                  <br />
                  1 of 4 kv heads
                  <br />
                  <span style={{ opacity: 0.7 }}>each square above = 4 heads</span>
                </p>
                <p className="tsplit4__partial">a quarter answer</p>
              </div>
            ))}
          </div>

          <div className="tsplit4__wire">
            <div className="tsplit4__pulse" aria-hidden="true" />
            <div className="tsplit4__wire-txt">
              all-reduce
              <em>8 KiB per token, 188 times per token</em>
            </div>
          </div>

          <div className="tsplit4__band" data-kind="out">
            the finished layer output, now identical on all four GPUs
            <em>and the next layer does the whole dance again</em>
          </div>
        </div>

        <div className="tsplit4__steps">
          {steps.map((step, i) => (
            <div className="tsplit4__step" key={step.label} style={{ '--delay': `${i * 1.2}s` }}>
              <b>Step {i + 1}</b>
              <strong>{step.label}</strong>
              <span>{step.detail}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption>
        Shapes are Qwen3-235B-A22B: hidden size 4096, 64 attention heads, 4 key/value heads, 94
        layers. Those 4 key/value heads are the reason this model cannot be split cleanly more than 4
        ways, which we come back to later.
      </figcaption>
    </figure>
  );
}
