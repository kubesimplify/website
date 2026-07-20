const metrics = [
  {
    label: 'Startup',
    value: 'server ready',
    detail: 'Load weights, compile kernels, reserve memory.',
    color: '#f59e0b',
  },
  {
    label: 'TTFT',
    value: 'request -> first token',
    detail: 'Queueing, tokenization, and prefill happen here.',
    color: '#76b900',
  },
  {
    label: 'ITL',
    value: 'token -> token',
    detail: 'The rhythm you feel while the answer streams.',
    color: '#38bdf8',
  },
  {
    label: 'Throughput',
    value: 'all tokens / second',
    detail: 'Total work completed across active requests.',
    color: '#a855f7',
  },
];

const tokens = ['A', 'Pod', 'groups', 'containers', 'together.'];

export default function Day5InferenceMetricsAnimation() {
  return (
    <figure className="day5-metrics" aria-labelledby="day5-metrics-title">
      <style dangerouslySetInnerHTML={{ __html: `
        .day5-metrics {
          margin: 2rem 0;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: var(--bg-card);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }

        .day5-metrics * {
          box-sizing: border-box;
        }

        .day5-metrics__inner {
          padding: 1.5rem;
        }

        .day5-metrics__eyebrow {
          margin: 0 0 0.35rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .day5-metrics__title {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.45rem;
          line-height: 1.25;
        }

        .day5-metrics__subtitle {
          max-width: 46rem;
          margin: 0.55rem 0 1.35rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .day5-metrics__stage {
          display: grid;
          grid-template-columns: minmax(13rem, 0.8fr) minmax(0, 1.2fr);
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: color-mix(in srgb, var(--bg-elevated) 88%, transparent);
        }

        .day5-metrics__cards {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.6rem;
        }

        .day5-metrics__card {
          position: relative;
          min-width: 0;
          min-height: 8.2rem;
          padding: 0.8rem;
          border: 1px solid color-mix(in srgb, var(--metric-color) 48%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, var(--metric-color) 8%, var(--bg-card));
          overflow: hidden;
        }

        .day5-metrics__card::before {
          content: '';
          position: absolute;
          inset: 0 auto 0 0;
          width: 4px;
          background: var(--metric-color);
        }

        .day5-metrics__card strong {
          display: block;
          color: var(--metric-color);
          font-size: 0.68rem;
          font-weight: 950;
          white-space: nowrap;
          text-transform: uppercase;
        }

        .day5-metrics__card span {
          display: block;
          margin-top: 0.45rem;
          color: var(--text-primary);
          font-size: 0.83rem;
          font-weight: 900;
          line-height: 1.3;
        }

        .day5-metrics__card p {
          margin: 0.5rem 0 0;
          color: var(--text-secondary);
          font-size: 0.74rem;
          line-height: 1.4;
        }

        .day5-metrics__timeline {
          position: relative;
          min-height: 17rem;
          padding: 1rem;
          border: 1px solid var(--border-medium);
          border-radius: 8px;
          background: var(--bg-card);
          overflow: hidden;
        }

        .day5-metrics__request {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          min-height: 3rem;
          padding: 0.75rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: var(--bg-elevated);
        }

        .day5-metrics__request strong {
          color: var(--text-primary);
          font-size: 0.8rem;
          line-height: 1.3;
        }

        .day5-metrics__request span {
          flex: 0 0 auto;
          color: var(--text-secondary);
          font-size: 0.7rem;
          font-weight: 800;
        }

        .day5-metrics__track {
          position: relative;
          display: grid;
          grid-template-columns: 38% 62%;
          min-height: 5.4rem;
          margin-top: 1.25rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          overflow: hidden;
        }

        .day5-metrics__prefill,
        .day5-metrics__decode {
          position: relative;
          min-width: 0;
          padding: 0.8rem;
        }

        .day5-metrics__prefill {
          border-right: 1px solid color-mix(in srgb, #76b900 60%, var(--border-subtle));
          background: color-mix(in srgb, #76b900 10%, var(--bg-card));
        }

        .day5-metrics__decode {
          background: color-mix(in srgb, #38bdf8 8%, var(--bg-card));
        }

        .day5-metrics__phase-label {
          display: block;
          color: var(--text-primary);
          font-size: 0.76rem;
          font-weight: 950;
        }

        .day5-metrics__phase-copy {
          display: block;
          margin-top: 0.3rem;
          color: var(--text-secondary);
          font-size: 0.68rem;
          line-height: 1.35;
        }

        .day5-metrics__sweep {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 4px;
          background: #76b900;
          transform-origin: left;
          animation: day5MetricsPrefill 6s ease-in-out infinite;
        }

        .day5-metrics__tokens {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-top: 0.75rem;
        }

        .day5-metrics__token {
          display: inline-flex;
          align-items: center;
          min-height: 1.7rem;
          padding: 0.28rem 0.45rem;
          border: 1px solid color-mix(in srgb, #38bdf8 55%, var(--border-subtle));
          border-radius: 6px;
          background: color-mix(in srgb, #38bdf8 11%, var(--bg-card));
          color: var(--text-primary);
          font-size: 0.67rem;
          font-weight: 850;
          opacity: 0.2;
          animation: day5MetricsToken 6s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.34s);
        }

        .day5-metrics__first-token {
          position: absolute;
          left: 38%;
          top: 7.9rem;
          transform: translate(-50%, -50%);
          z-index: 2;
          display: grid;
          place-items: center;
          width: 0.9rem;
          height: 0.9rem;
          border: 3px solid var(--bg-card);
          border-radius: 50%;
          background: #76b900;
          box-shadow: 0 0 0 2px color-mix(in srgb, #76b900 55%, transparent);
          animation: day5MetricsFirst 6s ease-in-out infinite;
        }

        .day5-metrics__legend {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .day5-metrics__legend span {
          display: block;
          min-width: 0;
          padding: 0.55rem;
          border-top: 2px solid var(--legend-color);
          color: var(--text-secondary);
          font-size: 0.68rem;
          line-height: 1.35;
          text-align: center;
        }

        .day5-metrics__note {
          margin: 0.9rem 0 0;
          color: var(--text-secondary);
          font-size: 0.82rem;
          line-height: 1.45;
        }

        @keyframes day5MetricsPrefill {
          0%, 10% { transform: scaleX(0); opacity: 0.5; }
          35%, 82% { transform: scaleX(1); opacity: 1; }
          100% { transform: scaleX(1); opacity: 0; }
        }

        @keyframes day5MetricsToken {
          0%, 35% { opacity: 0.15; transform: translateY(0.4rem); }
          48%, 82% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0.15; transform: translateY(0); }
        }

        @keyframes day5MetricsFirst {
          0%, 30% { opacity: 0.25; transform: translate(-50%, -50%) scale(0.7); }
          38%, 82% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0.25; transform: translate(-50%, -50%) scale(0.7); }
        }

        @media (max-width: 760px) {
          .day5-metrics__inner {
            padding: 1rem;
          }

          .day5-metrics__stage {
            grid-template-columns: 1fr;
          }

          .day5-metrics__timeline {
            min-height: 18rem;
          }
        }

        @media (max-width: 460px) {
          .day5-metrics__cards,
          .day5-metrics__legend {
            grid-template-columns: 1fr;
          }

          .day5-metrics__card {
            min-height: 0;
          }

          .day5-metrics__request {
            align-items: flex-start;
            flex-direction: column;
          }

          .day5-metrics__timeline {
            min-height: 20rem;
          }

          .day5-metrics__first-token {
            top: 9.65rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .day5-metrics__sweep,
          .day5-metrics__token,
          .day5-metrics__first-token {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            opacity: 1;
          }
        }
      ` }} />

      <div className="day5-metrics__inner">
        <p className="day5-metrics__eyebrow">One request, four clocks</p>
        <h3 className="day5-metrics__title" id="day5-metrics-title">
          “How fast?” is not one question
        </h3>
        <p className="day5-metrics__subtitle">
          The server can take time to start, the prompt can take time to read, tokens can stream slowly or quickly, and many users can share the same GPU.
        </p>

        <div className="day5-metrics__stage">
          <div className="day5-metrics__cards" aria-label="Four inference performance metrics">
            {metrics.map((metric) => (
              <div
                className="day5-metrics__card"
                key={metric.label}
                style={{ '--metric-color': metric.color }}
              >
                <strong>{metric.label}</strong>
                <span>{metric.value}</span>
                <p>{metric.detail}</p>
              </div>
            ))}
          </div>

          <div className="day5-metrics__timeline" aria-label="Animated request timeline">
            <div className="day5-metrics__request">
              <strong>Explain Kubernetes Pods...</strong>
              <span>request sent</span>
            </div>

            <div className="day5-metrics__track">
              <div className="day5-metrics__prefill">
                <span className="day5-metrics__phase-label">Prefill</span>
                <span className="day5-metrics__phase-copy">Read all prompt tokens</span>
                <span className="day5-metrics__sweep" />
              </div>
              <div className="day5-metrics__decode">
                <span className="day5-metrics__phase-label">Decode</span>
                <span className="day5-metrics__phase-copy">Generate one token at a time</span>
                <div className="day5-metrics__tokens">
                  {tokens.map((token, index) => (
                    <span
                      className="day5-metrics__token"
                      key={`${token}-${index}`}
                      style={{ '--i': index }}
                    >
                      {token}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <span className="day5-metrics__first-token" aria-hidden="true" />

            <div className="day5-metrics__legend">
              <span style={{ '--legend-color': '#76b900' }}>TTFT ends at the first output token</span>
              <span style={{ '--legend-color': '#38bdf8' }}>ITL measures gaps between output tokens</span>
              <span style={{ '--legend-color': '#a855f7' }}>Throughput counts work across all requests</span>
            </div>
          </div>
        </div>

        <p className="day5-metrics__note">
          A local chat benchmark mostly exposes TTFT and one-user decode. A serving benchmark must also measure concurrency, queueing, and total throughput.
        </p>
      </div>
    </figure>
  );
}
