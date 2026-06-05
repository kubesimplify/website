export default function GB10MemoryAnimation() {
  const memoryTicks = Array.from({ length: 18 });
  const lanes = [
    { label: 'tokens', delay: '0s' },
    { label: 'weights', delay: '0.8s' },
    { label: 'kv cache', delay: '1.6s' },
  ];

  return (
    <figure className="gb10-memory-animation" aria-labelledby="gb10-memory-title">
      <style>{`
        .gb10-memory-animation {
          margin: 2rem 0;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(118, 185, 0, 0.1), rgba(5, 202, 255, 0.08)),
            var(--bg-card);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }

        .gb10-memory-animation * {
          box-sizing: border-box;
        }

        .gb10-memory-animation__inner {
          padding: clamp(1rem, 3vw, 1.5rem);
        }

        .gb10-memory-animation__eyebrow {
          margin: 0 0 0.35rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .gb10-memory-animation__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.2;
        }

        .gb10-memory-animation__subtitle {
          max-width: 46rem;
          margin: 0.55rem 0 1.35rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .gb10-memory-animation__stage {
          position: relative;
          display: grid;
          grid-template-rows: minmax(10rem, auto) auto;
          gap: 1rem;
          min-height: 26rem;
          padding: 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px),
            color-mix(in srgb, var(--bg-elevated) 86%, transparent);
          background-size: 42px 42px;
          overflow: hidden;
        }

        .gb10-memory-animation__package {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: clamp(0.75rem, 2vw, 1rem);
          align-items: stretch;
          min-width: 0;
        }

        .gb10-memory-animation__die {
          position: relative;
          min-width: 0;
          min-height: 11rem;
          border: 1px solid var(--border-medium);
          border-radius: 8px;
          background: var(--bg-card);
          overflow: hidden;
          box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
        }

        .dark .gb10-memory-animation__die {
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.25);
        }

        .gb10-memory-animation__die::before {
          content: '';
          display: block;
          height: 4px;
          background: linear-gradient(90deg, var(--accent), var(--accent-secondary));
        }

        .gb10-memory-animation__die-body {
          display: grid;
          gap: 0.8rem;
          padding: 0.9rem;
        }

        .gb10-memory-animation__die-title {
          margin: 0;
          color: var(--text-primary);
          font-size: 0.98rem;
          font-weight: 950;
          line-height: 1.2;
        }

        .gb10-memory-animation__die-note {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.78rem;
          line-height: 1.45;
        }

        .gb10-memory-animation__cores,
        .gb10-memory-animation__sms {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 0.32rem;
        }

        .gb10-memory-animation__core,
        .gb10-memory-animation__sm {
          min-height: 1.4rem;
          border-radius: 5px;
          border: 1px solid color-mix(in srgb, var(--accent) 32%, var(--border-subtle));
          background: color-mix(in srgb, var(--accent) 10%, var(--bg-card));
          animation: gb10Pulse 4.8s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.07s);
        }

        .gb10-memory-animation__sm {
          border-color: color-mix(in srgb, var(--accent-secondary) 38%, var(--border-subtle));
          background: color-mix(in srgb, var(--accent-secondary) 11%, var(--bg-card));
        }

        .gb10-memory-animation__bridge {
          position: absolute;
          left: 35%;
          right: 46%;
          top: 47%;
          z-index: 2;
          height: 0.5rem;
          border: 1px solid color-mix(in srgb, #f59e0b 50%, var(--border-subtle));
          border-radius: 999px;
          background: color-mix(in srgb, #f59e0b 16%, var(--bg-card));
          overflow: hidden;
        }

        .gb10-memory-animation__bridge::before {
          content: '';
          position: absolute;
          inset: 0;
          width: 45%;
          border-radius: inherit;
          background: linear-gradient(90deg, transparent, #f59e0b, transparent);
          animation: gb10Bridge 2.3s linear infinite;
        }

        .gb10-memory-animation__memory {
          position: relative;
          display: grid;
          grid-template-columns: 9.5rem minmax(0, 1fr) 7rem;
          gap: 0.8rem;
          align-items: center;
          min-width: 0;
          min-height: 6.6rem;
          padding: 0.85rem;
          border: 1px solid color-mix(in srgb, var(--accent) 44%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, var(--accent) 7%, var(--bg-card));
          overflow: hidden;
        }

        .gb10-memory-animation__memory-label,
        .gb10-memory-animation__memory-speed {
          color: var(--text-primary);
          font-size: 0.86rem;
          font-weight: 950;
          line-height: 1.25;
        }

        .gb10-memory-animation__memory-speed {
          text-align: right;
        }

        .gb10-memory-animation__memory-grid {
          display: grid;
          grid-template-columns: repeat(9, minmax(0, 1fr));
          gap: 0.24rem;
          min-width: 0;
        }

        .gb10-memory-animation__memory-cell {
          height: 1.15rem;
          border-radius: 4px;
          border: 1px solid color-mix(in srgb, var(--accent) 26%, var(--border-subtle));
          background: color-mix(in srgb, var(--accent) 12%, var(--bg-card));
          animation: gb10Memory 5.4s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.05s);
        }

        .gb10-memory-animation__lanes {
          position: absolute;
          inset: 0.6rem 1.2rem 6.4rem;
          pointer-events: none;
        }

        .gb10-memory-animation__packet {
          position: absolute;
          top: calc(22% + var(--lane) * 17%);
          left: 8%;
          display: inline-flex;
          align-items: center;
          min-height: 1.6rem;
          padding: 0.28rem 0.48rem;
          border: 1px solid color-mix(in srgb, var(--accent-secondary) 42%, var(--border-subtle));
          border-radius: 7px;
          background: var(--bg-card);
          color: var(--text-primary);
          font-size: 0.68rem;
          font-weight: 850;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
          animation: gb10Packet 6s ease-in-out infinite;
          animation-delay: var(--delay);
        }

        .gb10-memory-animation__stat-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.55rem;
        }

        .gb10-memory-animation__stat {
          min-width: 0;
          padding: 0.72rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: var(--bg-card);
        }

        .gb10-memory-animation__stat-value {
          display: block;
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 950;
          line-height: 1.2;
        }

        .gb10-memory-animation__stat-label {
          display: block;
          margin-top: 0.25rem;
          color: var(--text-muted);
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .gb10-memory-animation figcaption {
          padding: 0 1.5rem 1.15rem;
          color: var(--text-muted);
          font-size: 0.78rem;
          line-height: 1.45;
        }

        @keyframes gb10Pulse {
          0%, 100% { opacity: 0.58; transform: scaleY(0.92); }
          50% { opacity: 1; transform: scaleY(1); }
        }

        @keyframes gb10Bridge {
          0% { transform: translateX(-110%); }
          100% { transform: translateX(230%); }
        }

        @keyframes gb10Memory {
          0%, 100% { background: color-mix(in srgb, var(--accent) 9%, var(--bg-card)); }
          45%, 60% { background: color-mix(in srgb, var(--accent) 28%, var(--bg-card)); }
        }

        @keyframes gb10Packet {
          0% { transform: translate(0, 0); opacity: 0; }
          12% { opacity: 1; }
          45% { transform: translate(37vw, 0); }
          70% { transform: translate(37vw, 8.7rem); opacity: 1; }
          100% { transform: translate(37vw, 8.7rem); opacity: 0; }
        }

        @media (max-width: 720px) {
          .gb10-memory-animation__stage {
            min-height: 34rem;
          }

          .gb10-memory-animation__package {
            grid-template-columns: 1fr;
          }

          .gb10-memory-animation__bridge,
          .gb10-memory-animation__lanes {
            display: none;
          }

          .gb10-memory-animation__memory {
            grid-template-columns: 1fr;
          }

          .gb10-memory-animation__memory-speed {
            text-align: left;
          }

          .gb10-memory-animation__stat-row {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gb10-memory-animation__core,
          .gb10-memory-animation__sm,
          .gb10-memory-animation__bridge::before,
          .gb10-memory-animation__memory-cell,
          .gb10-memory-animation__packet {
            animation: none;
          }

          .gb10-memory-animation__packet {
            opacity: 1;
            transform: translate(32vw, 5rem);
          }
        }
      `}</style>
      <div className="gb10-memory-animation__inner">
        <p className="gb10-memory-animation__eyebrow">Animated system view</p>
        <h3 className="gb10-memory-animation__title" id="gb10-memory-title">
          GB10 is two dies feeding one memory pool
        </h3>
        <p className="gb10-memory-animation__subtitle">
          The CPU and GPU do not copy model state across a PCIe gap. They share coherent LPDDR5x, which is why capacity is the Spark's real trick.
        </p>
        <div className="gb10-memory-animation__stage">
          <div className="gb10-memory-animation__package">
            <div className="gb10-memory-animation__die">
              <div className="gb10-memory-animation__die-body">
                <p className="gb10-memory-animation__die-title">Grace CPU</p>
                <p className="gb10-memory-animation__die-note">20 Arm cores handle tokenization, orchestration, and runtime work.</p>
                <div className="gb10-memory-animation__cores" aria-hidden="true">
                  {Array.from({ length: 20 }).map((_, index) => (
                    <span
                      className="gb10-memory-animation__core"
                      key={`core-${index}`}
                      style={{ '--i': index }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="gb10-memory-animation__die">
              <div className="gb10-memory-animation__die-body">
                <p className="gb10-memory-animation__die-title">Blackwell GPU</p>
                <p className="gb10-memory-animation__die-note">48 SMs, 6,144 CUDA cores, native FP4 paths, compute capability sm_121.</p>
                <div className="gb10-memory-animation__sms" aria-hidden="true">
                  {Array.from({ length: 48 }).map((_, index) => (
                    <span
                      className="gb10-memory-animation__sm"
                      key={`sm-${index}`}
                      style={{ '--i': index }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="gb10-memory-animation__bridge" aria-hidden="true" />
          </div>
          <div className="gb10-memory-animation__lanes" aria-hidden="true">
            {lanes.map((lane, index) => (
              <span
                className="gb10-memory-animation__packet"
                key={lane.label}
                style={{ '--lane': index, '--delay': lane.delay }}
              >
                {lane.label}
              </span>
            ))}
          </div>
          <div className="gb10-memory-animation__memory">
            <div className="gb10-memory-animation__memory-label">128 GB coherent unified LPDDR5x</div>
            <div className="gb10-memory-animation__memory-grid" aria-hidden="true">
              {memoryTicks.map((_, index) => (
                <span
                  className="gb10-memory-animation__memory-cell"
                  key={`memory-${index}`}
                  style={{ '--i': index }}
                />
              ))}
            </div>
            <div className="gb10-memory-animation__memory-speed">273 GB/s</div>
          </div>
          <div className="gb10-memory-animation__stat-row" aria-label="GB10 Spark hardware summary">
            <div className="gb10-memory-animation__stat">
              <span className="gb10-memory-animation__stat-value">1 package</span>
              <span className="gb10-memory-animation__stat-label">CPU plus GPU</span>
            </div>
            <div className="gb10-memory-animation__stat">
              <span className="gb10-memory-animation__stat-value">sm_121</span>
              <span className="gb10-memory-animation__stat-label">GB10 target</span>
            </div>
            <div className="gb10-memory-animation__stat">
              <span className="gb10-memory-animation__stat-value">memory-first</span>
              <span className="gb10-memory-animation__stat-label">LLM design</span>
            </div>
          </div>
        </div>
      </div>
      <figcaption>
        For decode, the useful mental model is not a tiny H100. It is a desktop-sized unified-memory system built to keep bigger models resident.
      </figcaption>
    </figure>
  );
}
