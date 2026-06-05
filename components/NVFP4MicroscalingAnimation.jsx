export default function NVFP4MicroscalingAnimation() {
  const values = [
    '-6', '-4', '-3', '-2', '-1.5', '-1', '-0.5', '0',
    '0.5', '1', '1.5', '2', '3', '4', '5', '6',
  ];

  return (
    <figure className="nvfp4-animation" aria-labelledby="nvfp4-animation-title">
      <style>{`
        .nvfp4-animation {
          margin: 2rem 0;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(118, 185, 0, 0.08)),
            var(--bg-card);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }

        .nvfp4-animation * {
          box-sizing: border-box;
        }

        .nvfp4-animation__inner {
          padding: clamp(1rem, 3vw, 1.5rem);
        }

        .nvfp4-animation__eyebrow {
          margin: 0 0 0.35rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .nvfp4-animation__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.2;
        }

        .nvfp4-animation__subtitle {
          max-width: 46rem;
          margin: 0.55rem 0 1.35rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .nvfp4-animation__stage {
          display: grid;
          grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.25fr);
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px),
            color-mix(in srgb, var(--bg-elevated) 86%, transparent);
          background-size: 42px 42px;
        }

        .nvfp4-animation__panel {
          min-width: 0;
          border: 1px solid var(--border-medium);
          border-radius: 8px;
          background: var(--bg-card);
          overflow: hidden;
          box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
        }

        .dark .nvfp4-animation__panel {
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.25);
        }

        .nvfp4-animation__panel::before {
          content: '';
          display: block;
          height: 4px;
          background: linear-gradient(90deg, #8b5cf6, var(--accent));
        }

        .nvfp4-animation__panel-body {
          padding: 0.9rem;
        }

        .nvfp4-animation__label {
          margin: 0 0 0.75rem;
          color: var(--text-muted);
          font-size: 0.68rem;
          font-weight: 850;
          text-transform: uppercase;
        }

        .nvfp4-animation__bars {
          display: grid;
          gap: 0.8rem;
        }

        .nvfp4-animation__bar-row {
          display: grid;
          grid-template-columns: 4.8rem minmax(0, 1fr) 3.2rem;
          gap: 0.5rem;
          align-items: center;
        }

        .nvfp4-animation__bar-name,
        .nvfp4-animation__bar-value {
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 850;
        }

        .nvfp4-animation__bar-value {
          text-align: right;
        }

        .nvfp4-animation__bar-track {
          position: relative;
          height: 1.25rem;
          border-radius: 999px;
          background: color-mix(in srgb, var(--text-muted) 12%, var(--bg-card));
          overflow: hidden;
        }

        .nvfp4-animation__bar-fill {
          position: absolute;
          inset: 0 auto 0 0;
          width: var(--w);
          border-radius: inherit;
          background: linear-gradient(90deg, #8b5cf6, var(--accent));
          transform-origin: left;
          animation: nvfp4Bar 5.6s ease-in-out infinite;
        }

        .nvfp4-animation__block-wrap {
          display: grid;
          gap: 0.75rem;
        }

        .nvfp4-animation__block {
          display: grid;
          grid-template-columns: repeat(8, minmax(0, 1fr));
          gap: 0.34rem;
          min-width: 0;
        }

        .nvfp4-animation__cell {
          position: relative;
          display: grid;
          place-items: center;
          min-height: 2.45rem;
          border: 1px solid color-mix(in srgb, #8b5cf6 40%, var(--border-subtle));
          border-radius: 7px;
          background: color-mix(in srgb, #8b5cf6 8%, var(--bg-card));
          color: var(--text-primary);
          font-size: 0.68rem;
          font-weight: 850;
          overflow: hidden;
          animation: nvfp4Cell 5.6s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.055s);
        }

        .nvfp4-animation__cell::before {
          content: '4b';
          position: absolute;
          top: 0.18rem;
          left: 0.22rem;
          color: var(--text-muted);
          font-size: 0.52rem;
          font-weight: 850;
        }

        .nvfp4-animation__scale {
          display: grid;
          grid-template-columns: 7.8rem minmax(0, 1fr);
          gap: 0.6rem;
          align-items: center;
          padding: 0.7rem;
          border: 1px solid color-mix(in srgb, var(--accent) 42%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, var(--accent) 8%, var(--bg-card));
        }

        .nvfp4-animation__scale-label {
          color: var(--text-primary);
          font-size: 0.8rem;
          font-weight: 950;
        }

        .nvfp4-animation__scale-line {
          position: relative;
          height: 0.52rem;
          border-radius: 999px;
          background: color-mix(in srgb, var(--accent) 18%, var(--bg-card));
          overflow: hidden;
        }

        .nvfp4-animation__scale-line::before {
          content: '';
          position: absolute;
          inset: 0;
          width: 34%;
          border-radius: inherit;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          animation: nvfp4Scale 2.4s linear infinite;
        }

        .nvfp4-animation__flow {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.55rem;
          margin-top: 0.8rem;
        }

        .nvfp4-animation__flow-step {
          min-width: 0;
          padding: 0.65rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: var(--bg-card);
        }

        .nvfp4-animation__flow-value {
          display: block;
          color: var(--text-primary);
          font-size: 0.9rem;
          font-weight: 950;
          line-height: 1.2;
        }

        .nvfp4-animation__flow-label {
          display: block;
          margin-top: 0.25rem;
          color: var(--text-muted);
          font-size: 0.66rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .nvfp4-animation figcaption {
          padding: 0 1.5rem 1.15rem;
          color: var(--text-muted);
          font-size: 0.78rem;
          line-height: 1.45;
        }

        @keyframes nvfp4Bar {
          0%, 100% { transform: scaleX(0.92); opacity: 0.75; }
          50% { transform: scaleX(1); opacity: 1; }
        }

        @keyframes nvfp4Cell {
          0%, 100% { transform: translateY(0); background: color-mix(in srgb, #8b5cf6 8%, var(--bg-card)); }
          45%, 60% { transform: translateY(-2px); background: color-mix(in srgb, var(--accent) 15%, var(--bg-card)); }
        }

        @keyframes nvfp4Scale {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }

        @media (max-width: 760px) {
          .nvfp4-animation__stage {
            grid-template-columns: 1fr;
          }

          .nvfp4-animation__block {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .nvfp4-animation__flow {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nvfp4-animation__bar-fill,
          .nvfp4-animation__cell,
          .nvfp4-animation__scale-line::before {
            animation: none;
          }
        }
      `}</style>
      <div className="nvfp4-animation__inner">
        <p className="nvfp4-animation__eyebrow">Animated quantization view</p>
        <h3 className="nvfp4-animation__title" id="nvfp4-animation-title">
          NVFP4 compresses weights in tiny local blocks
        </h3>
        <p className="nvfp4-animation__subtitle">
          Sixteen 4-bit values share one FP8 scale. That local scale is the reason FP4 can be small without behaving like a blunt integer quant.
        </p>
        <div className="nvfp4-animation__stage">
          <div className="nvfp4-animation__panel">
            <div className="nvfp4-animation__panel-body">
              <p className="nvfp4-animation__label">Bytes moved per parameter</p>
              <div className="nvfp4-animation__bars">
                <div className="nvfp4-animation__bar-row">
                  <span className="nvfp4-animation__bar-name">BF16</span>
                  <span className="nvfp4-animation__bar-track">
                    <span className="nvfp4-animation__bar-fill" style={{ '--w': '100%' }} />
                  </span>
                  <span className="nvfp4-animation__bar-value">16b</span>
                </div>
                <div className="nvfp4-animation__bar-row">
                  <span className="nvfp4-animation__bar-name">FP8</span>
                  <span className="nvfp4-animation__bar-track">
                    <span className="nvfp4-animation__bar-fill" style={{ '--w': '50%' }} />
                  </span>
                  <span className="nvfp4-animation__bar-value">8b</span>
                </div>
                <div className="nvfp4-animation__bar-row">
                  <span className="nvfp4-animation__bar-name">NVFP4</span>
                  <span className="nvfp4-animation__bar-track">
                    <span className="nvfp4-animation__bar-fill" style={{ '--w': '28%' }} />
                  </span>
                  <span className="nvfp4-animation__bar-value">4.5b</span>
                </div>
              </div>
              <div className="nvfp4-animation__flow">
                <div className="nvfp4-animation__flow-step">
                  <span className="nvfp4-animation__flow-value">4x</span>
                  <span className="nvfp4-animation__flow-label">nominal shrink</span>
                </div>
                <div className="nvfp4-animation__flow-step">
                  <span className="nvfp4-animation__flow-value">3.5x</span>
                  <span className="nvfp4-animation__flow-label">practical claim</span>
                </div>
                <div className="nvfp4-animation__flow-step">
                  <span className="nvfp4-animation__flow-value">decode</span>
                  <span className="nvfp4-animation__flow-label">fewer bytes read</span>
                </div>
              </div>
            </div>
          </div>
          <div className="nvfp4-animation__panel">
            <div className="nvfp4-animation__panel-body">
              <p className="nvfp4-animation__label">One NVFP4 micro-block</p>
              <div className="nvfp4-animation__block-wrap">
                <div className="nvfp4-animation__block" aria-label="Sixteen NVFP4 values in one block">
                  {values.map((value, index) => (
                    <span
                      className="nvfp4-animation__cell"
                      key={`${value}-${index}`}
                      style={{ '--i': index }}
                    >
                      {value}
                    </span>
                  ))}
                </div>
                <div className="nvfp4-animation__scale">
                  <span className="nvfp4-animation__scale-label">shared FP8 E4M3 scale</span>
                  <span className="nvfp4-animation__scale-line" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption>
        The Spark still has a 273 GB/s memory ceiling. NVFP4 matters because it reduces how many bytes each decode step has to pull through that ceiling.
      </figcaption>
    </figure>
  );
}
