export default function LLMRequestAnimation() {
  const promptTokens = ['Explain', 'DGX', 'Spark'];
  const answerTokens = ['DGX', 'Spark', 'runs', 'LLMs', 'locally'];

  return (
    <figure className="llm-request-animation" aria-labelledby="llm-request-animation-title">
      <style>{`
        .llm-request-animation {
          margin: 2rem 0;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(5, 202, 255, 0.08), rgba(92, 255, 104, 0.08)),
            var(--bg-card);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }

        .llm-request-animation * {
          box-sizing: border-box;
        }

        .llm-request-animation__inner {
          padding: clamp(1rem, 3vw, 1.5rem);
        }

        .llm-request-animation__eyebrow {
          margin: 0 0 0.35rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .llm-request-animation__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.2;
        }

        .llm-request-animation__subtitle {
          max-width: 42rem;
          margin: 0.55rem 0 1.35rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .llm-request-animation__stage {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr) minmax(0, 0.92fr);
          gap: 0.8rem;
          min-height: 18.5rem;
          padding: 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px),
            color-mix(in srgb, var(--bg-elevated) 82%, transparent);
          background-size: 42px 42px;
          overflow: hidden;
        }

        .llm-request-animation__lane {
          display: flex;
          min-width: 0;
          flex-direction: column;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .llm-request-animation__node {
          position: relative;
          min-width: 0;
          border: 1px solid var(--border-medium);
          border-radius: 8px;
          background: var(--bg-card);
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
          overflow: hidden;
        }

        .dark .llm-request-animation__node {
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.24);
        }

        .llm-request-animation__node::before {
          content: '';
          display: block;
          height: 4px;
          background: linear-gradient(90deg, var(--accent-secondary), var(--accent));
        }

        .llm-request-animation__node-body {
          padding: 0.8rem;
        }

        .llm-request-animation__label {
          margin: 0 0 0.5rem;
          color: var(--text-muted);
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .llm-request-animation__prompt {
          display: block;
          max-width: 100%;
          overflow-wrap: anywhere;
          color: var(--text-primary);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
          font-size: 0.84rem;
          line-height: 1.5;
        }

        .llm-request-animation__tokens,
        .llm-request-animation__answer {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .llm-request-animation__token,
        .llm-request-animation__answer-token {
          display: inline-flex;
          align-items: center;
          min-height: 1.75rem;
          padding: 0.34rem 0.55rem;
          border: 1px solid color-mix(in srgb, var(--accent) 42%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, var(--accent) 9%, var(--bg-card));
          color: var(--text-primary);
          font-size: 0.78rem;
          font-weight: 750;
          line-height: 1;
          white-space: nowrap;
        }

        .llm-request-animation__token {
          animation: llmTokenPop 6.4s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.16s);
        }

        .llm-request-animation__answer-token {
          border-color: color-mix(in srgb, var(--accent-secondary) 48%, var(--border-subtle));
          background: color-mix(in srgb, var(--accent-secondary) 12%, var(--bg-card));
          animation: llmAnswerReveal 6.4s ease-in-out infinite;
          animation-delay: calc(2.85s + var(--i) * 0.2s);
          opacity: 0;
          transform: translateY(6px);
        }

        .llm-request-animation__engine {
          display: grid;
          align-content: center;
          gap: 0.8rem;
        }

        .llm-request-animation__engine-core {
          position: relative;
          display: grid;
          place-items: center;
          min-height: 9.5rem;
          padding: 1rem;
          border: 1px solid color-mix(in srgb, var(--accent) 52%, var(--border-subtle));
          border-radius: 8px;
          background:
            radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 58%),
            var(--bg-card);
          overflow: hidden;
        }

        .llm-request-animation__engine-ring {
          position: absolute;
          width: 7.5rem;
          height: 7.5rem;
          border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
          border-radius: 50%;
          animation: llmRingPulse 6.4s ease-in-out infinite;
        }

        .llm-request-animation__engine-ring:nth-child(2) {
          width: 5.4rem;
          height: 5.4rem;
          animation-delay: 0.35s;
        }

        .llm-request-animation__chip {
          position: relative;
          display: grid;
          place-items: center;
          width: 4.4rem;
          height: 4.4rem;
          border: 1px solid color-mix(in srgb, var(--accent-secondary) 55%, var(--border-subtle));
          border-radius: 8px;
          background:
            linear-gradient(135deg, color-mix(in srgb, var(--accent-secondary) 18%, var(--bg-card)), color-mix(in srgb, var(--accent) 20%, var(--bg-card)));
          color: var(--text-primary);
          font-size: 0.86rem;
          font-weight: 900;
          animation: llmChipPulse 6.4s ease-in-out infinite;
        }

        .llm-request-animation__chip::before,
        .llm-request-animation__chip::after {
          content: '';
          position: absolute;
          inset: 0.6rem;
          border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
          border-radius: 6px;
        }

        .llm-request-animation__memory {
          display: grid;
          gap: 0.38rem;
          padding: 0.75rem;
          border: 1px solid color-mix(in srgb, #f59e0b 35%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, #f59e0b 7%, var(--bg-card));
        }

        .llm-request-animation__memory-title {
          color: var(--text-primary);
          font-size: 0.78rem;
          font-weight: 850;
        }

        .llm-request-animation__memory-bar {
          height: 0.48rem;
          border-radius: 999px;
          background: color-mix(in srgb, var(--text-muted) 15%, transparent);
          overflow: hidden;
        }

        .llm-request-animation__memory-bar span {
          display: block;
          width: 62%;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #f59e0b, var(--accent-secondary));
          animation: llmMemoryRead 6.4s ease-in-out infinite;
        }

        .llm-request-animation__flow {
          position: absolute;
          top: 50%;
          left: 25%;
          right: 25%;
          height: 2px;
          background: color-mix(in srgb, var(--accent) 28%, transparent);
          transform: translateY(-50%);
          pointer-events: none;
        }

        .llm-request-animation__packet {
          position: absolute;
          top: calc(50% - 0.35rem);
          left: 14%;
          width: 0.7rem;
          height: 0.7rem;
          border-radius: 999px;
          background: var(--accent);
          box-shadow: 0 0 18px color-mix(in srgb, var(--accent) 60%, transparent);
          animation: llmPacketMove 6.4s ease-in-out infinite;
          pointer-events: none;
        }

        .llm-request-animation__packet:nth-of-type(2) {
          background: var(--accent-secondary);
          box-shadow: 0 0 18px color-mix(in srgb, var(--accent-secondary) 60%, transparent);
          animation-delay: 0.75s;
        }

        .llm-request-animation__steps {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.5rem;
          margin-top: 0.8rem;
        }

        .llm-request-animation__step {
          min-width: 0;
          padding: 0.55rem 0.6rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: color-mix(in srgb, var(--bg-card) 86%, transparent);
          color: var(--text-secondary);
          font-size: 0.72rem;
          font-weight: 800;
          text-align: center;
        }

        .llm-request-animation__caption {
          margin: 0.95rem 0 0;
          color: var(--text-muted);
          font-size: 0.86rem;
          line-height: 1.6;
        }

        @keyframes llmTokenPop {
          0%, 13%, 100% { opacity: 0.52; transform: translateY(0) scale(1); }
          20%, 55% { opacity: 1; transform: translateY(-2px) scale(1.03); }
        }

        @keyframes llmAnswerReveal {
          0%, 38% { opacity: 0; transform: translateY(6px); }
          47%, 82% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(4px); }
        }

        @keyframes llmRingPulse {
          0%, 20%, 100% { opacity: 0.2; transform: scale(0.86); }
          40%, 72% { opacity: 0.75; transform: scale(1.06); }
        }

        @keyframes llmChipPulse {
          0%, 28%, 100% { transform: scale(1); box-shadow: none; }
          42%, 70% { transform: scale(1.04); box-shadow: 0 0 34px color-mix(in srgb, var(--accent) 24%, transparent); }
        }

        @keyframes llmMemoryRead {
          0%, 26%, 100% { width: 32%; }
          42%, 72% { width: 92%; }
        }

        @keyframes llmPacketMove {
          0%, 12% { opacity: 0; transform: translateX(0); }
          20% { opacity: 1; }
          54% { opacity: 1; transform: translateX(52vw); }
          66%, 100% { opacity: 0; transform: translateX(52vw); }
        }

        @media (max-width: 720px) {
          .llm-request-animation__stage {
            grid-template-columns: 1fr;
            min-height: 0;
          }

          .llm-request-animation__flow,
          .llm-request-animation__packet {
            display: none;
          }

          .llm-request-animation__engine-core {
            min-height: 8.25rem;
          }

          .llm-request-animation__steps {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .llm-request-animation *,
          .llm-request-animation *::before,
          .llm-request-animation *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }

          .llm-request-animation__answer-token {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      <div className="llm-request-animation__inner">
        <p className="llm-request-animation__eyebrow">Quick refresher visual</p>
        <h3 id="llm-request-animation-title" className="llm-request-animation__title">
          What happens when you ask a local LLM a question?
        </h3>
        <p className="llm-request-animation__subtitle">
          Text becomes tokens, the inference engine reads model weights on the GPU, and the answer streams back one token at a time.
        </p>

        <div className="llm-request-animation__stage" aria-label="Animated flow from prompt to output tokens">
          <div className="llm-request-animation__flow" aria-hidden="true" />
          <span className="llm-request-animation__packet" aria-hidden="true" />
          <span className="llm-request-animation__packet" aria-hidden="true" />

          <div className="llm-request-animation__lane">
            <div className="llm-request-animation__node">
              <div className="llm-request-animation__node-body">
                <p className="llm-request-animation__label">Prompt</p>
                <code className="llm-request-animation__prompt">"Explain DGX Spark"</code>
              </div>
            </div>

            <div className="llm-request-animation__node">
              <div className="llm-request-animation__node-body">
                <p className="llm-request-animation__label">Tokenize</p>
                <div className="llm-request-animation__tokens" aria-label="Prompt split into tokens">
                  {promptTokens.map((token, index) => (
                    <span key={token} className="llm-request-animation__token" style={{ '--i': index }}>
                      {token}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="llm-request-animation__engine">
            <div className="llm-request-animation__engine-core">
              <span className="llm-request-animation__engine-ring" aria-hidden="true" />
              <span className="llm-request-animation__engine-ring" aria-hidden="true" />
              <div className="llm-request-animation__chip" aria-label="GPU computes the next token">
                GPU
              </div>
            </div>

            <div className="llm-request-animation__memory" aria-label="Model weights in memory are read during inference">
              <span className="llm-request-animation__memory-title">Model weights in memory</span>
              <span className="llm-request-animation__memory-bar" aria-hidden="true"><span /></span>
            </div>
          </div>

          <div className="llm-request-animation__lane">
            <div className="llm-request-animation__node">
              <div className="llm-request-animation__node-body">
                <p className="llm-request-animation__label">Inference loop</p>
                <span className="llm-request-animation__prompt">Read weights -&gt; predict next token -&gt; repeat</span>
              </div>
            </div>

            <div className="llm-request-animation__node">
              <div className="llm-request-animation__node-body">
                <p className="llm-request-animation__label">Answer stream</p>
                <div className="llm-request-animation__answer" aria-label="Generated answer tokens">
                  {answerTokens.map((token, index) => (
                    <span key={`${token}-${index}`} className="llm-request-animation__answer-token" style={{ '--i': index }}>
                      {token}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="llm-request-animation__steps" aria-hidden="true">
          <span className="llm-request-animation__step">Prompt</span>
          <span className="llm-request-animation__step">Tokens</span>
          <span className="llm-request-animation__step">Model</span>
          <span className="llm-request-animation__step">Next token</span>
        </div>

        <figcaption className="llm-request-animation__caption">
          This is the beginner version. Next, we open the box properly: tokenization, prefill, KV cache, decode, and why memory bandwidth controls output speed.
        </figcaption>
      </div>
    </figure>
  );
}
