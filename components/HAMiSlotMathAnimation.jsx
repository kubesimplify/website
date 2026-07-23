const GPU_COUNT = 8;
const SLOTS_PER_GPU = 10;

export default function HAMiSlotMathAnimation() {
  return (
    <figure className="hami-slot-math" aria-labelledby="hami-slot-math-title">
      <style dangerouslySetInnerHTML={{ __html: `
        .hami-slot-math {
          margin: 2rem 0;
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: var(--bg-card);
          box-shadow: var(--card-shadow);
        }

        .hami-slot-math * { box-sizing: border-box; }

        .hami-slot-math__inner {
          padding: clamp(1rem, 3vw, 1.6rem);
        }

        .hami-slot-math__eyebrow {
          margin: 0 0 0.35rem;
          color: #5d8f00;
          font-size: 0.72rem;
          font-weight: 900;
          text-transform: uppercase;
        }

        .dark .hami-slot-math__eyebrow { color: #a3e635; }

        .hami-slot-math__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.25;
        }

        .hami-slot-math__subtitle {
          max-width: 48rem;
          margin: 0.55rem 0 1.25rem;
          color: var(--text-secondary);
          font-size: 0.92rem;
          line-height: 1.6;
        }

        .hami-slot-math__stage {
          display: grid;
          grid-template-columns: minmax(0, 0.85fr) auto minmax(0, 1.15fr);
          gap: clamp(0.8rem, 2vw, 1.4rem);
          align-items: center;
          padding: clamp(0.8rem, 2vw, 1.2rem);
          border: 2px dashed color-mix(in srgb, var(--text-secondary) 38%, transparent);
          border-radius: 7px 5px 8px 6px;
          background: color-mix(in srgb, var(--bg-elevated) 84%, transparent);
        }

        .hami-slot-math__label {
          margin: 0 0 0.7rem;
          color: var(--text-primary);
          font-size: 0.8rem;
          font-weight: 900;
          text-align: center;
        }

        .hami-slot-math__gpus {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.45rem;
        }

        .hami-slot-math__gpu {
          position: relative;
          display: grid;
          place-items: center;
          aspect-ratio: 1.35;
          min-width: 0;
          border: 2px solid #1971c2;
          border-radius: 5px 8px 4px 7px;
          background: color-mix(in srgb, #74c0fc 22%, var(--bg-card));
          color: var(--text-primary);
          font-size: 0.72rem;
          font-weight: 900;
          transform: rotate(var(--tilt));
        }

        .hami-slot-math__gpu::after {
          content: '';
          position: absolute;
          inset: 3px -3px -3px 3px;
          z-index: -1;
          border: 1px solid color-mix(in srgb, #1971c2 48%, transparent);
          border-radius: inherit;
        }

        .hami-slot-math__multiply {
          display: grid;
          place-items: center;
          gap: 0.2rem;
          color: #e8590c;
          text-align: center;
        }

        .hami-slot-math__multiply strong {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          line-height: 1;
        }

        .hami-slot-math__multiply span {
          max-width: 7rem;
          color: var(--text-secondary);
          font-size: 0.68rem;
          font-weight: 800;
          line-height: 1.3;
        }

        .hami-slot-math__slots {
          display: grid;
          grid-template-columns: repeat(10, minmax(0, 1fr));
          gap: 0.22rem;
        }

        .hami-slot-math__slot {
          aspect-ratio: 1;
          min-width: 0;
          border: 1px solid #5d8f00;
          border-radius: 3px 5px 2px 4px;
          background: color-mix(in srgb, #76b900 15%, var(--bg-card));
          animation: hamiSlotPulse 5.4s ease-in-out infinite;
          animation-delay: calc(var(--slot) * 0.035s);
        }

        .hami-slot-math__budgets {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.8rem;
          margin-top: 1rem;
        }

        .hami-slot-math__budget {
          min-width: 0;
          padding: 0.8rem;
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          background: var(--bg-card);
        }

        .hami-slot-math__budget-head {
          display: flex;
          justify-content: space-between;
          gap: 0.6rem;
          color: var(--text-primary);
          font-size: 0.76rem;
          font-weight: 900;
        }

        .hami-slot-math__bar {
          height: 0.55rem;
          margin-top: 0.55rem;
          overflow: hidden;
          border: 1px solid var(--border-medium);
          border-radius: 999px;
          background: var(--bg-elevated);
        }

        .hami-slot-math__bar::before {
          content: '';
          display: block;
          width: 100%;
          height: 100%;
          background: var(--bar-color);
          transform-origin: left;
          animation: hamiBudgetHold 5.4s ease-in-out infinite;
        }

        .hami-slot-math__takeaway {
          margin: 1rem 0 0;
          color: var(--text-secondary);
          font-size: 0.84rem;
          line-height: 1.5;
          text-align: center;
        }

        .hami-slot-math__takeaway strong { color: var(--text-primary); }
        .hami-slot-math__takeaway code {
          color: inherit;
          font-size: 0.82em;
        }

        @keyframes hamiSlotPulse {
          0%, 15%, 100% { background: color-mix(in srgb, #76b900 15%, var(--bg-card)); transform: scale(1); }
          30%, 62% { background: color-mix(in srgb, #76b900 48%, var(--bg-card)); transform: scale(0.88); }
        }

        @keyframes hamiBudgetHold {
          0%, 100% { transform: scaleX(1); opacity: 0.75; }
          45%, 65% { transform: scaleX(1); opacity: 1; }
        }

        @media (max-width: 720px) {
          .hami-slot-math__stage { grid-template-columns: 1fr; }
          .hami-slot-math__multiply { grid-template-columns: auto auto; }
          .hami-slot-math__slots { grid-template-columns: repeat(10, minmax(0, 1fr)); }
          .hami-slot-math__budgets { grid-template-columns: 1fr; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hami-slot-math__slot,
          .hami-slot-math__bar::before {
            animation: none !important;
          }
        }
      ` }} />

      <div className="hami-slot-math__inner">
        <p className="hami-slot-math__eyebrow">Scheduling math</p>
        <h3 className="hami-slot-math__title" id="hami-slot-math-title">
          Eight physical GPUs can expose 80 slots without becoming 80 GPUs
        </h3>
        <p className="hami-slot-math__subtitle">
          HAMi multiplies how many containers may share a card. It does not multiply the card&apos;s memory or compute.
        </p>

        <div className="hami-slot-math__stage" aria-hidden="true">
          <div>
            <p className="hami-slot-math__label">Hardware on the node</p>
            <div className="hami-slot-math__gpus">
              {Array.from({ length: GPU_COUNT }, (_, index) => (
                <span
                  className="hami-slot-math__gpu"
                  style={{ '--tilt': `${index % 2 === 0 ? -0.8 : 0.8}deg` }}
                  key={index}
                >
                  GPU {index}
                </span>
              ))}
            </div>
          </div>

          <div className="hami-slot-math__multiply">
            <strong>×10</strong>
            <span>maximum sharing slots per card</span>
          </div>

          <div>
            <p className="hami-slot-math__label">Logical slots Kubernetes counts</p>
            <div className="hami-slot-math__slots">
              {Array.from({ length: GPU_COUNT * SLOTS_PER_GPU }, (_, index) => (
                <span className="hami-slot-math__slot" style={{ '--slot': index }} key={index} />
              ))}
            </div>
          </div>
        </div>

        <div className="hami-slot-math__budgets">
          <div className="hami-slot-math__budget">
            <div className="hami-slot-math__budget-head">
              <span>Physical VRAM</span>
              <span>8 × 97,887 MiB</span>
            </div>
            <div className="hami-slot-math__bar" style={{ '--bar-color': '#1971c2' }} />
          </div>
          <div className="hami-slot-math__budget">
            <div className="hami-slot-math__budget-head">
              <span>Physical compute</span>
              <span>8 × 100%</span>
            </div>
            <div className="hami-slot-math__bar" style={{ '--bar-color': '#e8590c' }} />
          </div>
        </div>

        <p className="hami-slot-math__takeaway">
          <strong><code>deviceSplitCount</code> is a concurrency ceiling.</strong> Memory and core requests still have to fit the real card.
        </p>
      </div>
    </figure>
  );
}
