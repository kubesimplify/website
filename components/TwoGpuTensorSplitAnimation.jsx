const stages = [
  { key: 'broadcast', label: 'X arrives', detail: 'same full copy on both cards' },
  { key: 'column', label: 'Column-parallel', detail: 'each card owns half the columns of A' },
  { key: 'local', label: 'Activation stays local', detail: 'SiLU is elementwise, no comms' },
  { key: 'row', label: 'Row-parallel', detail: 'each card gets a partial sum' },
  { key: 'reduce', label: 'All-reduce', detail: 'partial sums added, both cards get Z' },
];

export default function TwoGpuTensorSplitAnimation() {
  return (
    <figure className="tp-split" aria-labelledby="tp-split-title">
      <style>{`
        .tp-split {
          margin: 2rem 0;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(92, 255, 104, 0.1), rgba(5, 202, 255, 0.08)),
            var(--bg-card);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }

        .tp-split * { box-sizing: border-box; }

        .tp-split__inner { padding: clamp(1rem, 3vw, 1.5rem); }

        .tp-split__eyebrow {
          margin: 0 0 0.35rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .tp-split__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.2;
        }

        .tp-split__subtitle {
          max-width: 46rem;
          margin: 0.55rem 0 1.35rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .tp-split__stage {
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

        .tp-split__input {
          position: relative;
          padding: 0.6rem 0.8rem;
          border: 1px dashed color-mix(in srgb, var(--accent) 50%, var(--border-medium));
          border-radius: 8px;
          background: color-mix(in srgb, var(--accent) 8%, var(--bg-card));
          color: var(--text-primary);
          font-size: 0.8rem;
          font-weight: 900;
          text-align: center;
        }

        .tp-split__input em {
          display: block;
          margin-top: 0.15rem;
          color: var(--text-muted);
          font-size: 0.66rem;
          font-style: normal;
          font-weight: 800;
        }

        .tp-split__cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }

        .tp-split__card {
          min-width: 0;
          padding: 0.75rem;
          border: 1px solid color-mix(in srgb, var(--c) 45%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, var(--c) 7%, var(--bg-card));
        }

        .tp-split__card-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.4rem;
          margin-bottom: 0.6rem;
          color: var(--text-primary);
          font-size: 0.8rem;
          font-weight: 950;
        }

        .tp-split__card-head span {
          color: color-mix(in srgb, var(--c) 78%, var(--text-primary));
          font-size: 0.64rem;
          font-weight: 850;
          text-transform: uppercase;
        }

        .tp-split__matrix {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 2px;
          height: 3.1rem;
          margin-bottom: 0.45rem;
        }

        .tp-split__cell {
          border-radius: 2px;
          background: color-mix(in srgb, var(--c) 16%, var(--bg-card));
          animation: tpSplitOwn 10s ease-in-out infinite;
        }

        .tp-split__cell[data-owned='no'] {
          background: repeating-linear-gradient(
            45deg,
            var(--border-subtle) 0 3px,
            transparent 3px 6px
          );
          animation: none;
          opacity: 0.5;
        }

        .tp-split__row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.32rem 0.45rem;
          border-radius: 5px;
          color: var(--text-secondary);
          font-size: 0.68rem;
          font-weight: 800;
          line-height: 1.3;
        }

        .tp-split__row strong {
          color: var(--text-primary);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.66rem;
        }

        .tp-split__partial {
          margin-top: 0.4rem;
          padding: 0.45rem 0.5rem;
          border: 1px solid color-mix(in srgb, var(--c) 38%, var(--border-subtle));
          border-radius: 6px;
          background: var(--bg-card);
          color: var(--text-primary);
          font-size: 0.7rem;
          font-weight: 900;
          text-align: center;
        }

        .tp-split__wire {
          position: relative;
          height: 2.6rem;
          border-radius: 8px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-card);
          overflow: hidden;
        }

        .tp-split__wire-label {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          font-size: 0.72rem;
          font-weight: 950;
          letter-spacing: 0.02em;
        }

        .tp-split__wire-label em {
          margin-left: 0.4rem;
          color: var(--text-muted);
          font-size: 0.64rem;
          font-style: normal;
          font-weight: 800;
        }

        .tp-split__pulse {
          position: absolute;
          top: 50%;
          left: 0;
          width: 34%;
          height: 2px;
          transform: translateY(-50%);
          background: linear-gradient(
            90deg,
            transparent,
            var(--accent-secondary),
            var(--accent),
            transparent
          );
          animation: tpSplitPulse 10s ease-in-out infinite;
        }

        .tp-split__out {
          padding: 0.6rem 0.8rem;
          border: 1px solid color-mix(in srgb, var(--accent-secondary) 45%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, var(--accent-secondary) 9%, var(--bg-card));
          color: var(--text-primary);
          font-size: 0.8rem;
          font-weight: 900;
          text-align: center;
        }

        .tp-split__out em {
          display: block;
          margin-top: 0.15rem;
          color: var(--text-muted);
          font-size: 0.66rem;
          font-style: normal;
          font-weight: 800;
        }

        .tp-split__steps {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .tp-split__step {
          min-width: 0;
          padding: 0.6rem 0.55rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: var(--bg-card);
          animation: tpSplitStep 10s ease-in-out infinite;
          animation-delay: var(--delay);
        }

        .tp-split__step-n {
          display: block;
          color: var(--accent);
          font-size: 0.62rem;
          font-weight: 900;
        }

        .tp-split__step-label {
          display: block;
          margin-top: 0.15rem;
          color: var(--text-primary);
          font-size: 0.76rem;
          font-weight: 950;
          line-height: 1.2;
        }

        .tp-split__step-detail {
          display: block;
          margin-top: 0.25rem;
          color: var(--text-muted);
          font-size: 0.65rem;
          line-height: 1.35;
        }

        .tp-split figcaption {
          padding: 0 1.5rem 1.15rem;
          color: var(--text-muted);
          font-size: 0.78rem;
          line-height: 1.45;
        }

        @keyframes tpSplitOwn {
          0%, 14% { opacity: 0.35; }
          24%, 62% { opacity: 1; }
          72%, 100% { opacity: 0.55; }
        }

        @keyframes tpSplitPulse {
          0%, 62% { left: -34%; opacity: 0; }
          70% { opacity: 1; }
          86% { left: 100%; opacity: 1; }
          92%, 100% { left: 100%; opacity: 0; }
        }

        @keyframes tpSplitStep {
          0%, 100% { border-color: var(--border-subtle); background: var(--bg-card); }
          8%, 16% {
            border-color: color-mix(in srgb, var(--accent) 55%, var(--border-subtle));
            background: color-mix(in srgb, var(--accent) 9%, var(--bg-card));
          }
        }

        @media (max-width: 640px) {
          .tp-split__steps { grid-template-columns: 1fr 1fr; }
          .tp-split__cards { grid-template-columns: 1fr; }
        }

        @media (prefers-reduced-motion: reduce) {
          .tp-split__cell,
          .tp-split__pulse,
          .tp-split__step {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
          }
          .tp-split__cell { opacity: 1; }
          .tp-split__pulse { opacity: 1; left: 33%; }
        }
      `}</style>
      <div className="tp-split__inner">
        <p className="tp-split__eyebrow">Tensor parallelism animation</p>
        <h3 className="tp-split__title" id="tp-split-title">
          One MLP block, split down the middle across two cards
        </h3>
        <p className="tp-split__subtitle">
          The weights are split and the activations are not. Each card owns half the columns of the
          first matrix and half the rows of the second, so all the maths stays local until the very
          end, where one all-reduce adds the two partial sums together.
        </p>

        <div className="tp-split__stage" aria-label="Column-parallel then row-parallel split with one all-reduce">
          <div className="tp-split__input">
            input X, hidden_size 5120
            <em>replicated, both cards hold the same full copy</em>
          </div>

          <div className="tp-split__cards">
            {[0, 1].map((gpu) => (
              <div
                className="tp-split__card"
                key={gpu}
                style={{ '--c': gpu === 0 ? '#0098cc' : '#2bb534' }}
              >
                <div className="tp-split__card-head">
                  GPU {gpu}
                  <span>{gpu === 0 ? 'heads 0-31' : 'heads 32-63'}</span>
                </div>

                <div className="tp-split__matrix" aria-hidden="true">
                  {Array.from({ length: 16 }, (_, cell) => {
                    const inFirstHalf = cell % 8 < 4;
                    const owned = gpu === 0 ? inFirstHalf : !inFirstHalf;
                    return (
                      <div
                        className="tp-split__cell"
                        key={cell}
                        data-owned={owned ? 'yes' : 'no'}
                        style={{ '--c': gpu === 0 ? '#0098cc' : '#2bb534' }}
                      />
                    );
                  })}
                </div>

                <div className="tp-split__row">
                  <strong>{gpu === 0 ? 'gate/up[:, :12800]' : 'gate/up[:, 12800:]'}</strong>
                </div>
                <div className="tp-split__row">SiLU applied locally, no comms</div>
                <div className="tp-split__row">
                  <strong>{gpu === 0 ? 'down[:12800, :]' : 'down[12800:, :]'}</strong>
                </div>

                <div className="tp-split__partial">partial sum Z{gpu}</div>
              </div>
            ))}
          </div>

          <div className="tp-split__wire">
            <div className="tp-split__pulse" aria-hidden="true" />
            <div className="tp-split__wire-label">
              all-reduce over PCIe
              <em>10 KB at batch 1, x2 per layer, x64 layers = 128 per token</em>
            </div>
          </div>

          <div className="tp-split__out">
            full output Z, identical on both cards
            <em>next layer starts from here</em>
          </div>
        </div>

        <div className="tp-split__steps">
          {stages.map((stage, index) => (
            <div
              className="tp-split__step"
              key={stage.key}
              style={{ '--delay': `${index * 2}s` }}
            >
              <span className="tp-split__step-n">Step {index + 1}</span>
              <span className="tp-split__step-label">{stage.label}</span>
              <span className="tp-split__step-detail">{stage.detail}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption>
        Shapes are Qwen3-32B: hidden_size 5120, intermediate_size 25600 halved to 12800 per card, 64
        attention heads halved to 32. Attention splits the same way, so a full layer costs two
        all-reduces, not one.
      </figcaption>
    </figure>
  );
}
