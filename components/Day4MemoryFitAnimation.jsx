export default function Day4MemoryFitAnimation() {
  const formats = [
    { name: 'BF16', size: '140 GB', width: '109%', note: 'too large before cache' },
    { name: 'FP8', size: '70 GB', width: '55%', note: 'fits, more room' },
    { name: 'NVFP4', size: '~40 GB', width: '31%', note: 'fits with breathing room' },
  ];

  return (
    <figure className="day4-memory-fit" aria-labelledby="day4-memory-fit-title">
      <style>{`
        .day4-memory-fit {
          margin: 2rem 0;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(118, 185, 0, 0.1), rgba(5, 202, 255, 0.08)),
            var(--bg-card);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }

        .day4-memory-fit * {
          box-sizing: border-box;
        }

        .day4-memory-fit__inner {
          padding: clamp(1rem, 3vw, 1.5rem);
        }

        .day4-memory-fit__eyebrow {
          margin: 0 0 0.35rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .day4-memory-fit__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.2;
        }

        .day4-memory-fit__subtitle {
          max-width: 46rem;
          margin: 0.55rem 0 1.35rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .day4-memory-fit__stage {
          display: grid;
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

        .day4-memory-fit__spark {
          position: relative;
          min-height: 9rem;
          padding: 0.9rem;
          border: 1px solid color-mix(in srgb, var(--accent) 42%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, var(--accent) 7%, var(--bg-card));
          overflow: hidden;
        }

        .day4-memory-fit__spark-head {
          display: flex;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
          color: var(--text-primary);
          font-size: 0.85rem;
          font-weight: 950;
          line-height: 1.25;
        }

        .day4-memory-fit__pool {
          position: relative;
          height: 4rem;
          border: 1px solid var(--border-medium);
          border-radius: 8px;
          background: var(--bg-card);
          overflow: hidden;
        }

        .day4-memory-fit__reserve {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 22%;
          border-left: 1px dashed var(--border-medium);
          background: color-mix(in srgb, #f59e0b 12%, transparent);
        }

        .day4-memory-fit__reserve span {
          position: absolute;
          right: 0.4rem;
          bottom: 0.35rem;
          color: var(--text-muted);
          font-size: 0.62rem;
          font-weight: 850;
          text-transform: uppercase;
        }

        .day4-memory-fit__bar {
          position: absolute;
          top: 0.55rem;
          left: 0.55rem;
          height: 2.9rem;
          width: var(--w);
          min-width: 3.4rem;
          border: 1px solid color-mix(in srgb, var(--c) 64%, var(--border-subtle));
          border-radius: 7px;
          background: color-mix(in srgb, var(--c) 18%, var(--bg-card));
          color: var(--text-primary);
          transform-origin: left;
          animation: day4MemorySwap 9s ease-in-out infinite;
          animation-delay: var(--delay);
          opacity: 0;
        }

        .day4-memory-fit__bar:nth-of-type(1) {
          box-shadow: 0 0 0 999px rgba(239, 68, 68, 0.04);
        }

        .day4-memory-fit__bar strong,
        .day4-memory-fit__bar span {
          display: block;
          padding-left: 0.55rem;
          white-space: nowrap;
        }

        .day4-memory-fit__bar strong {
          padding-top: 0.42rem;
          font-size: 0.82rem;
          font-weight: 950;
        }

        .day4-memory-fit__bar span {
          color: var(--text-muted);
          font-size: 0.66rem;
          font-weight: 800;
        }

        .day4-memory-fit__formats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.55rem;
        }

        .day4-memory-fit__format {
          min-width: 0;
          padding: 0.75rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: var(--bg-card);
        }

        .day4-memory-fit__format-name {
          display: block;
          color: var(--text-primary);
          font-size: 0.95rem;
          font-weight: 950;
          line-height: 1.2;
        }

        .day4-memory-fit__format-size {
          display: block;
          margin-top: 0.18rem;
          color: var(--accent);
          font-size: 0.82rem;
          font-weight: 900;
        }

        .day4-memory-fit__format-note {
          display: block;
          margin-top: 0.35rem;
          color: var(--text-muted);
          font-size: 0.68rem;
          line-height: 1.35;
        }

        .day4-memory-fit figcaption {
          padding: 0 1.5rem 1.15rem;
          color: var(--text-muted);
          font-size: 0.78rem;
          line-height: 1.45;
        }

        @keyframes day4MemorySwap {
          0%, 8% { opacity: 0; transform: scaleX(0.88) translateY(4px); }
          12%, 28% { opacity: 1; transform: scaleX(1) translateY(0); }
          34%, 100% { opacity: 0; transform: scaleX(0.94) translateY(-4px); }
        }

        @media (max-width: 640px) {
          .day4-memory-fit__formats {
            grid-template-columns: 1fr;
          }

          .day4-memory-fit__spark-head {
            flex-direction: column;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .day4-memory-fit__bar {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
          }

          .day4-memory-fit__bar:last-of-type {
            opacity: 1;
          }
        }
      `}</style>
      <div className="day4-memory-fit__inner">
        <p className="day4-memory-fit__eyebrow">Memory fit animation</p>
        <h3 className="day4-memory-fit__title" id="day4-memory-fit-title">
          Same 70B model, different number formats
        </h3>
        <p className="day4-memory-fit__subtitle">
          Quantization is mostly a memory story: fewer bytes per weight means the model is smaller, leaves room for KV cache, and reads less data for every generated token.
        </p>

        <div className="day4-memory-fit__stage" aria-label="70B model memory fit comparison">
          <div className="day4-memory-fit__spark">
            <div className="day4-memory-fit__spark-head">
              <span>DGX Spark unified memory pool</span>
              <span>128 GB total</span>
            </div>
            <div className="day4-memory-fit__pool">
              {formats.map((format, index) => (
                <div
                  className="day4-memory-fit__bar"
                  key={format.name}
                  style={{
                    '--w': format.width,
                    '--delay': `${index * 3}s`,
                    '--c': index === 0 ? '#ef4444' : index === 1 ? '#3b82f6' : '#76b900',
                  }}
                >
                  <strong>{format.name} weights</strong>
                  <span>{format.size}</span>
                </div>
              ))}
              <div className="day4-memory-fit__reserve">
                <span>cache + OS</span>
              </div>
            </div>
          </div>

          <div className="day4-memory-fit__formats">
            {formats.map((format) => (
              <div className="day4-memory-fit__format" key={format.name}>
                <span className="day4-memory-fit__format-name">{format.name}</span>
                <span className="day4-memory-fit__format-size">{format.size}</span>
                <span className="day4-memory-fit__format-note">{format.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <figcaption>
        The NVFP4 number is practical storage for weights after scale overhead, not the raw 35 GB payload only. Real serving also needs KV cache and runtime memory.
      </figcaption>
    </figure>
  );
}
