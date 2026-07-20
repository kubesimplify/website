export default function Day5SpeculativeDecodingAnimation() {
  const tokens = ['the', 'right', 'runtime', 'wins'];

  return (
    <figure className="day5-specdecode" aria-labelledby="day5-specdecode-title">
      <style dangerouslySetInnerHTML={{ __html: `
        .day5-specdecode {
          margin: 2rem 0;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(118, 185, 0, 0.08)),
            var(--bg-card);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }

        .day5-specdecode * {
          box-sizing: border-box;
        }

        .day5-specdecode__inner {
          padding: clamp(1rem, 3vw, 1.5rem);
        }

        .day5-specdecode__eyebrow {
          margin: 0 0 0.35rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .day5-specdecode__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.2;
        }

        .day5-specdecode__subtitle {
          max-width: 46rem;
          margin: 0.55rem 0 1.35rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .day5-specdecode__stage {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px),
            color-mix(in srgb, var(--bg-elevated) 86%, transparent);
          background-size: 42px 42px;
        }

        .day5-specdecode__panel {
          min-width: 0;
          padding: 0.95rem;
          border: 1px solid var(--border-medium);
          border-radius: 8px;
          background: var(--bg-card);
          overflow: hidden;
        }

        .day5-specdecode__panel h4 {
          margin: 0 0 0.55rem;
          color: var(--text-primary);
          font-size: 0.9rem;
          font-weight: 950;
          line-height: 1.25;
        }

        .day5-specdecode__panel p {
          margin: 0 0 0.8rem;
          color: var(--text-secondary);
          font-size: 0.78rem;
          line-height: 1.45;
        }

        .day5-specdecode__slowline {
          display: grid;
          gap: 0.45rem;
          padding: 0.75rem;
          border: 1px solid color-mix(in srgb, #f59e0b 45%, var(--border-subtle));
          border-radius: 8px;
          background: color-mix(in srgb, #f59e0b 8%, var(--bg-card));
        }

        .day5-specdecode__slowtoken {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 5.2rem;
          gap: 0.55rem;
          align-items: center;
          min-height: 2rem;
        }

        .day5-specdecode__slowtoken span,
        .day5-specdecode__draft-token {
          display: grid;
          place-items: center;
          min-height: 1.8rem;
          border: 1px solid color-mix(in srgb, var(--token-color) 52%, var(--border-subtle));
          border-radius: 7px;
          background: color-mix(in srgb, var(--token-color) 13%, var(--bg-card));
          color: var(--text-primary);
          font-size: 0.72rem;
          font-weight: 900;
        }

        .day5-specdecode__slowbar {
          position: relative;
          height: 0.5rem;
          border-radius: 999px;
          background: color-mix(in srgb, #f59e0b 18%, var(--bg-card));
          overflow: hidden;
        }

        .day5-specdecode__slowbar::before {
          content: '';
          position: absolute;
          inset: 0;
          width: 35%;
          border-radius: inherit;
          background: linear-gradient(90deg, transparent, #f59e0b, transparent);
          animation: day5SlowRead 2.2s linear infinite;
        }

        .day5-specdecode__drafts {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.4rem;
          margin-bottom: 0.7rem;
        }

        .day5-specdecode__draft-token {
          --token-color: #a855f7;
          opacity: 0;
          transform: translateY(0.35rem);
          animation: day5DraftIn 4.8s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.14s);
        }

        .day5-specdecode__verify {
          position: relative;
          display: grid;
          place-items: center;
          min-height: 4.7rem;
          border: 1px solid color-mix(in srgb, var(--accent) 50%, var(--border-subtle));
          border-radius: 8px;
          background:
            radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 62%),
            color-mix(in srgb, var(--accent) 6%, var(--bg-card));
          overflow: hidden;
        }

        .day5-specdecode__verify strong {
          color: var(--text-primary);
          font-size: 0.86rem;
          font-weight: 950;
          text-align: center;
        }

        .day5-specdecode__verify::before {
          content: '';
          position: absolute;
          inset: auto 12% 0.85rem;
          height: 0.55rem;
          border-radius: 999px;
          background: color-mix(in srgb, var(--accent) 15%, var(--bg-card));
          overflow: hidden;
        }

        .day5-specdecode__accepted {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.4rem;
          margin-top: 0.7rem;
        }

        .day5-specdecode__accepted span {
          display: grid;
          place-items: center;
          min-height: 1.75rem;
          border: 1px solid color-mix(in srgb, #22c55e 54%, var(--border-subtle));
          border-radius: 7px;
          background: color-mix(in srgb, #22c55e 14%, var(--bg-card));
          color: var(--text-primary);
          font-size: 0.68rem;
          font-weight: 900;
          opacity: 0;
          animation: day5Accept 4.8s ease-in-out infinite;
          animation-delay: calc(1.15s + var(--i) * 0.08s);
        }

        .day5-specdecode__note {
          margin: 0.85rem 0 0;
          color: var(--text-secondary);
          font-size: 0.82rem;
          line-height: 1.45;
        }

        @keyframes day5SlowRead {
          0% { transform: translateX(-110%); }
          100% { transform: translateX(310%); }
        }

        @keyframes day5DraftIn {
          0%, 18% { opacity: 0; transform: translateY(0.35rem); }
          32%, 72% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-0.25rem); }
        }

        @keyframes day5Accept {
          0%, 40% { opacity: 0; transform: scale(0.92); }
          52%, 82% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.96); }
        }

        @media (max-width: 760px) {
          .day5-specdecode__stage {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .day5-specdecode__slowbar::before,
          .day5-specdecode__draft-token,
          .day5-specdecode__accepted span {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            opacity: 1;
          }
        }
      ` }} />

      <div className="day5-specdecode__inner">
        <p className="day5-specdecode__eyebrow">Speculative decoding</p>
        <h3 className="day5-specdecode__title" id="day5-specdecode-title">
          The big model can verify more than one guessed token
        </h3>
        <p className="day5-specdecode__subtitle">
          Normal decode asks the big model for one token at a time. Speculative decoding uses a cheap guesser, or native MTP heads, to propose several tokens and lets the big model verify them together.
        </p>

        <div className="day5-specdecode__stage">
          <div className="day5-specdecode__panel">
            <h4>Normal decode</h4>
            <p>One expensive memory read produces one output token. Simple, reliable, but bandwidth-bound.</p>
            <div className="day5-specdecode__slowline">
              {tokens.map((token, index) => (
                <div key={token} className="day5-specdecode__slowtoken">
                  <div className="day5-specdecode__slowbar" />
                  <span style={{ '--token-color': index % 2 ? '#38bdf8' : '#f59e0b' }}>{token}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="day5-specdecode__panel">
            <h4>Speculative path</h4>
            <p>The draft path guesses ahead. The big model checks the proposed tokens in one larger pass.</p>
            <div className="day5-specdecode__drafts" aria-label="Draft tokens">
              {tokens.map((token, index) => (
                <span key={token} className="day5-specdecode__draft-token" style={{ '--i': index }}>
                  {token}
                </span>
              ))}
            </div>
            <div className="day5-specdecode__verify">
              <strong>target model verifies batch</strong>
            </div>
            <div className="day5-specdecode__accepted" aria-label="Accepted tokens">
              {tokens.map((token, index) => (
                <span key={token} style={{ '--i': index }}>
                  keep {index + 1}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="day5-specdecode__note">
          The catch: it only helps when the draft guesses are often accepted. Wrong drafter, wrong checkpoint, or low acceptance rate can make it slower.
        </p>
      </div>
    </figure>
  );
}
