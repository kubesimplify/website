export default function Day5RuntimeStackAnimation() {
  const layers = [
    { label: 'App', text: 'Chat UI, agent, curl, SDK', color: '#76b900' },
    { label: 'API', text: 'OpenAI-style HTTP surface', color: '#22c55e' },
    { label: 'Runtime', text: 'Scheduler, batching, cache manager', color: '#38bdf8' },
    { label: 'Engine', text: 'llama.cpp, vLLM, SGLang, TRT-LLM', color: '#a855f7' },
    { label: 'Weights', text: 'GGUF or safetensors model files', color: '#f59e0b' },
  ];

  return (
    <figure className="day5-runtime-stack" aria-labelledby="day5-runtime-stack-title">
      <style dangerouslySetInnerHTML={{ __html: `
        .day5-runtime-stack {
          margin: 2rem 0;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(118, 185, 0, 0.1), rgba(56, 189, 248, 0.08)),
            var(--bg-card);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }

        .day5-runtime-stack * {
          box-sizing: border-box;
        }

        .day5-runtime-stack__inner {
          padding: clamp(1rem, 3vw, 1.5rem);
        }

        .day5-runtime-stack__eyebrow {
          margin: 0 0 0.35rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .day5-runtime-stack__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.2;
        }

        .day5-runtime-stack__subtitle {
          max-width: 46rem;
          margin: 0.55rem 0 1.35rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .day5-runtime-stack__stage {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px),
            color-mix(in srgb, var(--bg-elevated) 86%, transparent);
          background-size: 44px 44px;
        }

        .day5-runtime-stack__layers {
          display: grid;
          gap: 0.55rem;
          min-width: 0;
        }

        .day5-runtime-stack__layer {
          position: relative;
          display: grid;
          grid-template-columns: 6.5rem minmax(0, 1fr);
          gap: 0.7rem;
          align-items: center;
          min-height: 4rem;
          padding: 0.75rem;
          border: 1px solid color-mix(in srgb, var(--layer-color) 48%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, var(--layer-color) 9%, var(--bg-card));
          overflow: hidden;
        }

        .day5-runtime-stack__layer::after {
          content: '';
          position: absolute;
          inset: 0;
          width: 34%;
          background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--layer-color) 18%, transparent), transparent);
          transform: translateX(-120%);
          animation: day5RuntimeSweep 6.8s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.22s);
        }

        .day5-runtime-stack__label {
          position: relative;
          z-index: 1;
          display: grid;
          place-items: center;
          min-height: 2.2rem;
          border-radius: 7px;
          background: color-mix(in srgb, var(--layer-color) 22%, var(--bg-card));
          color: var(--text-primary);
          font-size: 0.76rem;
          font-weight: 950;
          text-transform: uppercase;
        }

        .day5-runtime-stack__layer p {
          position: relative;
          z-index: 1;
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.78rem;
          line-height: 1.35;
        }

        .day5-runtime-stack__request {
          position: relative;
          min-height: 22.2rem;
          border: 1px solid var(--border-medium);
          border-radius: 8px;
          background:
            radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 60%),
            var(--bg-card);
          overflow: hidden;
        }

        .day5-runtime-stack__model {
          position: absolute;
          left: 50%;
          bottom: 1.05rem;
          transform: translateX(-50%);
          width: min(16rem, 78%);
          min-height: 3.8rem;
          display: grid;
          place-items: center;
          border: 1px solid color-mix(in srgb, #f59e0b 48%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, #f59e0b 11%, var(--bg-card));
          color: var(--text-primary);
          font-size: 0.86rem;
          font-weight: 950;
        }

        .day5-runtime-stack__pipe {
          position: absolute;
          left: 50%;
          top: 2rem;
          bottom: 5rem;
          width: 0.35rem;
          transform: translateX(-50%);
          border-radius: 999px;
          background: color-mix(in srgb, var(--accent) 17%, var(--bg-card));
          overflow: hidden;
        }

        .day5-runtime-stack__pipe::before {
          content: '';
          position: absolute;
          inset: 0;
          height: 30%;
          border-radius: inherit;
          background: linear-gradient(180deg, transparent, var(--accent), transparent);
          animation: day5RuntimeToken 2.4s linear infinite;
        }

        .day5-runtime-stack__token {
          position: absolute;
          left: 50%;
          top: 1.1rem;
          transform: translateX(-50%);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 6rem;
          min-height: 2rem;
          padding: 0.35rem 0.65rem;
          border: 1px solid color-mix(in srgb, var(--accent) 55%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, var(--accent) 12%, var(--bg-card));
          color: var(--text-primary);
          font-size: 0.74rem;
          font-weight: 900;
          animation: day5RuntimeBubble 4.8s ease-in-out infinite;
        }

        .day5-runtime-stack__result {
          position: absolute;
          right: 1rem;
          top: 45%;
          min-width: 5.5rem;
          min-height: 2rem;
          display: grid;
          place-items: center;
          border: 1px solid color-mix(in srgb, #38bdf8 55%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, #38bdf8 11%, var(--bg-card));
          color: var(--text-primary);
          font-size: 0.74rem;
          font-weight: 900;
          animation: day5RuntimeOut 4.8s ease-in-out infinite;
        }

        .day5-runtime-stack__note {
          margin: 0.85rem 0 0;
          color: var(--text-secondary);
          font-size: 0.82rem;
          line-height: 1.45;
        }

        @keyframes day5RuntimeSweep {
          0%, 18% { transform: translateX(-120%); opacity: 0; }
          28%, 70% { opacity: 1; }
          88%, 100% { transform: translateX(340%); opacity: 0; }
        }

        @keyframes day5RuntimeToken {
          0% { transform: translateY(-120%); }
          100% { transform: translateY(420%); }
        }

        @keyframes day5RuntimeBubble {
          0%, 100% { transform: translateX(-50%) scale(0.96); opacity: 0.75; }
          45%, 60% { transform: translateX(-50%) scale(1); opacity: 1; }
        }

        @keyframes day5RuntimeOut {
          0%, 42% { opacity: 0; transform: translateX(1rem); }
          55%, 82% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(1rem); }
        }

        @media (max-width: 760px) {
          .day5-runtime-stack__stage {
            grid-template-columns: 1fr;
          }

          .day5-runtime-stack__layer {
            grid-template-columns: 5.6rem minmax(0, 1fr);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .day5-runtime-stack__layer::after,
          .day5-runtime-stack__pipe::before,
          .day5-runtime-stack__token,
          .day5-runtime-stack__result {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      ` }} />

      <div className="day5-runtime-stack__inner">
        <p className="day5-runtime-stack__eyebrow">Runtime stack</p>
        <h3 className="day5-runtime-stack__title" id="day5-runtime-stack-title">
          A request passes through more than one layer
        </h3>
        <p className="day5-runtime-stack__subtitle">
          The model file is only the bottom layer. Speed and reliability depend on the engine, the scheduler, the cache manager, and the API wrapper around it.
        </p>

        <div className="day5-runtime-stack__stage">
          <div className="day5-runtime-stack__layers" aria-label="Runtime serving layers">
            {layers.map((layer, index) => (
              <div
                key={layer.label}
                className="day5-runtime-stack__layer"
                style={{ '--layer-color': layer.color, '--i': index }}
              >
                <span className="day5-runtime-stack__label">{layer.label}</span>
                <p>{layer.text}</p>
              </div>
            ))}
          </div>

          <div className="day5-runtime-stack__request" aria-label="Token request moving through the stack">
            <div className="day5-runtime-stack__token">prompt tokens</div>
            <div className="day5-runtime-stack__pipe" />
            <div className="day5-runtime-stack__result">next token</div>
            <div className="day5-runtime-stack__model">weights in memory</div>
          </div>
        </div>

        <p className="day5-runtime-stack__note">
          Beginner mental model: Ollama and LM Studio make the stack easy to use. vLLM, SGLang, and TensorRT-LLM expose more of the serving machinery.
        </p>
      </div>
    </figure>
  );
}
