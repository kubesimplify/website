const CURRENT_STEPS = [
  { label: 'Discover', detail: 'NVML reports profiles and legal placements' },
  { label: 'Reserve', detail: 'Scheduler selects the smallest fitting placement' },
  { label: 'Create', detail: 'Device plugin creates that exact GI and CI' },
  { label: 'Reclaim', detail: 'The pod ends and only its instance is removed' },
];

export default function DynamicMigLifecycleAnimation() {
  return (
    <figure className="dynamic-mig-lifecycle" aria-labelledby="dynamic-mig-lifecycle-title">
      <style dangerouslySetInnerHTML={{ __html: `
        .dynamic-mig-lifecycle {
          margin: 2rem 0;
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: var(--bg-card);
          box-shadow: var(--card-shadow);
        }

        .dynamic-mig-lifecycle * { box-sizing: border-box; }

        .dynamic-mig-lifecycle__inner {
          padding: clamp(1rem, 3vw, 1.6rem);
        }

        .dynamic-mig-lifecycle__eyebrow {
          margin: 0 0 0.35rem;
          color: #5d8f00;
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .dark .dynamic-mig-lifecycle__eyebrow { color: #b2f2bb; }

        .dynamic-mig-lifecycle__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.25;
        }

        .dynamic-mig-lifecycle__subtitle {
          max-width: 50rem;
          margin: 0.55rem 0 1.15rem;
          color: var(--text-secondary);
          font-size: 0.92rem;
          line-height: 1.6;
        }

        .dynamic-mig-lifecycle__request {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.6rem;
          padding: 0.7rem 0.8rem;
          border: 1px dashed color-mix(in srgb, #1971c2 75%, var(--border-medium));
          border-radius: 6px;
          background: color-mix(in srgb, #1971c2 6%, var(--bg-card));
          color: var(--text-secondary);
          font-size: 0.74rem;
        }

        .dynamic-mig-lifecycle__request strong { color: var(--text-primary); }

        .dynamic-mig-lifecycle__request code {
          color: #1971c2;
          font-size: 0.74rem;
          font-weight: 900;
        }

        .dark .dynamic-mig-lifecycle__request code { color: #74c0fc; }

        .dynamic-mig-lifecycle__flow {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.65rem;
          margin-top: 0.85rem;
        }

        .dynamic-mig-lifecycle__step {
          position: relative;
          min-width: 0;
          min-height: 7.2rem;
          padding: 0.75rem;
          border: 1px solid color-mix(in srgb, #1971c2 45%, var(--border-subtle));
          border-radius: 5px 8px 4px 7px;
          background: var(--bg-card);
          animation: dynamicMigStepPulse 7s ease-in-out infinite;
          animation-delay: calc(var(--step) * 1.15s);
        }

        .dynamic-mig-lifecycle__step:not(:last-child)::after {
          content: '→';
          position: absolute;
          z-index: 2;
          top: 50%;
          right: -0.62rem;
          display: grid;
          place-items: center;
          width: 0.9rem;
          height: 0.9rem;
          border-radius: 50%;
          background: var(--bg-card);
          color: #1971c2;
          font-size: 0.82rem;
          font-weight: 950;
          transform: translateY(-50%);
        }

        .dynamic-mig-lifecycle__step-number {
          display: grid;
          place-items: center;
          width: 1.45rem;
          height: 1.45rem;
          margin-bottom: 0.5rem;
          border: 1px solid #1971c2;
          border-radius: 50%;
          background: color-mix(in srgb, #1971c2 12%, var(--bg-card));
          color: #1971c2;
          font-size: 0.67rem;
          font-weight: 950;
        }

        .dark .dynamic-mig-lifecycle__step-number { color: #74c0fc; }

        .dynamic-mig-lifecycle__step strong,
        .dynamic-mig-lifecycle__step span { display: block; }

        .dynamic-mig-lifecycle__step strong {
          color: var(--text-primary);
          font-size: 0.76rem;
        }

        .dynamic-mig-lifecycle__step span {
          margin-top: 0.18rem;
          color: var(--text-secondary);
          font-size: 0.66rem;
          line-height: 1.35;
        }

        .dynamic-mig-lifecycle__gpu {
          margin-top: 0.9rem;
          padding: 0.85rem;
          border: 2px solid #495057;
          border-radius: 6px 9px 5px 8px;
          background: color-mix(in srgb, #868e96 7%, var(--bg-elevated));
        }

        .dynamic-mig-lifecycle__gpu-head {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.4rem;
          margin-bottom: 0.65rem;
          color: var(--text-secondary);
          font-size: 0.68rem;
        }

        .dynamic-mig-lifecycle__gpu-head strong {
          color: var(--text-primary);
          font-size: 0.76rem;
        }

        .dynamic-mig-lifecycle__placements {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 0.35rem;
        }

        .dynamic-mig-lifecycle__placement {
          display: grid;
          place-items: center;
          min-width: 0;
          min-height: 5.2rem;
          padding: 0.45rem;
          border: 1px solid var(--placement-color);
          border-radius: 4px 7px 3px 6px;
          background: color-mix(in srgb, var(--placement-color) 13%, var(--bg-card));
          color: var(--text-primary);
          text-align: center;
          animation: dynamicMigPlacementPulse 7s ease-in-out infinite;
          animation-delay: var(--placement-delay);
        }

        .dynamic-mig-lifecycle__placement--free {
          border-style: dashed;
          background: var(--bg-card);
          animation: none;
        }

        .dynamic-mig-lifecycle__placement strong,
        .dynamic-mig-lifecycle__placement span { display: block; }

        .dynamic-mig-lifecycle__placement strong {
          color: var(--placement-color);
          font-size: 0.72rem;
        }

        .dynamic-mig-lifecycle__placement span {
          margin-top: 0.2rem;
          color: var(--text-secondary);
          font-size: 0.6rem;
          line-height: 1.3;
        }

        .dynamic-mig-lifecycle__takeaway {
          margin: 0.9rem 0 0;
          padding: 0.72rem 0.82rem;
          border-left: 4px solid #087f5b;
          background: color-mix(in srgb, #087f5b 8%, var(--bg-card));
          color: var(--text-secondary);
          font-size: 0.78rem;
          line-height: 1.5;
        }

        .dynamic-mig-lifecycle__takeaway strong { color: var(--text-primary); }

        @keyframes dynamicMigStepPulse {
          0%, 12%, 100% { box-shadow: none; transform: translateY(0); }
          20%, 34% {
            box-shadow: 0 0 0 4px color-mix(in srgb, #1971c2 15%, transparent);
            transform: translateY(-2px);
          }
        }

        @keyframes dynamicMigPlacementPulse {
          0%, 45%, 100% { opacity: 0.72; transform: scale(0.985); }
          55%, 85% { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 800px) {
          .dynamic-mig-lifecycle__flow { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .dynamic-mig-lifecycle__step:nth-child(2)::after { display: none; }
        }

        @media (max-width: 520px) {
          .dynamic-mig-lifecycle__flow { grid-template-columns: 1fr; }
          .dynamic-mig-lifecycle__step { min-height: 0; }
          .dynamic-mig-lifecycle__step::after { display: none !important; }
          .dynamic-mig-lifecycle__placements { grid-template-columns: 2fr 1fr; }
          .dynamic-mig-lifecycle__placement--free { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .dynamic-mig-lifecycle__step,
          .dynamic-mig-lifecycle__placement { animation: none !important; }
        }
      ` }} />

      <div className="dynamic-mig-lifecycle__inner">
        <p className="dynamic-mig-lifecycle__eyebrow">Verified per-pod lifecycle</p>
        <h3 className="dynamic-mig-lifecycle__title" id="dynamic-mig-lifecycle-title">
          How one request becomes one hardware instance
        </h3>
        <p className="dynamic-mig-lifecycle__subtitle">
          This is the topology-aware flow verified in this lab: discover, reserve, create, and reclaim one legal placement for one pod.
        </p>

        <div aria-hidden="true">
          <div className="dynamic-mig-lifecycle__request">
            <strong>Incoming Kubernetes pod</strong>
            <code>gpu: 1 · gpumem: 8000 · mode: mig</code>
          </div>

          <div className="dynamic-mig-lifecycle__flow">
            {CURRENT_STEPS.map((step, index) => (
              <div className="dynamic-mig-lifecycle__step" style={{ '--step': index }} key={step.label}>
                <span className="dynamic-mig-lifecycle__step-number">{index + 1}</span>
                <strong>{step.label}</strong>
                <span>{step.detail}</span>
              </div>
            ))}
          </div>

          <div className="dynamic-mig-lifecycle__gpu">
            <div className="dynamic-mig-lifecycle__gpu-head">
              <strong>Verified mixed placement on GPU 4</strong>
              <span>NVML placement intervals · not GiB</span>
            </div>
            <div className="dynamic-mig-lifecycle__placements">
              <div className="dynamic-mig-lifecycle__placement" style={{ '--placement-color': '#1971c2', '--placement-delay': '2.2s' }}>
                <div>
                  <strong>2g.48gb</strong>
                  <span>start 0 · size 6</span>
                </div>
              </div>
              <div className="dynamic-mig-lifecycle__placement dynamic-mig-lifecycle__placement--free" style={{ '--placement-color': '#868e96' }}>
                <div>
                  <strong>free</strong>
                  <span>start 6 · size 3</span>
                </div>
              </div>
              <div className="dynamic-mig-lifecycle__placement" style={{ '--placement-color': '#5d8f00', '--placement-delay': '3.35s' }}>
                <div>
                  <strong>1g.24gb</strong>
                  <span>start 9 · size 3</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="dynamic-mig-lifecycle__takeaway">
          <strong>Smallest fitting profile, legal free placement, exact cleanup.</strong> Deleting the 1g pod reclaimed only its GI/CI while the neighboring 2g CUDA workload continued.
        </p>
      </div>
    </figure>
  );
}
