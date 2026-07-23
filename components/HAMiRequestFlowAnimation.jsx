const STEPS = [
  { label: 'Pod request', detail: '1 GPU · 8000 MiB · 10%', color: '#1971c2' },
  { label: 'Webhook', detail: 'routes the pod to HAMi', color: '#9c36b5' },
  { label: 'Scheduler', detail: 'checks slot + memory + core', color: '#e8590c' },
  { label: 'Device plugin', detail: 'mounts devices + libvgpu', color: '#0b7285' },
  { label: 'HAMi-Core', detail: 'enforces inside the container', color: '#5d8f00' },
  { label: 'Physical GPU', detail: 'runs the accepted CUDA work', color: '#495057' },
];

export default function HAMiRequestFlowAnimation() {
  return (
    <figure className="hami-request-flow" aria-labelledby="hami-request-flow-title">
      <style dangerouslySetInnerHTML={{ __html: `
        .hami-request-flow {
          margin: 2rem 0;
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: var(--bg-card);
          box-shadow: var(--card-shadow);
        }

        .hami-request-flow * { box-sizing: border-box; }

        .hami-request-flow__inner {
          padding: clamp(1rem, 3vw, 1.6rem);
        }

        .hami-request-flow__eyebrow {
          margin: 0 0 0.35rem;
          color: #1971c2;
          font-size: 0.72rem;
          font-weight: 900;
          text-transform: uppercase;
        }

        .dark .hami-request-flow__eyebrow { color: #74c0fc; }

        .hami-request-flow__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.25;
        }

        .hami-request-flow__subtitle {
          max-width: 49rem;
          margin: 0.55rem 0 1.25rem;
          color: var(--text-secondary);
          font-size: 0.92rem;
          line-height: 1.6;
        }

        .hami-request-flow__stage {
          position: relative;
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 0.7rem;
          padding: 1.15rem 0.8rem;
          border: 2px dashed color-mix(in srgb, var(--text-secondary) 38%, transparent);
          border-radius: 7px 5px 8px 6px;
          background: color-mix(in srgb, var(--bg-elevated) 84%, transparent);
        }

        .hami-request-flow__rail {
          position: absolute;
          top: 50%;
          right: 5%;
          left: 5%;
          height: 3px;
          border-top: 3px dashed color-mix(in srgb, #5d8f00 55%, var(--border-medium));
          transform: translateY(-50%);
        }

        .hami-request-flow__packet {
          position: absolute;
          top: calc(50% - 0.38rem);
          left: 5%;
          width: 0.76rem;
          height: 0.76rem;
          border: 2px solid #4c6ef5;
          border-radius: 3px 5px 2px 4px;
          background: #a5d8ff;
          box-shadow: 0 0 0 4px color-mix(in srgb, #74c0fc 24%, transparent);
          animation: hamiRequestPacket 7.2s ease-in-out infinite;
        }

        .hami-request-flow__step {
          position: relative;
          z-index: 1;
          min-width: 0;
          min-height: 8.6rem;
          padding: 0.8rem 0.55rem;
          border: 2px solid var(--step-color);
          border-radius: 5px 8px 4px 7px;
          background: color-mix(in srgb, var(--step-color) 12%, var(--bg-card));
          transform: rotate(var(--tilt));
          animation: hamiRequestStep 7.2s ease-in-out infinite;
          animation-delay: calc(var(--step) * 0.72s);
        }

        .hami-request-flow__step::after {
          content: '';
          position: absolute;
          inset: 3px -3px -3px 3px;
          z-index: -1;
          border: 1px solid color-mix(in srgb, var(--step-color) 42%, transparent);
          border-radius: inherit;
        }

        .hami-request-flow__number {
          display: grid;
          place-items: center;
          width: 1.65rem;
          height: 1.65rem;
          margin: 0 auto 0.65rem;
          border: 1px solid var(--step-color);
          border-radius: 50%;
          background: var(--bg-card);
          color: var(--step-color);
          font-size: 0.74rem;
          font-weight: 950;
        }

        .hami-request-flow__step strong,
        .hami-request-flow__step span {
          display: block;
          overflow-wrap: anywhere;
          text-align: center;
        }

        .hami-request-flow__step strong {
          color: var(--text-primary);
          font-size: 0.78rem;
          line-height: 1.25;
        }

        .hami-request-flow__step span {
          margin-top: 0.45rem;
          color: var(--text-secondary);
          font-size: 0.67rem;
          line-height: 1.35;
        }

        .hami-request-flow__footer {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.8rem;
          margin-top: 1rem;
        }

        .hami-request-flow__note {
          min-width: 0;
          padding: 0.8rem;
          border-left: 4px solid var(--note-color);
          background: color-mix(in srgb, var(--note-color) 8%, var(--bg-card));
          color: var(--text-secondary);
          font-size: 0.8rem;
          line-height: 1.45;
        }

        .hami-request-flow__note strong {
          display: block;
          margin-bottom: 0.18rem;
          color: var(--text-primary);
        }

        @keyframes hamiRequestPacket {
          0%, 8% { left: 5%; opacity: 0; transform: scale(0.75); }
          13% { opacity: 1; transform: scale(1); }
          87% { left: calc(95% - 0.76rem); opacity: 1; transform: scale(1); }
          94%, 100% { left: calc(95% - 0.76rem); opacity: 0; transform: scale(0.75); }
        }

        @keyframes hamiRequestStep {
          0%, 12%, 100% { box-shadow: none; }
          19%, 28% { box-shadow: 0 0 0 5px color-mix(in srgb, var(--step-color) 18%, transparent); }
        }

        @media (max-width: 850px) {
          .hami-request-flow__stage { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .hami-request-flow__rail,
          .hami-request-flow__packet { display: none; }
          .hami-request-flow__step { min-height: 7.6rem; }
        }

        @media (max-width: 520px) {
          .hami-request-flow__stage { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .hami-request-flow__footer { grid-template-columns: 1fr; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hami-request-flow__packet,
          .hami-request-flow__step { animation: none !important; }
        }
      ` }} />

      <div className="hami-request-flow__inner">
        <p className="hami-request-flow__eyebrow">Animated request path</p>
        <h3 className="hami-request-flow__title" id="hami-request-flow-title">
          Scheduling decides where; HAMi-Core controls what happens inside
        </h3>
        <p className="hami-request-flow__subtitle">
          A memory request is checked before placement, then enforced again when the application actually allocates VRAM.
        </p>

        <div className="hami-request-flow__stage" aria-hidden="true">
          <span className="hami-request-flow__rail" />
          <span className="hami-request-flow__packet" />
          {STEPS.map((step, index) => (
            <div
              className="hami-request-flow__step"
              style={{
                '--step': index,
                '--step-color': step.color,
                '--tilt': `${index % 2 === 0 ? -0.45 : 0.45}deg`,
              }}
              key={step.label}
            >
              <span className="hami-request-flow__number">{index + 1}</span>
              <strong>{step.label}</strong>
              <span>{step.detail}</span>
            </div>
          ))}
        </div>

        <div className="hami-request-flow__footer">
          <div className="hami-request-flow__note" style={{ '--note-color': '#e8590c' }}>
            <strong>Before the container starts</strong>
            The scheduler rejects a request that cannot fit the card&apos;s remaining slot, memory, or core budget.
          </div>
          <div className="hami-request-flow__note" style={{ '--note-color': '#5d8f00' }}>
            <strong>While the process runs</strong>
            <code>libvgpu.so</code> intercepts supported CUDA/NVML paths and returns OOM when this container crosses its grant.
          </div>
        </div>
      </div>
    </figure>
  );
}
