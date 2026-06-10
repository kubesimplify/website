export default function Day4MicroscalingAnimation() {
  const values = ['0.02', '0.03', '0.04', '0.05', '0.07', '0.08', '0.09', '1.40'];

  return (
    <figure className="day4-microscale" aria-labelledby="day4-microscale-title">
      <style>{`
        .day4-microscale {
          margin: 2rem 0;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(118, 185, 0, 0.08)),
            var(--bg-card);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }

        .day4-microscale * {
          box-sizing: border-box;
        }

        .day4-microscale__inner {
          padding: clamp(1rem, 3vw, 1.5rem);
        }

        .day4-microscale__eyebrow {
          margin: 0 0 0.35rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .day4-microscale__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.2;
        }

        .day4-microscale__subtitle {
          max-width: 46rem;
          margin: 0.55rem 0 1.35rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .day4-microscale__stage {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
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

        .day4-microscale__panel {
          min-width: 0;
          border: 1px solid var(--border-medium);
          border-radius: 8px;
          background: var(--bg-card);
          overflow: hidden;
          box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
        }

        .dark .day4-microscale__panel {
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.25);
        }

        .day4-microscale__panel::before {
          content: '';
          display: block;
          height: 4px;
          background: var(--stripe);
        }

        .day4-microscale__body {
          display: grid;
          gap: 0.8rem;
          padding: 0.9rem;
        }

        .day4-microscale__label {
          margin: 0;
          color: var(--text-primary);
          font-size: 0.9rem;
          font-weight: 950;
          line-height: 1.25;
        }

        .day4-microscale__note {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.76rem;
          line-height: 1.45;
        }

        .day4-microscale__weights {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.38rem;
        }

        .day4-microscale__cell {
          position: relative;
          display: grid;
          place-items: end center;
          min-height: 3.4rem;
          padding: 0.35rem 0.2rem;
          border: 1px solid color-mix(in srgb, var(--cell) 45%, var(--border-subtle));
          border-radius: 7px;
          background: color-mix(in srgb, var(--cell) 10%, var(--bg-card));
          overflow: hidden;
        }

        .day4-microscale__cell::before {
          content: '';
          position: absolute;
          left: 0.25rem;
          right: 0.25rem;
          bottom: 0.25rem;
          height: var(--h);
          max-height: 2.6rem;
          border-radius: 5px;
          background: color-mix(in srgb, var(--cell) 58%, transparent);
          animation: day4ScaleCell 4.8s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.08s);
        }

        .day4-microscale__cell span {
          position: relative;
          z-index: 1;
          color: var(--text-primary);
          font-size: 0.64rem;
          font-weight: 850;
        }

        .day4-microscale__scale {
          display: grid;
          grid-template-columns: 6.8rem minmax(0, 1fr);
          gap: 0.65rem;
          align-items: center;
          padding: 0.65rem;
          border: 1px solid color-mix(in srgb, var(--scale) 45%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, var(--scale) 8%, var(--bg-card));
        }

        .day4-microscale__scale strong {
          color: var(--text-primary);
          font-size: 0.74rem;
          font-weight: 950;
          line-height: 1.25;
        }

        .day4-microscale__scale-line {
          position: relative;
          height: 0.55rem;
          border-radius: 999px;
          background: color-mix(in srgb, var(--scale) 15%, var(--bg-card));
          overflow: hidden;
        }

        .day4-microscale__scale-line::before {
          content: '';
          position: absolute;
          inset: 0;
          width: var(--line);
          border-radius: inherit;
          background: linear-gradient(90deg, transparent, var(--scale), transparent);
          animation: day4ScaleSweep 2.6s linear infinite;
        }

        .day4-microscale__formula {
          padding: 0.7rem;
          border: 1px solid color-mix(in srgb, var(--accent) 42%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, var(--accent) 7%, var(--bg-card));
          color: var(--text-primary);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.78rem;
          line-height: 1.45;
          overflow-wrap: anywhere;
        }

        .day4-microscale figcaption {
          padding: 0 1.5rem 1.15rem;
          color: var(--text-muted);
          font-size: 0.78rem;
          line-height: 1.45;
        }

        @keyframes day4ScaleCell {
          0%, 100% { transform: scaleY(0.88); opacity: 0.72; }
          50% { transform: scaleY(1); opacity: 1; }
        }

        @keyframes day4ScaleSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }

        @media (max-width: 760px) {
          .day4-microscale__stage {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .day4-microscale__cell::before,
          .day4-microscale__scale-line::before {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
      <div className="day4-microscale__inner">
        <p className="day4-microscale__eyebrow">Microscaling animation</p>
        <h3 className="day4-microscale__title" id="day4-microscale-title">
          Why one outlier can hurt plain 4-bit
        </h3>
        <p className="day4-microscale__subtitle">
          A shared scale is like choosing the ruler for a group of numbers. If the group is too large, one big value can make the small values hard to measure.
        </p>

        <div className="day4-microscale__stage">
          <div className="day4-microscale__panel" style={{ '--stripe': 'linear-gradient(90deg, #ef4444, #f59e0b)' }}>
            <div className="day4-microscale__body">
              <p className="day4-microscale__label">Plain INT4-style block</p>
              <p className="day4-microscale__note">
                A wider block can be forced to pick one large scale because of the outlier. The tiny values then round together.
              </p>
              <div className="day4-microscale__weights" aria-label="Plain block with one outlier">
                {values.map((value, index) => (
                  <div
                    className="day4-microscale__cell"
                    key={`plain-${value}-${index}`}
                    style={{
                      '--i': index,
                      '--h': index === values.length - 1 ? '90%' : `${14 + index * 3}%`,
                      '--cell': index === values.length - 1 ? '#ef4444' : '#f59e0b',
                    }}
                  >
                    <span>{value}</span>
                  </div>
                ))}
              </div>
              <div className="day4-microscale__scale" style={{ '--scale': '#ef4444', '--line': '72%' }}>
                <strong>one coarse scale</strong>
                <div className="day4-microscale__scale-line" />
              </div>
            </div>
          </div>

          <div className="day4-microscale__panel" style={{ '--stripe': 'linear-gradient(90deg, #8b5cf6, #76b900)' }}>
            <div className="day4-microscale__body">
              <p className="day4-microscale__label">NVFP4 micro-block</p>
              <p className="day4-microscale__note">
                NVFP4 uses smaller 16-value groups, an FP8 E4M3 scale per group, and a global FP32 tensor scale.
              </p>
              <div className="day4-microscale__weights" aria-label="NVFP4 local block values">
                {values.map((value, index) => (
                  <div
                    className="day4-microscale__cell"
                    key={`nvfp4-${value}-${index}`}
                    style={{
                      '--i': index,
                      '--h': index === values.length - 1 ? '88%' : `${28 + index * 5}%`,
                      '--cell': index === values.length - 1 ? '#8b5cf6' : '#76b900',
                    }}
                  >
                    <span>{value}</span>
                  </div>
                ))}
              </div>
              <div className="day4-microscale__scale" style={{ '--scale': '#76b900', '--line': '38%' }}>
                <strong>local FP8 scale</strong>
                <div className="day4-microscale__scale-line" />
              </div>
              <div className="day4-microscale__formula">real value = 4-bit code x FP8 block scale x FP32 tensor scale</div>
            </div>
          </div>
        </div>
      </div>
      <figcaption>
        Microscaling does not make 4-bit magic. It reduces the error by choosing smaller local rulers, so fewer important values get rounded away.
      </figcaption>
    </figure>
  );
}
