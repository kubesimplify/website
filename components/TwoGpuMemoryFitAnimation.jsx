const scenarios = [
  {
    key: 'one',
    verdict: 'fail',
    title: 'One card',
    flag: '-24.42 GiB',
    note: 'vLLM refuses to start',
    parts: [
      { label: 'weights', value: '61.03 GiB', width: '151%', color: '#ef4444' },
    ],
  },
  {
    key: 'two',
    verdict: 'pass',
    title: 'Two cards, TP=2',
    flag: '67,296 tokens',
    note: '2.05x concurrency at 32k context',
    parts: [
      { label: 'weights', value: '30.59 GiB', width: '75.6%', color: '#0098cc' },
      { label: 'KV cache', value: '8.22 GiB', width: '20.3%', color: '#2bb534' },
    ],
  },
];

export default function TwoGpuMemoryFitAnimation() {
  return (
    <figure className="mem-fit2" aria-labelledby="mem-fit2-title">
      <style>{`
        .mem-fit2 {
          margin: 2rem 0;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(92, 255, 104, 0.1), rgba(5, 202, 255, 0.08)),
            var(--bg-card);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }

        .mem-fit2 * { box-sizing: border-box; }

        .mem-fit2__inner { padding: clamp(1rem, 3vw, 1.5rem); }

        .mem-fit2__eyebrow {
          margin: 0 0 0.35rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .mem-fit2__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.2;
        }

        .mem-fit2__subtitle {
          max-width: 46rem;
          margin: 0.55rem 0 1.35rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .mem-fit2__stage {
          display: grid;
          gap: 0.9rem;
          padding: 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px),
            color-mix(in srgb, var(--bg-elevated) 86%, transparent);
          background-size: 42px 42px;
        }

        .mem-fit2__case {
          padding: 0.8rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: var(--bg-card);
        }

        .mem-fit2__case-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.6rem;
          margin-bottom: 0.65rem;
          flex-wrap: wrap;
        }

        .mem-fit2__case-title {
          color: var(--text-primary);
          font-size: 0.88rem;
          font-weight: 950;
        }

        .mem-fit2__case-title em {
          margin-left: 0.4rem;
          color: var(--text-muted);
          font-size: 0.68rem;
          font-style: normal;
          font-weight: 800;
        }

        .mem-fit2__flag {
          padding: 0.16rem 0.45rem;
          border-radius: 999px;
          font-size: 0.68rem;
          font-weight: 900;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .mem-fit2__case[data-verdict='fail'] .mem-fit2__flag {
          border: 1px solid rgba(239, 68, 68, 0.45);
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
        }

        .mem-fit2__case[data-verdict='pass'] .mem-fit2__flag {
          border: 1px solid color-mix(in srgb, var(--accent-secondary) 45%, transparent);
          background: color-mix(in srgb, var(--accent-secondary) 12%, transparent);
          color: color-mix(in srgb, var(--accent-secondary) 85%, var(--text-primary));
        }

        .mem-fit2__budget {
          position: relative;
          height: 3.4rem;
          border: 1px solid var(--border-medium);
          border-radius: 8px;
          background: var(--bg-elevated);
          overflow: hidden;
        }

        .mem-fit2__ceiling {
          display: flex;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.3rem;
          color: var(--text-muted);
          font-size: 0.6rem;
          font-weight: 850;
          text-transform: uppercase;
        }

        .mem-fit2__fill {
          position: absolute;
          top: 0.4rem;
          bottom: 0.4rem;
          left: 0.4rem;
          display: flex;
          gap: 2px;
          width: calc(100% - 0.8rem);
        }

        .mem-fit2__seg {
          position: relative;
          width: var(--w);
          border: 1px solid color-mix(in srgb, var(--c) 60%, var(--border-subtle));
          border-radius: 5px;
          background: color-mix(in srgb, var(--c) 20%, var(--bg-card));
          transform-origin: left;
          animation: memFit2Grow 8s ease-in-out infinite;
          animation-delay: var(--delay);
        }

        .mem-fit2__seg span {
          position: absolute;
          top: 50%;
          left: 0.45rem;
          transform: translateY(-50%);
          color: var(--text-primary);
          font-size: 0.66rem;
          font-weight: 900;
          white-space: nowrap;
        }

        .mem-fit2__seg[data-over='yes'] {
          border-style: dashed;
          box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.25) inset;
        }

        .mem-fit2__log {
          margin-top: 0.55rem;
          padding: 0.5rem 0.6rem;
          border-radius: 6px;
          border: 1px solid var(--border-subtle);
          background: color-mix(in srgb, var(--bg-elevated) 70%, transparent);
          color: var(--text-secondary);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.66rem;
          line-height: 1.5;
          overflow-x: auto;
          white-space: pre;
        }

        .mem-fit2__math {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.55rem;
        }

        .mem-fit2__math-cell {
          min-width: 0;
          padding: 0.7rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: var(--bg-card);
        }

        .mem-fit2__math-k {
          display: block;
          color: var(--text-muted);
          font-size: 0.62rem;
          font-weight: 850;
          text-transform: uppercase;
        }

        .mem-fit2__math-v {
          display: block;
          margin-top: 0.2rem;
          color: var(--accent);
          font-size: 0.92rem;
          font-weight: 950;
        }

        .mem-fit2__math-n {
          display: block;
          margin-top: 0.25rem;
          color: var(--text-muted);
          font-size: 0.64rem;
          line-height: 1.35;
        }

        .mem-fit2 figcaption {
          padding: 0 1.5rem 1.15rem;
          color: var(--text-muted);
          font-size: 0.78rem;
          line-height: 1.45;
        }

        @keyframes memFit2Grow {
          0%, 6% { transform: scaleX(0); opacity: 0; }
          18%, 82% { transform: scaleX(1); opacity: 1; }
          94%, 100% { transform: scaleX(1); opacity: 0.85; }
        }

        @media (max-width: 640px) {
          .mem-fit2__math { grid-template-columns: 1fr; }
        }

        @media (prefers-reduced-motion: reduce) {
          .mem-fit2__seg {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transform: scaleX(1);
            opacity: 1;
          }
        }
      `}</style>
      <div className="mem-fit2__inner">
        <p className="mem-fit2__eyebrow">Memory fit animation</p>
        <h3 className="mem-fit2__title" id="mem-fit2-title">
          Qwen3-32B in BF16 against one A40 budget, then two
        </h3>
        <p className="mem-fit2__subtitle">
          These are the numbers vLLM actually reported on my run. A 61.02 GiB checkpoint has nowhere
          to go on a single 45 GiB card, and the failure is not subtle: the KV cache budget comes out
          negative before a single token is stored.
        </p>

        <div className="mem-fit2__stage" aria-label="Memory fit for one card versus two cards">
          {scenarios.map((scenario) => (
            <div className="mem-fit2__case" key={scenario.key} data-verdict={scenario.verdict}>
              <div className="mem-fit2__case-head">
                <span className="mem-fit2__case-title">
                  {scenario.title}
                  <em>{scenario.note}</em>
                </span>
                <span className="mem-fit2__flag">{scenario.flag}</span>
              </div>

              <div className="mem-fit2__ceiling">
                <span>per-card budget</span>
                <span>ceiling 40.47 GiB</span>
              </div>

              <div className="mem-fit2__budget">
                <div className="mem-fit2__fill">
                  {scenario.parts.map((part, index) => (
                    <div
                      className="mem-fit2__seg"
                      key={part.label}
                      data-over={scenario.verdict === 'fail' ? 'yes' : 'no'}
                      style={{
                        '--w': part.width,
                        '--c': part.color,
                        '--delay': `${index * 0.45}s`,
                      }}
                    >
                      <span>
                        {part.label} {part.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mem-fit2__log">
                {scenario.verdict === 'fail'
                  ? 'Model loading took 61.03 GiB\nAvailable KV cache memory: -24.42 GiB\nValueError: No available memory for the cache blocks.'
                  : 'Worker_TP0  Model loading took 30.59 GiB\nWorker_TP1  Model loading took 30.59 GiB\nGPU KV cache size: 67,296 tokens'}
              </div>
            </div>
          ))}

          <div className="mem-fit2__math">
            <div className="mem-fit2__math-cell">
              <span className="mem-fit2__math-k">KV per token</span>
              <span className="mem-fit2__math-v">256 KiB</span>
              <span className="mem-fit2__math-n">
                2 x 64 layers x 8 kv heads x 128 head_dim x 2 bytes
              </span>
            </div>
            <div className="mem-fit2__math-cell">
              <span className="mem-fit2__math-k">Per card at TP=2</span>
              <span className="mem-fit2__math-v">128 KiB</span>
              <span className="mem-fit2__math-n">
                4 of the 8 kv heads land on each card, so the cache is divided, not copied
              </span>
            </div>
            <div className="mem-fit2__math-cell">
              <span className="mem-fit2__math-k">Predicted vs reported</span>
              <span className="mem-fit2__math-v">67,338 / 67,296</span>
              <span className="mem-fit2__math-n">
                8.22 GiB divided by 128 KiB, against what vLLM printed
              </span>
            </div>
          </div>
        </div>
      </div>
      <figcaption>
        Captured on two RTX PRO 6000 Blackwell cards held to a 40.47 GiB budget with
        --gpu-memory-utilization 0.426, which matches a 45 GiB A40 running at 0.90. Weight splitting
        does not depend on the architecture, so these memory figures carry over to A40 directly.
      </figcaption>
    </figure>
  );
}
