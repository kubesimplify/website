export default function HAMiBlastRadiusAnimation() {
  return (
    <figure className="hami-blast" aria-labelledby="hami-blast-title">
      <style dangerouslySetInnerHTML={{ __html: `
        .hami-blast {
          margin: 2rem 0;
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: var(--bg-card);
          box-shadow: var(--card-shadow);
        }

        .hami-blast * { box-sizing: border-box; }

        .hami-blast__inner {
          padding: clamp(1rem, 3vw, 1.6rem);
        }

        .hami-blast__eyebrow {
          margin: 0 0 0.35rem;
          color: #e03131;
          font-size: 0.72rem;
          font-weight: 900;
          text-transform: uppercase;
        }

        .hami-blast__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.25;
        }

        .hami-blast__subtitle {
          max-width: 49rem;
          margin: 0.55rem 0 1.25rem;
          color: var(--text-secondary);
          font-size: 0.92rem;
          line-height: 1.6;
        }

        .hami-blast__gpu {
          position: relative;
          padding: clamp(0.9rem, 2vw, 1.25rem);
          border: 3px solid #495057;
          border-radius: 6px 9px 5px 8px;
          background: color-mix(in srgb, #868e96 8%, var(--bg-elevated));
        }

        .hami-blast__gpu::after {
          content: '';
          position: absolute;
          inset: 5px -5px -5px 5px;
          z-index: -1;
          border: 1px solid color-mix(in srgb, #495057 45%, transparent);
          border-radius: inherit;
        }

        .hami-blast__gpu-head {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.9rem;
          color: var(--text-primary);
          font-size: 0.78rem;
          font-weight: 900;
        }

        .hami-blast__pods {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.9rem;
        }

        .hami-blast__pod {
          position: relative;
          min-width: 0;
          min-height: 14rem;
          padding: 0.9rem;
          border: 2px solid var(--pod-color);
          border-radius: 5px 8px 4px 7px;
          background: color-mix(in srgb, var(--pod-color) 10%, var(--bg-card));
        }

        .hami-blast__pod h4,
        .hami-blast__pod p { margin: 0; }

        .hami-blast__pod h4 {
          color: var(--text-primary);
          font-size: 0.92rem;
        }

        .hami-blast__pod p {
          margin-top: 0.3rem;
          color: var(--text-secondary);
          font-size: 0.72rem;
          line-height: 1.4;
        }

        .hami-blast__meter {
          position: absolute;
          right: 0.9rem;
          bottom: 0.9rem;
          left: 0.9rem;
          height: 6.4rem;
          overflow: hidden;
          border: 1px solid var(--border-medium);
          border-radius: 5px;
          background: var(--bg-elevated);
        }

        .hami-blast__fill {
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          height: var(--steady-height);
          background: color-mix(in srgb, var(--pod-color) 58%, var(--bg-card));
        }

        .hami-blast__pod--spike .hami-blast__fill {
          animation: hamiBlastFill 7s ease-in-out infinite;
        }

        .hami-blast__limit {
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          border-top: 2px dashed #e03131;
        }

        .hami-blast__meter-label {
          position: absolute;
          right: 0.4rem;
          bottom: 0.35rem;
          left: 0.4rem;
          color: var(--text-primary);
          font-size: 0.67rem;
          font-weight: 900;
          text-align: center;
        }

        .hami-blast__attempt {
          position: absolute;
          top: 0.55rem;
          right: 0.55rem;
          left: 0.55rem;
          padding: 0.36rem;
          border: 2px solid #e03131;
          border-radius: 4px 6px 3px 5px;
          background: color-mix(in srgb, #ffc9c9 58%, var(--bg-card));
          color: #a51111;
          font-size: 0.66rem;
          font-weight: 950;
          line-height: 1.25;
          text-align: center;
          opacity: 0;
          animation: hamiBlastReject 7s ease-in-out infinite;
        }

        .dark .hami-blast__attempt { color: #ffb3b3; }

        .hami-blast__steady {
          position: absolute;
          top: 0.55rem;
          right: 0.55rem;
          left: 0.55rem;
          padding: 0.36rem;
          border: 1px solid #2f9e44;
          border-radius: 4px 6px 3px 5px;
          background: color-mix(in srgb, #b2f2bb 34%, var(--bg-card));
          color: #18712d;
          font-size: 0.66rem;
          font-weight: 950;
          text-align: center;
          animation: hamiBlastSteady 7s ease-in-out infinite;
        }

        .dark .hami-blast__steady { color: #8ce99a; }

        .hami-blast__result {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.65rem;
          margin-top: 1rem;
        }

        .hami-blast__result div {
          min-width: 0;
          padding: 0.72rem;
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 0.72rem;
          line-height: 1.4;
          text-align: center;
        }

        .hami-blast__result strong {
          display: block;
          margin-bottom: 0.2rem;
          color: var(--text-primary);
          font-size: 0.76rem;
        }

        @keyframes hamiBlastFill {
          0%, 15%, 100% { height: 26%; }
          35% { height: 45%; }
          52% { height: 66%; }
          68%, 83% { height: 90%; }
        }

        @keyframes hamiBlastReject {
          0%, 60%, 100% { opacity: 0; transform: scale(0.94); }
          68%, 86% { opacity: 1; transform: scale(1); }
        }

        @keyframes hamiBlastSteady {
          0%, 100% { opacity: 0.72; }
          65%, 88% { opacity: 1; box-shadow: 0 0 0 4px color-mix(in srgb, #51cf66 20%, transparent); }
        }

        @media (max-width: 620px) {
          .hami-blast__pods,
          .hami-blast__result { grid-template-columns: 1fr; }
          .hami-blast__pod { min-height: 13rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hami-blast__fill,
          .hami-blast__attempt,
          .hami-blast__steady { animation: none !important; }
          .hami-blast__pod--spike .hami-blast__fill { height: 90%; }
          .hami-blast__attempt { opacity: 1; }
        }
      ` }} />

      <div className="hami-blast__inner">
        <p className="hami-blast__eyebrow">Measured OOM sequence</p>
        <h3 className="hami-blast__title" id="hami-blast-title">
          One container crosses 8,000 MiB; its neighbor keeps running
        </h3>
        <p className="hami-blast__subtitle">
          Both containers share the same physical RTX PRO 6000. Their HAMi memory accounts are separate.
        </p>

        <div className="hami-blast__gpu" aria-hidden="true">
          <div className="hami-blast__gpu-head">
            <span>Physical GPU 5</span>
            <span>97,887 MiB real VRAM</span>
          </div>

          <div className="hami-blast__pods">
            <div className="hami-blast__pod hami-blast__pod--spike" style={{ '--pod-color': '#e03131' }}>
              <h4>Container A</h4>
              <p>8,000 MiB grant · allocation spike</p>
              <div className="hami-blast__meter">
                <span className="hami-blast__fill" style={{ '--pod-color': '#e03131', '--steady-height': '26%' }} />
                <span className="hami-blast__limit" />
                <span className="hami-blast__attempt">next 1.49 GiB allocation → OOM</span>
                <span className="hami-blast__meter-label">peaked at 7,235 MiB before rejection</span>
              </div>
            </div>

            <div className="hami-blast__pod" style={{ '--pod-color': '#2f9e44' }}>
              <h4>Container B</h4>
              <p>8,000 MiB grant · steady matmul loop</p>
              <div className="hami-blast__meter">
                <span className="hami-blast__fill" style={{ '--pod-color': '#2f9e44', '--steady-height': '26%' }} />
                <span className="hami-blast__steady">Running · 0 restarts</span>
                <span className="hami-blast__meter-label">held 2,107 MiB throughout</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hami-blast__result">
          <div><strong>Quota that tripped</strong>8,388,608,000 bytes</div>
          <div><strong>Attempted total</strong>9,185,657,856 bytes</div>
          <div><strong>Physical card</strong>still had ample headroom</div>
        </div>
      </div>
    </figure>
  );
}
