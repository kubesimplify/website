const gpus = [0, 1, 2, 3];
const PER_GPU = 32;

export default function MoeExpertRoutingAnimation() {
  return (
    <figure className="moeroute" aria-labelledby="moeroute-title">
      <style>{`
        .moeroute {
          margin: 2rem 0;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(5, 202, 255, 0.08)),
            var(--bg-card);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }

        .moeroute * { box-sizing: border-box; }
        .moeroute__inner { padding: clamp(1rem, 3vw, 1.5rem); }

        .moeroute__eyebrow {
          margin: 0 0 0.35rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .moeroute__title {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          line-height: 1.2;
        }

        .moeroute__subtitle {
          max-width: 46rem;
          margin: 0.55rem 0 1.35rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .moeroute__stage {
          display: grid;
          gap: 0.8rem;
          padding: 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background:
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px),
            color-mix(in srgb, var(--bg-elevated) 86%, transparent);
          background-size: 42px 42px;
        }

        .moeroute__token {
          padding: 0.55rem 0.7rem;
          border: 1px dashed color-mix(in srgb, var(--accent) 50%, var(--border-medium));
          border-radius: 8px;
          background: color-mix(in srgb, var(--accent) 8%, var(--bg-card));
          color: var(--text-primary);
          font-size: 0.78rem;
          font-weight: 900;
          text-align: center;
        }

        .moeroute__token em {
          display: block;
          margin-top: 0.15rem;
          color: var(--text-muted);
          font-size: 0.65rem;
          font-style: normal;
          font-weight: 800;
        }

        .moeroute__router {
          padding: 0.45rem;
          border: 1px solid color-mix(in srgb, #a855f7 45%, var(--border-subtle));
          border-radius: 6px;
          background: color-mix(in srgb, #a855f7 9%, var(--bg-card));
          color: color-mix(in srgb, #a855f7 85%, var(--text-primary));
          font-size: 0.72rem;
          font-weight: 950;
          text-align: center;
        }

        .moeroute__gpus {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.55rem;
        }

        .moeroute__gpu {
          min-width: 0;
          padding: 0.55rem;
          border: 1px solid color-mix(in srgb, var(--c) 42%, var(--border-subtle));
          border-radius: 7px;
          background: color-mix(in srgb, var(--c) 6%, var(--bg-card));
        }

        .moeroute__gpu-head {
          margin-bottom: 0.4rem;
          color: var(--text-primary);
          font-size: 0.72rem;
          font-weight: 950;
        }

        .moeroute__gpu-head em {
          display: block;
          color: var(--text-muted);
          font-size: 0.58rem;
          font-style: normal;
          font-weight: 800;
        }

        .moeroute__experts {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 2px;
        }

        .moeroute__exp {
          aspect-ratio: 1;
          border-radius: 2px;
          background: color-mix(in srgb, var(--c) 16%, var(--bg-elevated));
        }

        .moeroute__exp[data-hot='yes'] {
          background: color-mix(in srgb, var(--c) 78%, transparent);
          animation: moeFire 4s ease-in-out infinite;
          animation-delay: var(--d);
        }

        .moeroute__count {
          margin-top: 0.4rem;
          color: var(--text-secondary);
          font-size: 0.62rem;
          font-weight: 850;
          text-align: center;
        }

        .moeroute__note {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.55rem;
        }

        .moeroute__cell {
          min-width: 0;
          padding: 0.65rem;
          border: 1px solid var(--border-subtle);
          border-radius: 7px;
          background: var(--bg-card);
        }

        .moeroute__k {
          display: block;
          color: var(--text-muted);
          font-size: 0.58rem;
          font-weight: 900;
          text-transform: uppercase;
        }

        .moeroute__v {
          display: block;
          margin-top: 0.18rem;
          color: var(--accent);
          font-size: 0.9rem;
          font-weight: 950;
        }

        .moeroute__d {
          display: block;
          margin-top: 0.22rem;
          color: var(--text-muted);
          font-size: 0.63rem;
          line-height: 1.35;
        }

        .moeroute figcaption {
          padding: 0 1.5rem 1.15rem;
          color: var(--text-muted);
          font-size: 0.78rem;
          line-height: 1.45;
        }

        @keyframes moeFire {
          0%, 100% { opacity: 0.25; transform: scale(0.9); }
          35%, 55% { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 700px) {
          .moeroute__gpus { grid-template-columns: 1fr 1fr; }
          .moeroute__note { grid-template-columns: 1fr; }
        }

        @media (prefers-reduced-motion: reduce) {
          .moeroute__exp[data-hot='yes'] {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      <div className="moeroute__inner">
        <p className="moeroute__eyebrow">Expert routing animation</p>
        <h3 className="moeroute__title" id="moeroute-title">
          Why a 235B model only does 22B of work per token
        </h3>
        <p className="moeroute__subtitle">
          Every layer of this model has 128 small expert networks, and a tiny router picks just 8 of
          them for each token. The other 120 sit still. That is the whole trick of a mixture of
          experts: you pay for 235B parameters in memory, but only about 22B of arithmetic per token.
        </p>

        <div className="moeroute__stage" role="img" aria-label="A token being routed to 8 of 128 experts spread over 4 GPUs">
          <div className="moeroute__token">
            one token arrives
            <em>it has already been through attention for this layer</em>
          </div>

          <div className="moeroute__router">router scores all 128 experts, keeps the top 8</div>

          <div className="moeroute__gpus">
            {gpus.map((gpu) => {
              // 2 of this GPU's 32 experts are picked, so 8 across 4 GPUs
              const hot = [3 + gpu, 18 + ((gpu * 5) % 10)];
              return (
                <div
                  className="moeroute__gpu"
                  key={gpu}
                  style={{ '--c': gpu % 2 === 0 ? '#a855f7' : '#0098cc' }}
                >
                  <p className="moeroute__gpu-head">
                    GPU {gpu}
                    <em>experts {gpu * PER_GPU}-{gpu * PER_GPU + PER_GPU - 1}</em>
                  </p>
                  <div className="moeroute__experts" aria-hidden="true">
                    {Array.from({ length: PER_GPU }, (_, i) => (
                      <div
                        className="moeroute__exp"
                        key={i}
                        data-hot={hot.includes(i) ? 'yes' : 'no'}
                        style={{ '--d': `${gpu * 0.25}s` }}
                      />
                    ))}
                  </div>
                  <p className="moeroute__count">2 of 32 firing</p>
                </div>
              );
            })}
          </div>

          <div className="moeroute__note">
            <div className="moeroute__cell">
              <span className="moeroute__k">In memory</span>
              <span className="moeroute__v">235B params</span>
              <span className="moeroute__d">
                All 128 experts per layer must be resident, which is why the model is big
              </span>
            </div>
            <div className="moeroute__cell">
              <span className="moeroute__k">Active per token</span>
              <span className="moeroute__v">22B params</span>
              <span className="moeroute__d">
                Only the 8 chosen experts do arithmetic, so it runs like a much smaller model
              </span>
            </div>
            <div className="moeroute__cell">
              <span className="moeroute__k">What this costs you</span>
              <span className="moeroute__v">a network hop</span>
              <span className="moeroute__d">
                With expert parallelism the token travels to whichever GPU owns its expert, then the
                answer travels back
              </span>
            </div>
          </div>
        </div>
      </div>
      <figcaption>
        Counts are from the model config: 128 experts per layer, 8 per token, 94 layers. Splitting 128
        experts over 4 GPUs gives 32 each, so on average 2 experts per GPU fire for any given token.
        That average is the catch, because routing is not guaranteed to be even.
      </figcaption>
    </figure>
  );
}
