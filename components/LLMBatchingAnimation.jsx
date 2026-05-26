export default function LLMBatchingAnimation() {
  const requests = [
    { name: 'Req A', color: '#3b82f6' },
    { name: 'Req B', color: '#22c55e' },
    { name: 'Req C', color: '#ec4899' },
    { name: 'Req D', color: '#06b6d4' },
    { name: 'Req E', color: '#8b5cf6' },
    { name: 'Req F', color: '#f59e0b' },
  ];

  return (
    <figure className="llm-batching-animation" aria-labelledby="llm-batching-title">
      <style>{`
        .llm-batching-animation {
          margin: 2rem 0;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(118, 185, 0, 0.09), rgba(245, 158, 11, 0.08)),
            var(--bg-card);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }

        .llm-batching-animation * {
          box-sizing: border-box;
        }

        .llm-batching-animation__inner {
          padding: clamp(1rem, 3vw, 1.5rem);
        }

        .llm-batching-animation__eyebrow {
          margin: 0 0 0.35rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .llm-batching-animation__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.2;
        }

        .llm-batching-animation__subtitle {
          max-width: 45rem;
          margin: 0.55rem 0 1.35rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .llm-batching-animation__stage {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: 0.9rem;
          padding: 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px),
            color-mix(in srgb, var(--bg-elevated) 86%, transparent);
          background-size: 42px 42px;
        }

        .llm-batching-animation__panel {
          min-width: 0;
          border: 1px solid var(--border-medium);
          border-radius: 8px;
          background: var(--bg-card);
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.07);
        }

        .dark .llm-batching-animation__panel {
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.25);
        }

        .llm-batching-animation__panel::before {
          content: '';
          display: block;
          height: 4px;
          background: linear-gradient(90deg, var(--accent), #f59e0b);
        }

        .llm-batching-animation__panel-body {
          padding: 0.85rem;
        }

        .llm-batching-animation__label {
          margin: 0 0 0.7rem;
          color: var(--text-muted);
          font-size: 0.68rem;
          font-weight: 850;
          text-transform: uppercase;
        }

        .llm-batching-animation__single {
          position: relative;
          display: grid;
          min-height: 18rem;
          place-items: center;
          overflow: hidden;
        }

        .llm-batching-animation__model {
          position: relative;
          display: grid;
          place-items: center;
          width: min(12rem, 80%);
          aspect-ratio: 1;
          border: 1px solid color-mix(in srgb, var(--accent) 50%, var(--border-subtle));
          border-radius: 8px;
          background:
            radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 62%),
            var(--bg-card);
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 950;
        }

        .llm-batching-animation__model::before,
        .llm-batching-animation__model::after {
          content: '';
          position: absolute;
          inset: 1.1rem;
          border: 1px solid color-mix(in srgb, var(--accent) 34%, transparent);
          border-radius: 8px;
          animation: batchingPulse 5.8s ease-in-out infinite;
        }

        .llm-batching-animation__model::after {
          inset: 2rem;
          animation-delay: 0.35s;
        }

        .llm-batching-animation__read {
          position: absolute;
          left: 12%;
          right: 12%;
          top: 32%;
          height: 0.48rem;
          border-radius: 999px;
          background: color-mix(in srgb, var(--accent) 16%, var(--bg-card));
          overflow: hidden;
        }

        .llm-batching-animation__read::before {
          content: '';
          position: absolute;
          inset: 0;
          width: 42%;
          border-radius: inherit;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          animation: batchingRead 2.1s linear infinite;
        }

        .llm-batching-animation__single-token {
          position: absolute;
          right: 14%;
          bottom: 24%;
          display: inline-flex;
          align-items: center;
          min-height: 1.9rem;
          padding: 0.38rem 0.58rem;
          border: 1px solid color-mix(in srgb, #f59e0b 48%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, #f59e0b 12%, var(--bg-card));
          color: var(--text-primary);
          font-size: 0.78rem;
          font-weight: 850;
          animation: batchingSingleOut 5.8s ease-in-out infinite;
        }

        .llm-batching-animation__caption {
          margin: 0.75rem 0 0;
          color: var(--text-secondary);
          font-size: 0.82rem;
          line-height: 1.45;
        }

        .llm-batching-animation__batch {
          display: grid;
          gap: 0.55rem;
        }

        .llm-batching-animation__step-labels {
          display: grid;
          grid-template-columns: 4.5rem repeat(8, minmax(0, 1fr));
          gap: 0.28rem;
          color: var(--text-muted);
          font-size: 0.68rem;
          font-weight: 850;
          text-align: center;
        }

        .llm-batching-animation__row {
          display: grid;
          grid-template-columns: 4.5rem repeat(8, minmax(0, 1fr));
          gap: 0.28rem;
          align-items: center;
          min-width: 0;
        }

        .llm-batching-animation__req-name {
          color: var(--text-secondary);
          font-size: 0.72rem;
          font-weight: 850;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .llm-batching-animation__slot {
          height: 1.55rem;
          border-radius: 7px;
          border: 1px solid color-mix(in srgb, var(--slot-color) 55%, var(--border-subtle));
          background: color-mix(in srgb, var(--slot-color) 20%, var(--bg-card));
          opacity: 0.22;
          transform: scale(0.9);
          animation: batchingSlot 6.4s ease-in-out infinite;
          animation-delay: calc(var(--step) * 0.12s + var(--row) * 0.05s);
        }

        .llm-batching-animation__slot--new {
          border-color: color-mix(in srgb, #f59e0b 70%, var(--border-subtle));
          background: color-mix(in srgb, #f59e0b 24%, var(--bg-card));
        }

        .llm-batching-animation__numbers {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.55rem;
          margin-top: 0.85rem;
        }

        .llm-batching-animation__number {
          min-width: 0;
          padding: 0.68rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: color-mix(in srgb, var(--bg-elevated) 76%, transparent);
        }

        .llm-batching-animation__number span {
          display: block;
          color: var(--text-muted);
          font-size: 0.62rem;
          font-weight: 850;
          text-transform: uppercase;
        }

        .llm-batching-animation__number strong {
          display: block;
          margin-top: 0.26rem;
          color: var(--text-primary);
          font-size: clamp(0.95rem, 2vw, 1.2rem);
          line-height: 1.2;
        }

        .llm-batching-animation__footer {
          margin: 0.8rem 0 0;
          padding: 0.76rem 0.85rem;
          border: 1px solid color-mix(in srgb, var(--accent) 28%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, var(--accent) 8%, var(--bg-card));
          color: var(--text-secondary);
          font-size: 0.84rem;
          line-height: 1.55;
        }

        .llm-batching-animation__footer strong {
          color: var(--text-primary);
        }

        @keyframes batchingPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.92); }
          42%, 68% { opacity: 0.72; transform: scale(1); }
        }

        @keyframes batchingRead {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(260%); }
        }

        @keyframes batchingSingleOut {
          0%, 45%, 100% { opacity: 0; transform: translateX(-18px); }
          58%, 82% { opacity: 1; transform: translateX(0); }
        }

        @keyframes batchingSlot {
          0%, 16%, 100% { opacity: 0.24; transform: scale(0.9); }
          25%, 78% { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 820px) {
          .llm-batching-animation__stage,
          .llm-batching-animation__numbers {
            grid-template-columns: 1fr;
          }

          .llm-batching-animation__step-labels,
          .llm-batching-animation__row {
            grid-template-columns: 3.7rem repeat(8, minmax(1.15rem, 1fr));
          }

          .llm-batching-animation__req-name {
            font-size: 0.66rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .llm-batching-animation *,
          .llm-batching-animation *::before,
          .llm-batching-animation *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }

          .llm-batching-animation__slot,
          .llm-batching-animation__single-token {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      <div className="llm-batching-animation__inner">
        <p className="llm-batching-animation__eyebrow">Animated Serving Model</p>
        <h3 className="llm-batching-animation__title" id="llm-batching-title">
          Why batching changes the economics
        </h3>
        <p className="llm-batching-animation__subtitle">
          One user makes the memory read expensive. Many users let one model read produce many output tokens in the same decode step.
        </p>

        <div className="llm-batching-animation__stage" aria-hidden="true">
          <div className="llm-batching-animation__panel">
            <div className="llm-batching-animation__panel-body">
              <p className="llm-batching-animation__label">Single user</p>
              <div className="llm-batching-animation__single">
                <span className="llm-batching-animation__read" />
                <div className="llm-batching-animation__model">model</div>
                <span className="llm-batching-animation__single-token">1 token</span>
              </div>
              <p className="llm-batching-animation__caption">
                One pass reads the active weights and returns one output token for one request.
              </p>
            </div>
          </div>

          <div className="llm-batching-animation__panel">
            <div className="llm-batching-animation__panel-body">
              <p className="llm-batching-animation__label">Continuous batching</p>
              <div className="llm-batching-animation__batch">
                <div className="llm-batching-animation__step-labels">
                  <span />
                  {Array.from({ length: 8 }).map((_, index) => (
                    <span key={index}>{index + 1}</span>
                  ))}
                </div>
                {requests.map((request, rowIndex) => (
                  <div className="llm-batching-animation__row" key={request.name}>
                    <span className="llm-batching-animation__req-name">{request.name}</span>
                    {Array.from({ length: 8 }).map((_, stepIndex) => {
                      const isNew = (rowIndex === 0 && stepIndex > 4) || (rowIndex === 2 && stepIndex > 5);
                      const hidden = (rowIndex === 4 && stepIndex < 4) || (rowIndex === 5 && stepIndex < 6);
                      return (
                        <span
                          className={`llm-batching-animation__slot${isNew ? ' llm-batching-animation__slot--new' : ''}`}
                          style={{
                            '--slot-color': hidden ? '#64748b' : request.color,
                            '--row': rowIndex,
                            '--step': stepIndex,
                            opacity: hidden ? 0.1 : undefined,
                          }}
                          key={`${request.name}-${stepIndex}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="llm-batching-animation__numbers">
                <div className="llm-batching-animation__number">
                  <span>Single request</span>
                  <strong>26 tok/s</strong>
                </div>
                <div className="llm-batching-animation__number">
                  <span>16 requests</span>
                  <strong>477 tok/s</strong>
                </div>
                <div className="llm-batching-animation__number">
                  <span>Shape</span>
                  <strong>near-linear</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="llm-batching-animation__footer">
          <strong>Reader takeaway:</strong> batching does not make one user magically faster. It makes the same model read serve many users at once, so aggregate throughput climbs until the GPU or memory system saturates.
        </p>
      </div>
    </figure>
  );
}
