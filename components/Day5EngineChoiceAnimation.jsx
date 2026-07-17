export default function Day5EngineChoiceAnimation() {
  const paths = [
    { name: 'Chat', tool: 'Ollama', detail: 'fastest start', color: '#76b900' },
    { name: 'Knobs', tool: 'llama.cpp', detail: 'raw control', color: '#f59e0b' },
    { name: 'Team API', tool: 'vLLM', detail: 'batching wins', color: '#38bdf8' },
    { name: 'Shared prompts', tool: 'SGLang', detail: 'prefix reuse', color: '#a855f7' },
    { name: 'NVIDIA path', tool: 'TRT-LLM / NIM', detail: 'supported stack', color: '#22c55e' },
    { name: 'Docker-native', tool: 'DMR', detail: 'OCI workflow', color: '#2496ed' },
  ];

  return (
    <figure className="day5-engine-choice" aria-labelledby="day5-engine-choice-title">
      <style dangerouslySetInnerHTML={{ __html: `
        .day5-engine-choice {
          margin: 2rem 0;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(118, 185, 0, 0.1), rgba(245, 158, 11, 0.08)),
            var(--bg-card);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }

        .day5-engine-choice * {
          box-sizing: border-box;
        }

        .day5-engine-choice__inner {
          padding: clamp(1rem, 3vw, 1.5rem);
        }

        .day5-engine-choice__eyebrow {
          margin: 0 0 0.35rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .day5-engine-choice__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.2;
        }

        .day5-engine-choice__subtitle {
          max-width: 46rem;
          margin: 0.55rem 0 1.35rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .day5-engine-choice__stage {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 0.75fr) minmax(0, 1.25fr);
          gap: 1rem;
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

        .day5-engine-choice__prompt {
          position: relative;
          min-height: 21rem;
          border: 1px solid var(--border-medium);
          border-radius: 8px;
          background: var(--bg-card);
          overflow: hidden;
        }

        .day5-engine-choice__question {
          position: absolute;
          left: 1rem;
          right: 1rem;
          top: 1rem;
          min-height: 4.6rem;
          padding: 0.85rem;
          border: 1px solid color-mix(in srgb, var(--accent) 45%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, var(--accent) 8%, var(--bg-card));
        }

        .day5-engine-choice__question strong {
          display: block;
          color: var(--text-primary);
          font-size: 0.95rem;
          font-weight: 950;
          line-height: 1.25;
        }

        .day5-engine-choice__question span {
          display: block;
          margin-top: 0.35rem;
          color: var(--text-secondary);
          font-size: 0.76rem;
          line-height: 1.35;
        }

        .day5-engine-choice__scanner {
          position: absolute;
          left: 50%;
          top: 7.2rem;
          bottom: 1.25rem;
          width: 0.35rem;
          transform: translateX(-50%);
          border-radius: 999px;
          background: color-mix(in srgb, var(--accent) 15%, var(--bg-card));
          overflow: hidden;
        }

        .day5-engine-choice__scanner::before {
          content: '';
          position: absolute;
          inset: 0;
          height: 25%;
          border-radius: inherit;
          background: linear-gradient(180deg, transparent, var(--accent), transparent);
          animation: day5ChoiceScan 3.4s linear infinite;
        }

        .day5-engine-choice__chips {
          position: absolute;
          left: 1rem;
          right: 1rem;
          bottom: 1rem;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.45rem;
        }

        .day5-engine-choice__chip {
          min-height: 2rem;
          display: grid;
          place-items: center;
          border: 1px solid color-mix(in srgb, var(--chip-color) 45%, var(--border-subtle));
          border-radius: 7px;
          background: color-mix(in srgb, var(--chip-color) 10%, var(--bg-card));
          color: var(--text-primary);
          font-size: 0.68rem;
          font-weight: 900;
          text-align: center;
          animation: day5ChoiceChip 5.8s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.13s);
        }

        .day5-engine-choice__grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.65rem;
        }

        .day5-engine-choice__path {
          position: relative;
          min-width: 0;
          min-height: 7.4rem;
          padding: 0.75rem;
          border: 1px solid color-mix(in srgb, var(--path-color) 48%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, var(--path-color) 8%, var(--bg-card));
          overflow: hidden;
        }

        .day5-engine-choice__path::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--path-color);
        }

        .day5-engine-choice__path::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--path-color) 14%, transparent), transparent);
          transform: translateX(-130%);
          animation: day5ChoiceGlow 7s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.22s);
        }

        .day5-engine-choice__path h4 {
          position: relative;
          z-index: 1;
          margin: 0 0 0.4rem;
          color: var(--text-primary);
          font-size: 0.82rem;
          font-weight: 950;
          line-height: 1.2;
        }

        .day5-engine-choice__path strong {
          position: relative;
          z-index: 1;
          display: block;
          color: var(--path-color);
          font-size: 1rem;
          font-weight: 950;
          line-height: 1.15;
        }

        .day5-engine-choice__path p {
          position: relative;
          z-index: 1;
          margin: 0.4rem 0 0;
          color: var(--text-secondary);
          font-size: 0.74rem;
          line-height: 1.35;
        }

        .day5-engine-choice__note {
          margin: 0.85rem 0 0;
          color: var(--text-secondary);
          font-size: 0.82rem;
          line-height: 1.45;
        }

        @keyframes day5ChoiceScan {
          0% { transform: translateY(-120%); }
          100% { transform: translateY(430%); }
        }

        @keyframes day5ChoiceChip {
          0%, 100% { transform: scale(0.96); opacity: 0.7; }
          50% { transform: scale(1); opacity: 1; }
        }

        @keyframes day5ChoiceGlow {
          0%, 20% { transform: translateX(-130%); opacity: 0; }
          32%, 70% { opacity: 1; }
          90%, 100% { transform: translateX(330%); opacity: 0; }
        }

        @media (max-width: 760px) {
          .day5-engine-choice__stage {
            grid-template-columns: 1fr;
          }

          .day5-engine-choice__grid {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .day5-engine-choice__scanner::before,
          .day5-engine-choice__chip,
          .day5-engine-choice__path::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      ` }} />

      <div className="day5-engine-choice__inner">
        <p className="day5-engine-choice__eyebrow">Choose by workload</p>
        <h3 className="day5-engine-choice__title" id="day5-engine-choice-title">
          The right engine depends on the shape of the workload
        </h3>
        <p className="day5-engine-choice__subtitle">
          Single-user chat, batched API serving, shared-prefix agents, and supported NVIDIA deployments optimize for different things.
        </p>

        <div className="day5-engine-choice__stage">
          <div className="day5-engine-choice__prompt" aria-label="Workload inputs">
            <div className="day5-engine-choice__question">
              <strong>What are you actually serving?</strong>
              <span>One user, many users, agents, Docker workflows, or an NVIDIA-supported deployment?</span>
            </div>
            <div className="day5-engine-choice__scanner" />
            <div className="day5-engine-choice__chips">
              {['latency', 'batching', 'prefix cache', 'support'].map((chip, index) => (
                <span
                  key={chip}
                  className="day5-engine-choice__chip"
                  style={{ '--chip-color': paths[index + 1]?.color || '#76b900', '--i': index }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="day5-engine-choice__grid" aria-label="Engine choices">
            {paths.map((path, index) => (
              <div
                key={path.name}
                className="day5-engine-choice__path"
                style={{ '--path-color': path.color, '--i': index }}
              >
                <h4>{path.name}</h4>
                <strong>{path.tool}</strong>
                <p>{path.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="day5-engine-choice__note">
          This is why the post says "ways to serve" instead of pretending every box is the same kind of engine.
        </p>
      </div>
    </figure>
  );
}
