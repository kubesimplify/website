const results = [
  { metric: 'tok/s at concurrency 1', tp: '36.41', pp: '21.00', win: 'tp' },
  { metric: 'tok/s at concurrency 32', tp: '496.60', pp: '487.56', win: 'tie' },
  { metric: 'median TTFT at 32', tp: '3892 ms', pp: '2468 ms', win: 'pp' },
  { metric: 'KV cache tokens', tp: '67,296', pp: '56,640', win: 'tp' },
];

export default function TwoGpuTpVsPpAnimation() {
  return (
    <figure className="tppp" aria-labelledby="tppp-title">
      <style>{`
        .tppp {
          margin: 2rem 0;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(92, 255, 104, 0.1), rgba(5, 202, 255, 0.08)),
            var(--bg-card);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }

        .tppp * { box-sizing: border-box; }

        .tppp__inner { padding: clamp(1rem, 3vw, 1.5rem); }

        .tppp__eyebrow {
          margin: 0 0 0.35rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .tppp__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.2;
        }

        .tppp__subtitle {
          max-width: 46rem;
          margin: 0.55rem 0 1.35rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .tppp__stage {
          display: grid;
          grid-template-columns: 1fr 1fr;
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

        .tppp__mode {
          min-width: 0;
          padding: 0.8rem;
          border: 1px solid color-mix(in srgb, var(--c) 42%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, var(--c) 6%, var(--bg-card));
        }

        .tppp__mode-head {
          margin-bottom: 0.6rem;
          color: var(--text-primary);
          font-size: 0.85rem;
          font-weight: 950;
        }

        .tppp__mode-head em {
          display: block;
          margin-top: 0.15rem;
          color: var(--text-muted);
          font-size: 0.65rem;
          font-style: normal;
          font-weight: 800;
          line-height: 1.35;
        }

        .tppp__gpus {
          display: grid;
          gap: 0.4rem;
        }

        .tppp__gpu {
          position: relative;
          padding: 0.5rem 0.55rem;
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          background: var(--bg-card);
          color: var(--text-primary);
          font-size: 0.7rem;
          font-weight: 900;
          overflow: hidden;
        }

        .tppp__gpu::before {
          content: '';
          position: absolute;
          inset: 0;
          background: color-mix(in srgb, var(--c) 22%, transparent);
          opacity: 0;
          animation: var(--anim) 4s ease-in-out infinite;
          animation-delay: var(--delay);
        }

        .tppp__gpu span {
          position: relative;
          display: block;
          margin-top: 0.12rem;
          color: var(--text-muted);
          font-size: 0.62rem;
          font-weight: 800;
        }

        .tppp__gpu strong { position: relative; }

        .tppp__link {
          position: relative;
          height: 1.5rem;
          margin: 0.15rem 0;
          border-radius: 5px;
          border: 1px dashed var(--border-medium);
          background: var(--bg-card);
          overflow: hidden;
        }

        .tppp__link-txt {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 0.6rem;
          font-weight: 850;
          letter-spacing: 0.02em;
        }

        .tppp__spark {
          position: absolute;
          top: 50%;
          left: 0;
          width: 26%;
          height: 2px;
          transform: translateY(-50%);
          background: linear-gradient(90deg, transparent, var(--c), transparent);
          animation: var(--spark) 4s linear infinite;
        }

        .tppp__cost {
          margin-top: 0.6rem;
          padding: 0.45rem 0.5rem;
          border-radius: 6px;
          border: 1px solid color-mix(in srgb, var(--c) 30%, var(--border-subtle));
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 0.65rem;
          font-weight: 850;
          line-height: 1.4;
        }

        .tppp__cost b { color: color-mix(in srgb, var(--c) 80%, var(--text-primary)); }

        .tppp__table {
          margin-top: 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          overflow: hidden;
        }

        .tppp__tr {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr;
          gap: 0.5rem;
          padding: 0.5rem 0.7rem;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-card);
          font-size: 0.72rem;
        }

        .tppp__tr:last-child { border-bottom: 0; }

        .tppp__tr[data-head='yes'] {
          background: color-mix(in srgb, var(--bg-elevated) 75%, transparent);
          color: var(--text-muted);
          font-size: 0.62rem;
          font-weight: 900;
          text-transform: uppercase;
        }

        .tppp__m { color: var(--text-secondary); font-weight: 800; }

        .tppp__v {
          color: var(--text-primary);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-weight: 800;
        }

        .tppp__v[data-win='yes'] {
          color: color-mix(in srgb, var(--accent-secondary) 88%, var(--text-primary));
          font-weight: 950;
        }

        .tppp figcaption {
          padding: 0 1.5rem 1.15rem;
          color: var(--text-muted);
          font-size: 0.78rem;
          line-height: 1.45;
        }

        @keyframes tpppBoth {
          0%, 100% { opacity: 0.15; }
          40%, 60% { opacity: 1; }
        }

        @keyframes tpppRelay {
          0%, 45% { opacity: 1; }
          55%, 100% { opacity: 0.1; }
        }

        @keyframes tpppRelayLate {
          0%, 45% { opacity: 0.1; }
          55%, 100% { opacity: 1; }
        }

        @keyframes tpppSparkFast {
          0% { left: -26%; }
          100% { left: 100%; }
        }

        @keyframes tpppSparkSlow {
          0%, 44% { left: -26%; opacity: 0; }
          50% { opacity: 1; }
          62% { left: 100%; opacity: 1; }
          64%, 100% { left: 100%; opacity: 0; }
        }

        @media (max-width: 720px) {
          .tppp__stage { grid-template-columns: 1fr; }
          .tppp__tr { grid-template-columns: 1.4fr 1fr 1fr; }
        }

        @media (prefers-reduced-motion: reduce) {
          .tppp__gpu::before,
          .tppp__spark {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            opacity: 1;
          }
        }
      `}</style>
      <div className="tppp__inner">
        <p className="tppp__eyebrow">TP versus PP animation</p>
        <h3 className="tppp__title" id="tppp-title">
          Two ways to cut the same model, and what each one costs
        </h3>
        <p className="tppp__subtitle">
          Both modes solve the fitting problem, so the choice is purely about speed. Tensor
          parallelism keeps both cards busy on every token and pays 128 all-reduces for it. Pipeline
          parallelism barely communicates at all, but runs like a relay race.
        </p>

        <div className="tppp__stage" aria-label="Tensor parallelism compared with pipeline parallelism">
          <div className="tppp__mode" style={{ '--c': '#0098cc' }}>
            <p className="tppp__mode-head">
              Tensor parallelism, TP=2
              <em>every layer is split, both cards work on every token</em>
            </p>
            <div className="tppp__gpus">
              <div
                className="tppp__gpu"
                style={{ '--c': '#0098cc', '--anim': 'tpppBoth', '--delay': '0s' }}
              >
                <strong>GPU 0</strong>
                <span>all 64 layers, heads 0-31, 30.59 GiB</span>
              </div>
              <div className="tppp__link">
                <div
                  className="tppp__spark"
                  aria-hidden="true"
                  style={{ '--c': '#0098cc', '--spark': 'tpppSparkFast' }}
                />
                <div className="tppp__link-txt">all-reduce x128 per token</div>
              </div>
              <div
                className="tppp__gpu"
                style={{ '--c': '#0098cc', '--anim': 'tpppBoth', '--delay': '0s' }}
              >
                <strong>GPU 1</strong>
                <span>all 64 layers, heads 32-63, 30.59 GiB</span>
              </div>
            </div>
            <p className="tppp__cost">
              <b>Wins decode.</b> Both cards contribute memory bandwidth to the same token, so
              concurrency 1 is 73% faster. Pays for it in prefill, where each all-reduce carries 10 MB
              instead of 10 KB.
            </p>
          </div>

          <div className="tppp__mode" style={{ '--c': '#2bb534' }}>
            <p className="tppp__mode-head">
              Pipeline parallelism, PP=2
              <em>the stack is cut by layer, one activation handoff</em>
            </p>
            <div className="tppp__gpus">
              <div
                className="tppp__gpu"
                style={{ '--c': '#2bb534', '--anim': 'tpppRelay', '--delay': '0s' }}
              >
                <strong>GPU 0</strong>
                <span>layers 0-31, all 8 kv heads, 30.52 GiB</span>
              </div>
              <div className="tppp__link">
                <div
                  className="tppp__spark"
                  aria-hidden="true"
                  style={{ '--c': '#2bb534', '--spark': 'tpppSparkSlow' }}
                />
                <div className="tppp__link-txt">one send per token</div>
              </div>
              <div
                className="tppp__gpu"
                style={{ '--c': '#2bb534', '--anim': 'tpppRelayLate', '--delay': '0s' }}
              >
                <strong>GPU 1</strong>
                <span>layers 32-63, all 8 kv heads, 30.52 GiB</span>
              </div>
            </div>
            <p className="tppp__cost">
              <b>Wins prefill.</b> Almost no communication, so time to first token is 37% better at
              concurrency 32. But with one request in flight a card is always idle, and the extra
              pipeline buffers cost you 19% of the KV cache.
            </p>
          </div>
        </div>

        <div className="tppp__table" role="table" aria-label="Measured TP versus PP results">
          <div className="tppp__tr" data-head="yes" role="row">
            <div role="columnheader">Measured</div>
            <div role="columnheader">TP=2</div>
            <div role="columnheader">PP=2</div>
          </div>
          {results.map((row) => (
            <div className="tppp__tr" key={row.metric} role="row">
              <div className="tppp__m" role="cell">{row.metric}</div>
              <div className="tppp__v" data-win={row.win === 'tp' ? 'yes' : 'no'} role="cell">
                {row.tp}
              </div>
              <div className="tppp__v" data-win={row.win === 'pp' ? 'yes' : 'no'} role="cell">
                {row.pp}
              </div>
            </div>
          ))}
        </div>
      </div>
      <figcaption>
        Measured with vllm bench serve, 1024 input and 256 output tokens, on two PCIe-connected cards
        with no NVLink. The concurrency 32 throughput gap is 1.9%, which is close enough to noise that
        I would call it a tie rather than a win.
      </figcaption>
    </figure>
  );
}
