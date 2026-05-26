export default function LLMLifecycleAnimation() {
  const promptTokens = ['What', "'s", 'the', 'capital', 'of', 'France', '?'];
  const cacheRows = ['L1', 'L2', 'L3', 'L4'];
  const streamTokens = ['Paris', 'is', 'the', 'capital', '.'];

  return (
    <figure className="llm-lifecycle-animation" aria-labelledby="llm-lifecycle-title">
      <style>{`
        .llm-lifecycle-animation {
          margin: 2rem 0;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(5, 202, 255, 0.08), rgba(118, 185, 0, 0.08)),
            var(--bg-card);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }

        .llm-lifecycle-animation * {
          box-sizing: border-box;
        }

        .llm-lifecycle-animation__inner {
          padding: clamp(1rem, 3vw, 1.5rem);
        }

        .llm-lifecycle-animation__eyebrow {
          margin: 0 0 0.35rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .llm-lifecycle-animation__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.2;
        }

        .llm-lifecycle-animation__subtitle {
          max-width: 45rem;
          margin: 0.55rem 0 1.35rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .llm-lifecycle-animation__stage {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr) minmax(0, 0.85fr);
          gap: 0.85rem;
          min-height: 24rem;
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

        .llm-lifecycle-animation__column {
          display: grid;
          min-width: 0;
          gap: 0.75rem;
          align-content: stretch;
        }

        .llm-lifecycle-animation__panel {
          position: relative;
          min-width: 0;
          border: 1px solid var(--border-medium);
          border-radius: 8px;
          background: var(--bg-card);
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.07);
        }

        .dark .llm-lifecycle-animation__panel {
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.25);
        }

        .llm-lifecycle-animation__panel::before {
          content: '';
          display: block;
          height: 4px;
          background: linear-gradient(90deg, var(--accent-secondary), var(--accent));
        }

        .llm-lifecycle-animation__panel-body {
          padding: 0.78rem;
        }

        .llm-lifecycle-animation__label {
          margin: 0 0 0.5rem;
          color: var(--text-muted);
          font-size: 0.68rem;
          font-weight: 850;
          text-transform: uppercase;
        }

        .llm-lifecycle-animation__prompt {
          margin: 0;
          color: var(--text-primary);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
          font-size: 0.82rem;
          line-height: 1.55;
          overflow-wrap: anywhere;
        }

        .llm-lifecycle-animation__tokens,
        .llm-lifecycle-animation__stream {
          display: flex;
          flex-wrap: wrap;
          gap: 0.38rem;
        }

        .llm-lifecycle-animation__token,
        .llm-lifecycle-animation__stream-token {
          display: inline-flex;
          align-items: center;
          min-height: 1.72rem;
          padding: 0.34rem 0.5rem;
          border: 1px solid color-mix(in srgb, var(--accent) 42%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, var(--accent) 9%, var(--bg-card));
          color: var(--text-primary);
          font-size: 0.76rem;
          font-weight: 800;
          line-height: 1;
          white-space: nowrap;
        }

        .llm-lifecycle-animation__token {
          animation: lifecycleToken 7.8s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.08s);
        }

        .llm-lifecycle-animation__stream-token {
          border-color: color-mix(in srgb, var(--accent-secondary) 48%, var(--border-subtle));
          background: color-mix(in srgb, var(--accent-secondary) 11%, var(--bg-card));
          opacity: 0;
          transform: translateY(6px);
          animation: lifecycleStream 7.8s ease-in-out infinite;
          animation-delay: calc(4.85s + var(--i) * 0.22s);
        }

        .llm-lifecycle-animation__engine {
          display: grid;
          grid-template-rows: auto minmax(0, 1fr) auto;
          min-width: 0;
          gap: 0.75rem;
        }

        .llm-lifecycle-animation__chip {
          position: relative;
          display: grid;
          min-height: 10.5rem;
          place-items: center;
          border: 1px solid color-mix(in srgb, var(--accent) 52%, var(--border-subtle));
          border-radius: 8px;
          background:
            radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 60%),
            var(--bg-card);
          overflow: hidden;
        }

        .llm-lifecycle-animation__chip::before,
        .llm-lifecycle-animation__chip::after {
          content: '';
          position: absolute;
          border: 1px solid color-mix(in srgb, var(--accent) 38%, transparent);
          border-radius: 50%;
          animation: lifecycleRing 7.8s ease-in-out infinite;
        }

        .llm-lifecycle-animation__chip::before {
          width: 8.2rem;
          height: 8.2rem;
        }

        .llm-lifecycle-animation__chip::after {
          width: 5.6rem;
          height: 5.6rem;
          animation-delay: 0.35s;
        }

        .llm-lifecycle-animation__gpu {
          position: relative;
          z-index: 1;
          display: grid;
          place-items: center;
          width: 5rem;
          height: 5rem;
          border: 1px solid color-mix(in srgb, var(--accent-secondary) 55%, var(--border-subtle));
          border-radius: 8px;
          background:
            linear-gradient(135deg, color-mix(in srgb, var(--accent-secondary) 18%, var(--bg-card)), color-mix(in srgb, var(--accent) 20%, var(--bg-card)));
          color: var(--text-primary);
          font-size: 0.9rem;
          font-weight: 950;
          animation: lifecycleGpu 7.8s ease-in-out infinite;
        }

        .llm-lifecycle-animation__matrix {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 0.28rem;
          min-width: 0;
        }

        .llm-lifecycle-animation__matrix-cell {
          height: 1.18rem;
          border-radius: 5px;
          background: color-mix(in srgb, var(--accent) 16%, var(--bg-card));
          border: 1px solid color-mix(in srgb, var(--accent) 20%, var(--border-subtle));
          animation: lifecycleMatrix 7.8s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.05s);
        }

        .llm-lifecycle-animation__cache {
          display: grid;
          gap: 0.35rem;
        }

        .llm-lifecycle-animation__cache-row {
          display: grid;
          grid-template-columns: 1.6rem repeat(7, minmax(0, 1fr));
          gap: 0.24rem;
          align-items: center;
        }

        .llm-lifecycle-animation__cache-name {
          color: var(--text-muted);
          font-size: 0.66rem;
          font-weight: 850;
        }

        .llm-lifecycle-animation__cache-cell {
          height: 0.78rem;
          border-radius: 4px;
          border: 1px solid color-mix(in srgb, #f59e0b 28%, var(--border-subtle));
          background: color-mix(in srgb, #f59e0b 10%, var(--bg-card));
          transform-origin: left;
          animation: lifecycleCache 7.8s ease-in-out infinite;
          animation-delay: calc(1.45s + var(--i) * 0.055s);
        }

        .llm-lifecycle-animation__arrow {
          position: absolute;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity: 0;
          animation: lifecycleArrow 7.8s ease-in-out infinite;
        }

        .llm-lifecycle-animation__arrow--prompt {
          top: 42%;
          left: 27%;
          width: 16%;
        }

        .llm-lifecycle-animation__arrow--answer {
          right: 27%;
          bottom: 30%;
          width: 16%;
          animation-delay: 0.6s;
        }

        .llm-lifecycle-animation__meters {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.5rem;
        }

        .llm-lifecycle-animation__meter {
          min-width: 0;
          padding: 0.62rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: color-mix(in srgb, var(--bg-elevated) 76%, transparent);
        }

        .llm-lifecycle-animation__meter-label {
          display: block;
          color: var(--text-muted);
          font-size: 0.62rem;
          font-weight: 850;
          text-transform: uppercase;
        }

        .llm-lifecycle-animation__meter-value {
          display: block;
          margin-top: 0.25rem;
          color: var(--text-primary);
          font-size: 0.95rem;
          font-weight: 900;
        }

        .llm-lifecycle-animation__footer {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.65rem;
          margin-top: 0.8rem;
        }

        .llm-lifecycle-animation__takeaway {
          min-width: 0;
          padding: 0.7rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: color-mix(in srgb, var(--bg-elevated) 78%, transparent);
        }

        .llm-lifecycle-animation__takeaway strong {
          display: block;
          color: var(--text-primary);
          font-size: 0.82rem;
          line-height: 1.3;
        }

        .llm-lifecycle-animation__takeaway span {
          display: block;
          margin-top: 0.25rem;
          color: var(--text-secondary);
          font-size: 0.76rem;
          line-height: 1.45;
        }

        @keyframes lifecycleToken {
          0%, 10%, 100% { opacity: 0.45; transform: translateY(0); }
          18%, 46% { opacity: 1; transform: translateY(-2px); }
          58%, 88% { opacity: 0.72; transform: translateY(0); }
        }

        @keyframes lifecycleMatrix {
          0%, 14%, 100% { opacity: 0.36; transform: scaleY(0.75); }
          22%, 42% { opacity: 1; transform: scaleY(1); background: color-mix(in srgb, var(--accent) 34%, var(--bg-card)); }
          52%, 86% { opacity: 0.55; transform: scaleY(0.85); }
        }

        @keyframes lifecycleCache {
          0%, 20%, 100% { opacity: 0.25; transform: scaleX(0.18); }
          34%, 88% { opacity: 1; transform: scaleX(1); }
        }

        @keyframes lifecycleRing {
          0%, 100% { opacity: 0.2; transform: scale(0.88); }
          20%, 50% { opacity: 0.75; transform: scale(1); }
          72% { opacity: 0.3; transform: scale(1.06); }
        }

        @keyframes lifecycleGpu {
          0%, 100% { transform: scale(1); }
          24%, 44% { transform: scale(1.05); }
          64%, 78% { transform: scale(1.02); }
        }

        @keyframes lifecycleStream {
          0%, 57%, 100% { opacity: 0; transform: translateY(6px); }
          64%, 90% { opacity: 1; transform: translateY(0); }
        }

        @keyframes lifecycleArrow {
          0%, 16%, 100% { opacity: 0; transform: scaleX(0.2); }
          24%, 52% { opacity: 0.85; transform: scaleX(1); }
          68%, 84% { opacity: 0.55; transform: scaleX(0.8); }
        }

        @media (max-width: 760px) {
          .llm-lifecycle-animation__stage {
            grid-template-columns: 1fr;
            min-height: 0;
          }

          .llm-lifecycle-animation__arrow {
            display: none;
          }

          .llm-lifecycle-animation__footer {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .llm-lifecycle-animation *,
          .llm-lifecycle-animation *::before,
          .llm-lifecycle-animation *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }

          .llm-lifecycle-animation__stream-token,
          .llm-lifecycle-animation__arrow {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      <div className="llm-lifecycle-animation__inner">
        <p className="llm-lifecycle-animation__eyebrow">Animated Request Trace</p>
        <h3 className="llm-lifecycle-animation__title" id="llm-lifecycle-title">
          From prompt to streamed answer
        </h3>
        <p className="llm-lifecycle-animation__subtitle">
          The request has two expensive phases: prefill reads the whole prompt in parallel, then decode loops one output token at a time while reusing the KV cache.
        </p>

        <div className="llm-lifecycle-animation__stage" aria-hidden="true">
          <span className="llm-lifecycle-animation__arrow llm-lifecycle-animation__arrow--prompt" />
          <span className="llm-lifecycle-animation__arrow llm-lifecycle-animation__arrow--answer" />

          <div className="llm-lifecycle-animation__column">
            <div className="llm-lifecycle-animation__panel">
              <div className="llm-lifecycle-animation__panel-body">
                <p className="llm-lifecycle-animation__label">1. Prompt</p>
                <p className="llm-lifecycle-animation__prompt">"What's the capital of France?"</p>
              </div>
            </div>

            <div className="llm-lifecycle-animation__panel">
              <div className="llm-lifecycle-animation__panel-body">
                <p className="llm-lifecycle-animation__label">2. Tokenize</p>
                <div className="llm-lifecycle-animation__tokens">
                  {promptTokens.map((token, index) => (
                    <span className="llm-lifecycle-animation__token" style={{ '--i': index }} key={token}>
                      {token}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="llm-lifecycle-animation__engine">
            <div className="llm-lifecycle-animation__panel">
              <div className="llm-lifecycle-animation__panel-body">
                <p className="llm-lifecycle-animation__label">3. Prefill</p>
                <div className="llm-lifecycle-animation__matrix">
                  {Array.from({ length: 28 }).map((_, index) => (
                    <span className="llm-lifecycle-animation__matrix-cell" style={{ '--i': index }} key={index} />
                  ))}
                </div>
              </div>
            </div>

            <div className="llm-lifecycle-animation__chip">
              <div className="llm-lifecycle-animation__gpu">GPU</div>
            </div>

            <div className="llm-lifecycle-animation__panel">
              <div className="llm-lifecycle-animation__panel-body">
                <p className="llm-lifecycle-animation__label">4. KV Cache</p>
                <div className="llm-lifecycle-animation__cache">
                  {cacheRows.map((row, rowIndex) => (
                    <div className="llm-lifecycle-animation__cache-row" key={row}>
                      <span className="llm-lifecycle-animation__cache-name">{row}</span>
                      {promptTokens.map((token, index) => (
                        <span
                          className="llm-lifecycle-animation__cache-cell"
                          style={{ '--i': rowIndex * promptTokens.length + index }}
                          key={`${row}-${token}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="llm-lifecycle-animation__column">
            <div className="llm-lifecycle-animation__panel">
              <div className="llm-lifecycle-animation__panel-body">
                <p className="llm-lifecycle-animation__label">5. Decode Loop</p>
                <div className="llm-lifecycle-animation__meters">
                  <div className="llm-lifecycle-animation__meter">
                    <span className="llm-lifecycle-animation__meter-label">TTFT</span>
                    <span className="llm-lifecycle-animation__meter-value">prefill</span>
                  </div>
                  <div className="llm-lifecycle-animation__meter">
                    <span className="llm-lifecycle-animation__meter-label">tok/s</span>
                    <span className="llm-lifecycle-animation__meter-value">decode</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="llm-lifecycle-animation__panel">
              <div className="llm-lifecycle-animation__panel-body">
                <p className="llm-lifecycle-animation__label">6. Stream Answer</p>
                <div className="llm-lifecycle-animation__stream">
                  {streamTokens.map((token, index) => (
                    <span className="llm-lifecycle-animation__stream-token" style={{ '--i': index }} key={token}>
                      {token}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="llm-lifecycle-animation__footer">
          <div className="llm-lifecycle-animation__takeaway">
            <strong>Prefill is parallel</strong>
            <span>All prompt tokens move through the model together.</span>
          </div>
          <div className="llm-lifecycle-animation__takeaway">
            <strong>KV cache prevents recompute</strong>
            <span>Past K/V vectors are reused instead of rebuilt.</span>
          </div>
          <div className="llm-lifecycle-animation__takeaway">
            <strong>Decode is serial</strong>
            <span>Output arrives one token at a time.</span>
          </div>
        </div>
      </div>
    </figure>
  );
}
